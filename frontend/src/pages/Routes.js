import React, { useState, useEffect } from 'react';
import { routeAPI } from '../services/api';

const RoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [formData, setFormData] = useState({
        routeId: '',
        routeName: '',
        routeNumber: '',
        startPoint: { name: '', latitude: '', longitude: '' },
        endPoint: { name: '', latitude: '', longitude: '' },
        distance: '',
        estimatedDuration: '',
        color: '#3B82F6'
    });

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await routeAPI.getWithStats();
            setRoutes(response.data.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                startPoint: {
                    ...formData.startPoint,
                    latitude: parseFloat(formData.startPoint.latitude),
                    longitude: parseFloat(formData.startPoint.longitude)
                },
                endPoint: {
                    ...formData.endPoint,
                    latitude: parseFloat(formData.endPoint.latitude),
                    longitude: parseFloat(formData.endPoint.longitude)
                },
                distance: parseFloat(formData.distance) || 0,
                estimatedDuration: parseInt(formData.estimatedDuration) || 0
            };

            if (editingRoute) {
                await routeAPI.update(editingRoute._id, dataToSend);
            } else {
                await routeAPI.create(dataToSend);
            }
            fetchRoutes();
            closeModal();
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Error saving route. Please check all fields and try again.');
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData({
            routeId: route.routeId,
            routeName: route.routeName,
            routeNumber: route.routeNumber,
            startPoint: {
                name: route.startPoint.name,
                latitude: route.startPoint.latitude.toString(),
                longitude: route.startPoint.longitude.toString()
            },
            endPoint: {
                name: route.endPoint.name,
                latitude: route.endPoint.latitude.toString(),
                longitude: route.endPoint.longitude.toString()
            },
            distance: route.distance?.toString() || '',
            estimatedDuration: route.estimatedDuration?.toString() || '',
            color: route.color || '#3B82F6'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await routeAPI.delete(id);
                fetchRoutes();
            } catch (error) {
                console.error('Error deleting route:', error);
            }
        }
    };

    const openAddModal = () => {
        setEditingRoute(null);
        setFormData({
            routeId: '',
            routeName: '',
            routeNumber: '',
            startPoint: { name: '', latitude: '', longitude: '' },
            endPoint: { name: '', latitude: '', longitude: '' },
            distance: '',
            estimatedDuration: '',
            color: '#3B82F6'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRoute(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading routes...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Routes</h1>
                    <p className="page-subtitle">Manage transit routes and stops</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Route
                </button>
            </div>

            {routes.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {routes.map((route) => (
                        <div key={route._id} className="card" style={{ position: 'relative' }}>
                            {/* Color indicator */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: route.color || '#3B82F6',
                                borderRadius: '16px 16px 0 0'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{
                                            background: route.color || '#3B82F6',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {route.routeNumber}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{route.routeId}</span>
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{route.routeName}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-icon" onClick={() => handleEdit(route)} title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-icon" onClick={() => handleDelete(route._id)} style={{ color: '#ef4444' }} title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Route info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>Start Point</p>
                                        <p style={{ fontSize: '14px', color: '#f8fafc' }}>{route.startPoint.name}</p>
                                    </div>
                                </div>

                                <div style={{ borderLeft: '2px dashed #334155', marginLeft: '4px', height: '20px' }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>End Point</p>
                                        <p style={{ fontSize: '14px', color: '#f8fafc' }}>{route.endPoint.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                marginTop: '20px',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{route.distance || 0} km</p>
                                    <p style={{ fontSize: '11px', color: '#64748b' }}>Distance</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{route.estimatedDuration || 0} min</p>
                                    <p style={{ fontSize: '11px', color: '#64748b' }}>Duration</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{route.activeVehicles || 0}</p>
                                    <p style={{ fontSize: '11px', color: '#64748b' }}>Vehicles</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="6" cy="6" r="3" />
                                <circle cx="6" cy="18" r="3" />
                                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                                <line x1="8.12" y1="8.12" x2="12" y2="12" />
                            </svg>
                        </div>
                        <h3 className="empty-state-title">No Routes Yet</h3>
                        <p className="empty-state-description">Create your first route to start tracking vehicles.</p>
                        <button className="btn btn-primary" onClick={openAddModal}>Create Route</button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingRoute ? 'Edit Route' : 'Create New Route'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Route ID</label>
                                    <input
                                        type="text"
                                        name="routeId"
                                        className="form-input"
                                        placeholder="RT001"
                                        value={formData.routeId}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Route Number</label>
                                    <input
                                        type="text"
                                        name="routeNumber"
                                        className="form-input"
                                        placeholder="101"
                                        value={formData.routeNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <input
                                        type="color"
                                        name="color"
                                        className="form-input"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        style={{ padding: '4px', height: '42px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Route Name</label>
                                <input
                                    type="text"
                                    name="routeName"
                                    className="form-input"
                                    placeholder="Central Station - Tech Park"
                                    value={formData.routeName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Start Point */}
                            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>Start Point</p>
                                <div className="form-group">
                                    <label className="form-label">Location Name</label>
                                    <input
                                        type="text"
                                        name="startPoint.name"
                                        className="form-input"
                                        placeholder="Central Station"
                                        value={formData.startPoint.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="startPoint.latitude"
                                            className="form-input"
                                            placeholder="28.6139"
                                            value={formData.startPoint.latitude}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="startPoint.longitude"
                                            className="form-input"
                                            placeholder="77.2090"
                                            value={formData.startPoint.longitude}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* End Point */}
                            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>End Point</p>
                                <div className="form-group">
                                    <label className="form-label">Location Name</label>
                                    <input
                                        type="text"
                                        name="endPoint.name"
                                        className="form-input"
                                        placeholder="Tech Park"
                                        value={formData.endPoint.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="endPoint.latitude"
                                            className="form-input"
                                            placeholder="28.5355"
                                            value={formData.endPoint.latitude}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="endPoint.longitude"
                                            className="form-input"
                                            placeholder="77.3910"
                                            value={formData.endPoint.longitude}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="distance"
                                        className="form-input"
                                        placeholder="25.5"
                                        value={formData.distance}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Est. Duration (minutes)</label>
                                    <input
                                        type="number"
                                        name="estimatedDuration"
                                        className="form-input"
                                        placeholder="45"
                                        value={formData.estimatedDuration}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingRoute ? 'Update Route' : 'Create Route'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutesPage;
