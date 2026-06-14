import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * PublicLayout wraps unauthenticated public routes such as portfolio verification.
 * Renders a consistent light grid background.
 */
export default function PublicLayout() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-void text-foreground">
            {/* Premium Light Background with subtle Gradient */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                <Outlet />
            </div>
        </div >
    );
}
