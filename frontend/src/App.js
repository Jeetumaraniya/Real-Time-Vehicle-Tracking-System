import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import RoutesPage from './pages/Routes';
import LiveTracking from './pages/LiveTracking';
import DriverDashboard from './pages/DriverDashboard';
import Sidebar from './components/Sidebar';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/tracking" replace />;
    }

    return children;
};

// Layout with Sidebar
const AppLayout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

function AppContent() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Public Tracking Route */}
            <Route
                path="/tracking"
                element={
                    <AppLayout>
                        <LiveTracking />
                    </AppLayout>
                }
            />

            {/* Protected Admin Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute adminOnly>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vehicles"
                element={
                    <ProtectedRoute adminOnly>
                        <AppLayout>
                            <Vehicles />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/routes"
                element={
                    <ProtectedRoute adminOnly>
                        <AppLayout>
                            <RoutesPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/driver-dashboard"
                element={
                    <ProtectedRoute>
                        <DriverDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/tracking" replace />} />
            <Route path="*" element={<Navigate to="/tracking" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
