import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, vehicleAPI } from '../services/api';
import io from 'socket.io-client';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeVehicles: 0,
        totalRoutes: 0,
        totalDrivers: 0
    });
    const [recentVehicles, setRecentVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Connect to socket
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        // Listen for incidents
        socket.on('vehicleIncident', (data) => {
            // For now, using browser alert or simple notification logic
            // Ideally this should be a toast
            if (data.incidentStatus !== 'none') {
                alert(`🚨 ALERT: Vehicle Reported ${data.incidentStatus.toUpperCase()}\nDescription: ${data.incidentDescription}`);
                // Refresh dashboard data to reflect status change
                fetchDashboardData();
            } else {
                // Incident resolved
                fetchDashboardData();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, vehiclesRes] = await Promise.all([
                statsAPI.getDashboardStats(),
                vehicleAPI.getAll()
            ]);

            setStats(statsRes.data.data);
            setRecentVehicles(vehiclesRes.data.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status, incidentStatus) => {
        if (incidentStatus && incidentStatus !== 'none') {
            const incidentBadges = {
                'accident': 'badge-error',
                'medical_emergency': 'badge-error',
                'puncture': 'badge-warning',
                'breakdown': 'badge-warning',
                'traffic_heavy': 'badge-warning',
                'diversion': 'badge-info',
                'weather_bad': 'badge-info',
                'other': 'badge-neutral'
            };
            return incidentBadges[incidentStatus] || 'badge-warning';
        }

        const badges = {
            'active': 'badge-success',
            'en-route': 'badge-info',
            'inactive': 'badge-neutral',
            'maintenance': 'badge-warning'
        };
        return badges[status] || 'badge-neutral';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's your fleet overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div className="stat-value">{stats.totalVehicles}</div>
                    <div className="stat-label">Total Vehicles</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="stat-value">{stats.activeVehicles}</div>
                    <div className="stat-label">Active Now</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="6" cy="6" r="3" />
                            <circle cx="6" cy="18" r="3" />
                            <line x1="20" y1="4" x2="8.12" y2="15.88" />
                            <line x1="14.47" y1="14.48" x2="20" y2="20" />
                            <line x1="8.12" y1="8.12" x2="12" y2="12" />
                        </svg>
                    </div>
                    <div className="stat-value">{stats.totalRoutes}</div>
                    <div className="stat-label">Active Routes</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="stat-value">{stats.totalDrivers}</div>
                    <div className="stat-label">Registered Drivers</div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Recent Vehicles */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Vehicles</h3>
                        <Link to="/vehicles" className="btn btn-secondary btn-sm">
                            View All
                        </Link>
                    </div>

                    {recentVehicles.length > 0 ? (
                        <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVehicles.map((vehicle) => (
                                        <tr key={vehicle._id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{vehicle.registrationNumber}</div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{vehicle.type}</div>
                                                </div>
                                            </td>
                                            <td>{vehicle.route?.routeName || 'Not assigned'}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(vehicle.status, vehicle.incidentStatus)}`}>
                                                    <span className={`status-dot ${vehicle.status}`}></span>
                                                    {vehicle.incidentStatus !== 'none' ? vehicle.incidentStatus.replace('_', ' ').toUpperCase() : vehicle.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="text-muted">No vehicles found</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/vehicles" className="btn btn-primary" style={{ width: '100%' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add New Vehicle
                        </Link>

                        <Link to="/routes" className="btn btn-secondary" style={{ width: '100%' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Create New Route
                        </Link>

                        <Link to="/tracking" className="btn btn-secondary" style={{ width: '100%' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                            </svg>
                            View Live Map
                        </Link>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="status-dot active"></span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>System Status: Operational</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                            All services running normally. Real-time tracking active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
