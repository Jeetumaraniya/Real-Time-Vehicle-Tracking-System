import React, { useState, useEffect } from 'react';
import { vehicleAPI, routeAPI } from '../services/api';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        vehicleId: '',
        registrationNumber: '',
        type: 'bus',
        capacity: 50,
        route: '',
        status: 'inactive'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vehiclesRes, routesRes] = await Promise.all([
                vehicleAPI.getAll(),
                routeAPI.getAll()
            ]);
            setVehicles(vehiclesRes.data.data);
            setRoutes(routesRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.route) delete dataToSend.route;

            if (editingVehicle) {
                await vehicleAPI.update(editingVehicle._id, dataToSend);
            } else {
                await vehicleAPI.create(dataToSend);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error saving vehicle. Please try again.');
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleId: vehicle.vehicleId,
            registrationNumber: vehicle.registrationNumber,
            type: vehicle.type,
            capacity: vehicle.capacity,
            route: vehicle.route?._id || '',
            status: vehicle.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await vehicleAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting vehicle:', error);
            }
        }
    };

    const handleResolveIncident = async (id) => {
        if (window.confirm('Mark this incident as resolved and return vehicle to active status?')) {
            try {
                await vehicleAPI.reportIncident(id, { incidentStatus: 'none', incidentDescription: '' });
                fetchData();
            } catch (error) {
                console.error('Error resolving incident:', error);
                alert('Failed to resolve incident.');
            }
        }
    };

    const openAddModal = () => {
        setEditingVehicle(null);
        setFormData({
            vehicleId: '',
            registrationNumber: '',
            type: 'bus',
            capacity: 50,
            route: '',
            status: 'inactive'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVehicle(null);
    };

    const getStatusBadge = (status, incidentStatus) => {
        if (incidentStatus && incidentStatus !== 'none') {
            return 'badge-warning'; // Or more specific colors if you have CSS classes for them
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
                <p className="loading-text">Loading vehicles...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Vehicles</h1>
                    <p className="page-subtitle">Manage your fleet of vehicles</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Vehicle
                </button>
            </div>

            {vehicles.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Vehicle ID</th>
                                <th>Registration</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle._id}>
                                    <td style={{ fontWeight: '600' }}>{vehicle.vehicleId}</td>
                                    <td>{vehicle.registrationNumber}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{vehicle.type}</td>
                                    <td>{vehicle.capacity} seats</td>
                                    <td>{vehicle.route?.routeName || <span className="text-muted">Not assigned</span>}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(vehicle.status, vehicle.incidentStatus)}`}>
                                            <span className={`status-dot ${vehicle.status}`}></span>
                                            {vehicle.incidentStatus !== 'none' ? vehicle.incidentStatus.replace('_', ' ').toUpperCase() : vehicle.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-icon" onClick={() => handleEdit(vehicle)} title="Edit">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            {vehicle.incidentStatus !== 'none' && (
                                                <button className="btn btn-icon" onClick={() => handleResolveIncident(vehicle._id)} title="Resolve Incident" style={{ color: '#10b981' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button className="btn btn-icon" onClick={() => handleDelete(vehicle._id)} title="Delete" style={{ color: '#ef4444' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                        </div>
                        <h3 className="empty-state-title">No Vehicles Yet</h3>
                        <p className="empty-state-description">Get started by adding your first vehicle to the fleet.</p>
                        <button className="btn btn-primary" onClick={openAddModal}>Add Vehicle</button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Vehicle ID</label>
                                <input
                                    type="text"
                                    name="vehicleId"
                                    className="form-input"
                                    placeholder="VH001"
                                    value={formData.vehicleId}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Registration Number</label>
                                <input
                                    type="text"
                                    name="registrationNumber"
                                    className="form-input"
                                    placeholder="DL-01-AB-1234"
                                    value={formData.registrationNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        name="type"
                                        className="form-input form-select"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="bus">Bus</option>
                                        <option value="minibus">Minibus</option>
                                        <option value="metro">Metro</option>
                                        <option value="tram">Tram</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        className="form-input"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign Route</label>
                                <select
                                    name="route"
                                    className="form-input form-select"
                                    value={formData.route}
                                    onChange={handleInputChange}
                                >
                                    <option value="">No Route Assigned</option>
                                    {routes.map((route) => (
                                        <option key={route._id} value={route._id}>
                                            {route.routeNumber} - {route.routeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    className="form-input form-select"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="inactive">Inactive</option>
                                    <option value="active">Active</option>
                                    <option value="en-route">En Route</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
