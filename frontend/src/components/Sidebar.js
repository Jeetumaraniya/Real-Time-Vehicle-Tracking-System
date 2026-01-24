import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#grad1)" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#grad1)" />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
                <h1>TransitTracker</h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {/* Public - Live Tracking */}
                <NavLink
                    to="/tracking"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    <span>Live Map</span>
                </NavLink>

                {/* Admin Only Routes */}
                {isAdmin && (
                    <>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/vehicles"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            <span>Vehicles</span>
                        </NavLink>

                        <NavLink
                            to="/routes"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="6" cy="6" r="3" />
                                <circle cx="6" cy="18" r="3" />
                                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                                <line x1="8.12" y1="8.12" x2="12" y2="12" />
                            </svg>
                            <span>Routes</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {isAuthenticated ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            marginBottom: '8px'
                        }}>
                            <p style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '500' }}>
                                {user?.username}
                            </p>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                {user?.role === 'admin' ? 'Administrator' : 'Driver'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="nav-item"
                            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <NavLink
                        to="/login"
                        className="nav-item"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span>Login</span>
                    </NavLink>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
