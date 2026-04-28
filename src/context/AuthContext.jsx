import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    formatSupabaseError,
    isSupabaseConfigured,
    supabase,
} from '../lib/supabase';
import { SEED_USERS } from '../lib/seedData';

const AuthContext = createContext(null);
const FAKE_SESSION_KEY = 'vsarp_fake_session';
const USERS_STORAGE_KEY = 'vsarp_users';
const ACCOUNT_STATUS_MESSAGES = {
    pending: 'Your account is waiting for administrator approval.',
    rejected: 'Your account request was rejected. Please contact the administrator.',
};

function createUserSession(source = {}) {
    return {
        id: source.id,
        email: source.email || '',
        role: source.role || 'student',
        name: source.full_name || source.name || 'User',
        student_id: source.student_id || null,
        department: source.department || 'General',
        status: source.status || 'active',
        skills: source.skills || [],
        phone: source.phone || '',
    };
}

function readMockSession() {
    const storedSession = localStorage.getItem(FAKE_SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedSession);
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (parsed.id && uuidRegex.test(parsed.id)) {
            return parsed;
        }
    } catch (error) {
        console.error('Failed to parse saved session', error);
    }

    localStorage.removeItem(FAKE_SESSION_KEY);
    return null;
}

function loadMockUsers() {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
}

function createAccountStatusError(status = 'pending') {
    return new Error(
        ACCOUNT_STATUS_MESSAGES[status] ||
            'Your account is not active yet. Please contact the administrator.'
    );
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() =>
        isSupabaseConfigured ? null : readMockSession()
    );
    const [loading, setLoading] = useState(isSupabaseConfigured);

    const persistMockSession = useCallback((sessionUser) => {
        setUser(sessionUser);
        localStorage.setItem(FAKE_SESSION_KEY, JSON.stringify(sessionUser));
    }, []);

    const hydrateSupabaseUser = useCallback(async (authUser) => {
        if (!authUser) {
            return null;
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (error) {
            throw formatSupabaseError(error);
        }

        return createUserSession({
            id: authUser.id,
            email: authUser.email,
            role: profile?.role || authUser.user_metadata?.role || 'student',
            full_name:
                profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
            student_id:
                profile?.student_id || authUser.user_metadata?.student_id || null,
            department:
                profile?.department || authUser.user_metadata?.department || 'General',
            status: profile?.status || authUser.user_metadata?.status || 'pending',
            skills: profile?.skills || [],
            phone: profile?.phone || '',
        });
    }, []);

    const syncSupabaseSession = useCallback(
        async (authUser, { requireActive = false, clearOnMissing = true } = {}) => {
            if (!authUser) {
                if (clearOnMissing) {
                    setUser(null);
                }
                return null;
            }

            const sessionUser = await hydrateSupabaseUser(authUser);

            if (requireActive && sessionUser.status !== 'active') {
                setUser(null);
                await supabase.auth.signOut();
                throw createAccountStatusError(sessionUser.status);
            }

            setUser(sessionUser);
            return sessionUser;
        },
        [hydrateSupabaseUser]
    );

    useEffect(() => {
        if (!isSupabaseConfigured) {
            return undefined;
        }

        let mounted = true;

        const initializeSession = async () => {
            setLoading(true);
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!mounted) {
                    return;
                }

                if (session?.user) {
                    await syncSupabaseSession(session.user, { requireActive: true });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to initialize Supabase session', error);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) {
                return;
            }

            if (session?.user) {
                syncSupabaseSession(session.user, { requireActive: true }).catch(
                    (error) => {
                        console.error('Supabase auth state sync failed', error);
                    }
                );
            } else {
                setUser(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [syncSupabaseSession]);

    const register = useCallback(
        async (userData) => {
            if (!isSupabaseConfigured) {
                const existingUsers = loadMockUsers();

                if (existingUsers.find((mockUser) => mockUser.email === userData.email)) {
                    throw new Error('User already exists');
                }

                const newUser = {
                    id: crypto.randomUUID(),
                    email: userData.email,
                    full_name: userData.name,
                    role: userData.role,
                    student_id: userData.student_id || null,
                    department: userData.department || 'General',
                    status: 'pending',
                    skills: [],
                    created_at: new Date().toISOString(),
                };

                const updatedUsers = [...existingUsers, newUser];
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
                return { user: newUser };
            }

            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name,
                        role: userData.role,
                        student_id: userData.student_id || null,
                        department: userData.department || 'General',
                    },
                },
            });

            if (error) {
                throw formatSupabaseError(error);
            }

            if (data.session) {
                await supabase.auth.signOut();
                setUser(null);
            }

            return data;
        },
        []
    );

    const login = useCallback(
        async (email, password) => {
            if (!isSupabaseConfigured) {
                const existingUsers = loadMockUsers();
                const foundUser = existingUsers.find((mockUser) => mockUser.email === email);

                if (foundUser) {
                    if (foundUser.status !== 'active') {
                        throw createAccountStatusError(foundUser.status);
                    }

                    const sessionUser = createUserSession(foundUser);
                    persistMockSession(sessionUser);
                    return { user: sessionUser };
                }

                // Check seed users
                const seedUser = SEED_USERS.find(u => u.email === email);
                if (seedUser) {
                    const sessionUser = createUserSession(seedUser);
                    persistMockSession(sessionUser);
                    return { user: sessionUser };
                }

                let role = 'student';
                if (email.toLowerCase().includes('faculty')) role = 'faculty';
                if (email.toLowerCase().includes('admin')) role = 'admin';
                if (email.toLowerCase().includes('hod')) role = 'hod';
                if (email.toLowerCase().includes('placement')) role = 'placement_cell';

                const mockUser = createUserSession({
                    id: crypto.randomUUID(),
                    email,
                    role,
                    full_name: `${role.charAt(0).toUpperCase()}${role.slice(1)} User`,
                    student_id: role === 'student' ? 'STU-DIRECT-001' : null,
                    department: 'Computer Science',
                });

                persistMockSession(mockUser);
                return { user: mockUser };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw formatSupabaseError(error);
            }

            const sessionUser = await syncSupabaseSession(data.user, {
                requireActive: true,
                clearOnMissing: false,
            });
            return { user: sessionUser };
        },
        [persistMockSession, syncSupabaseSession]
    );

    const logout = useCallback(async () => {
        if (!isSupabaseConfigured) {
            localStorage.removeItem(FAKE_SESSION_KEY);
            setUser(null);
            return;
        }

        await supabase.auth.signOut();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            register,
            isSupabaseConfigured,
        }),
        [loading, login, logout, register, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
