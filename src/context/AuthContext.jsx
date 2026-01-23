import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const FAKE_SESSION_KEY = 'vsarp_fake_session';

    const [user, setUser] = useState(() => {
        const storedSession = localStorage.getItem(FAKE_SESSION_KEY);
        if (storedSession) {
            try {
                const parsed = JSON.parse(storedSession);
                // Validate UUID format to prevent DB errors
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (parsed.id && uuidRegex.test(parsed.id)) {
                    return parsed;
                }
                // If invalid ID found, clear it and fall through to default
                localStorage.removeItem(FAKE_SESSION_KEY);
            } catch (e) {
                console.error("Failed to parse fake session", e);
                localStorage.removeItem(FAKE_SESSION_KEY);
            }
        }
        // DEFAULT AUTO-LOGIN (DEV MODE)
        const devUser = {
            id: crypto.randomUUID(), // Generates a valid UUID v4
            email: 'dev@student.edu',
            role: 'student',
            name: 'Dev Student',
            student_id: 'DEV-001',
            department: 'Computer Science'
        };
        // Persist the new valid dev user immediately so next refresh uses it
        localStorage.setItem(FAKE_SESSION_KEY, JSON.stringify(devUser));
        return devUser;
    });

    // Loading is effectively instant with local storage sync, but keeping state API consistent
    const [loading] = useState(false);

    const register = async (userData) => {
        // Mock Registration
        const existingUsers = JSON.parse(localStorage.getItem('vsarp_users') || '[]');

        if (existingUsers.find(u => u.email === userData.email)) {
            throw new Error("User already exists");
        }

        const newUser = {
            id: crypto.randomUUID(),
            ...userData,
            status: 'active', // Auto-activate for now
            created_at: new Date().toISOString()
        };

        const updatedUsers = [...existingUsers, newUser];
        localStorage.setItem('vsarp_users', JSON.stringify(updatedUsers));

        // Auto-login after register
        const userObj = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.full_name, // Fix inconsistent naming if needed
            student_id: newUser.student_id,
            department: newUser.department
        };

        setUser(userObj);
        localStorage.setItem(FAKE_SESSION_KEY, JSON.stringify(userObj));

        return { user: newUser };
    };

    const login = async (email, _password) => { // eslint-disable-line no-unused-vars
        console.log("Direct Login Attempt:", email);
        // Silence unused warning while keeping signature

        // 1. Check if user exists in our mock 'database' (localStorage)
        const existingUsers = JSON.parse(localStorage.getItem('vsarp_users') || '[]');
        const foundUser = existingUsers.find(u => u.email === email);

        if (foundUser) {
            const userObj = {
                id: foundUser.id,
                email: foundUser.email,
                role: foundUser.role,
                name: foundUser.full_name || foundUser.name,
                student_id: foundUser.student_id,
                department: foundUser.department
            };
            setUser(userObj);
            localStorage.setItem(FAKE_SESSION_KEY, JSON.stringify(userObj));
            return { user: userObj };
        }

        // 2. If not found, create a temporary session based on email "hacks"
        let role = 'student';
        if (email.toLowerCase().includes('faculty')) role = 'faculty';
        if (email.toLowerCase().includes('admin')) role = 'admin';

        const mockUser = {
            id: crypto.randomUUID(),
            email: email,
            role: role,
            name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
            student_id: role === 'student' ? 'STU-DIRECT-001' : null,
            department: 'Computer Science', // Default
        };

        setUser(mockUser);
        localStorage.setItem(FAKE_SESSION_KEY, JSON.stringify(mockUser));
        return { user: mockUser };
    };

    const logout = async () => {
        localStorage.removeItem(FAKE_SESSION_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
