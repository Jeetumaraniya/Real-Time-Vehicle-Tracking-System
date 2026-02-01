import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [assignedVehicle, setAssignedVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [incidentProcessing, setIncidentProcessing] = useState(false);

    useEffect(() => {
        const fetchDriverVehicle = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/vehicles');
                const myVehicle = res.data.data.find(v => v.driver?._id === user.id || v.driver === user.id);

                if (myVehicle) {
                    setAssignedVehicle(myVehicle);
                } else {
                    setError('No vehicle assigned to your account. Please contact admin.');
                }
            } catch (err) {
                console.error('Error fetching vehicle', err);
                setError('Failed to load vehicle data.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDriverVehicle();
        }
    }, [user]);

    const reportIncident = async (type, description = '') => {
        if (!assignedVehicle) return;
        setIncidentProcessing(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const payload = {
                incidentStatus: type,
                incidentDescription: description
            };

            const res = await axios.put(
                `http://localhost:5000/api/vehicles/${assignedVehicle._id}/incident`,
                payload,
                config
            );

            setAssignedVehicle(res.data.data);
            alert(`Reported: ${type.replace('_', ' ').toUpperCase()}`);

        } catch (err) {
            console.error('Error reporting incident', err);
            alert('Failed to report incident. Try again.');
        } finally {
            setIncidentProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading driver profile...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Driver Dashboard</h1>
                    <p className="page-subtitle">Welcome, {user?.username}</p>
                </div>
                <button onClick={logout} className="btn btn-danger">
                    Logout
                </button>
            </div>

            {error && (
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 'var(--spacing-xl)' }}>
                    <p style={{ color: 'var(--color-danger)', margin: 0 }}>{error}</p>
                </div>
            )}

            {assignedVehicle ? (
                <div className="dashboard-grid">
                    {/* Vehicle Info Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Current Vehicle</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>Registration Number</p>
                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--color-text-primary)' }}>{assignedVehicle.registrationNumber}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>Route</p>
                                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>{assignedVehicle.route?.routeName || 'No Active Route'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>Current Status</p>
                                <span className={`badge ${assignedVehicle.incidentStatus === 'none' ? 'badge-success' : 'badge-warning'}`}>
                                    {assignedVehicle.incidentStatus === 'none' ? 'Normal Operation' : assignedVehicle.incidentStatus.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Incident Reporting Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Report Incident</h3>
                        </div>
                        <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-lg)' }}>Tap below to report an incident immediately.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <button
                                onClick={() => reportIncident('accident')}
                                className="btn btn-danger"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)' }}
                            >
                                🚨 Accident
                            </button>
                            <button
                                onClick={() => reportIncident('medical_emergency')}
                                className="btn btn-danger"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)' }}
                            >
                                🚑 Medical
                            </button>
                            <button
                                onClick={() => reportIncident('puncture')}
                                className="btn"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)', background: 'var(--color-warning)', color: 'white' }}
                            >
                                🔧 Puncture
                            </button>
                            <button
                                onClick={() => reportIncident('breakdown')}
                                className="btn"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)', background: 'var(--color-warning)', color: 'white' }}
                            >
                                ⚙️ Breakdown
                            </button>
                            <button
                                onClick={() => reportIncident('traffic_heavy')}
                                className="btn btn-secondary"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)' }}
                            >
                                🚦 Heavy Traffic
                            </button>
                            <button
                                onClick={() => reportIncident('diversion')}
                                className="btn btn-secondary"
                                disabled={incidentProcessing}
                                style={{ padding: 'var(--spacing-lg)', fontSize: 'var(--font-size-base)' }}
                            >
                                ↩️ Diversion
                            </button>
                        </div>

                        {assignedVehicle.incidentStatus !== 'none' && (
                            <button
                                onClick={() => reportIncident('none')}
                                className="btn"
                                disabled={incidentProcessing}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-lg)',
                                    fontSize: 'var(--font-size-lg)',
                                    background: 'var(--color-success)',
                                    color: 'white',
                                    fontWeight: '700'
                                }}
                            >
                                ✅ RESOLVED / BACK TO NORMAL
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <p className="text-muted">You are not currently assigned to any active vehicle.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
