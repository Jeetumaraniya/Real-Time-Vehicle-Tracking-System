import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { vehicleAPI, routeAPI } from '../services/api';
import socketService from '../services/socket';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom vehicle marker icon
const createVehicleIcon = (type = 'bus', color = '#3b82f6', isMoving = false) => {
    let iconSvg = '';

    // Select SVG based on vehicle type
    switch (type.toLowerCase()) {
        case 'metro':
        case 'train':
            iconSvg = `
                <path d="M4 15c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v9zm2-5h12v2H6v-2zm3-7h6v2H9V3z" fill="${color}" stroke="white" stroke-width="1.5"/>
                <circle cx="5.5" cy="18.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
                <circle cx="18.5" cy="18.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
            `;
            break;
        case 'tram':
            iconSvg = `
                <rect x="6" y="4" width="12" height="14" rx="2" fill="${color}" stroke="white" stroke-width="1.5"/>
                <line x1="12" y1="1" x2="12" y2="4" stroke="white" stroke-width="2"/>
                <line x1="8" y1="1" x2="16" y2="1" stroke="white" stroke-width="2"/>
                <circle cx="7" cy="19" r="2" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
                <circle cx="17" cy="19" r="2" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
            `;
            break;
        case 'minibus':
        case 'van':
            iconSvg = `
                <path d="M1 6c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v10H1V6zm3 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="${color}" stroke="white" stroke-width="1.5"/>
                <rect x="3" y="7" width="18" height="6" fill="rgba(255,255,255,0.3)"/>
            `;
            break;
        case 'car':
        case 'taxi':
            iconSvg = `
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" fill="${color}" stroke="white" stroke-width="1.5"/>
                <circle cx="7.5" cy="17.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
                <circle cx="16.5" cy="17.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
            `;
            break;
        case 'bus':
        default:
            iconSvg = `
                <rect x="2" y="4" width="20" height="14" rx="2" fill="${color}" stroke="white" stroke-width="1.5"/>
                <rect x="4" y="6" width="16" height="6" fill="rgba(255,255,255,0.5)"/>
                <line x1="2" y1="14" x2="22" y2="14" stroke="white" stroke-width="1"/>
                <circle cx="6.5" cy="19.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
                <circle cx="17.5" cy="19.5" r="2.5" fill="${isMoving ? '#ef4444' : '#64748b'}" stroke="white"/>
            `;
            break;
    }

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
      <div style="
        width: 40px;
        height: 40px;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        display: flex;
        align-items: center;
        justify-content: center;
        ${isMoving ? 'animation: bounce 2s infinite;' : ''}
      ">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            ${iconSvg}
        </svg>
      </div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

// Stop marker icon
const createStopIcon = (order) => {
    return L.divIcon({
        className: 'custom-stop-marker',
        html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #1e293b;
        border-radius: 50%;
        border: 2px solid #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        color: white;
      ">
        ${order}
      </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
    });
};

// Component to update map view
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

const LiveTracking = () => {
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]); // Default to Ahmedabad, Gujarat
    const [mapZoom, setMapZoom] = useState(12);

    // Fetch initial data
    useEffect(() => {
        fetchData();

        // Connect to socket
        socketService.connect();

        // Listen for vehicle updates
        socketService.onVehicleLocationUpdate((data) => {
            setVehicles(prev => prev.map(v =>
                v._id === data.vehicleId
                    ? { ...v, currentLocation: data.location, speed: data.speed }
                    : v
            ));
        });

        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    const fetchData = async () => {
        try {
            const [vehiclesRes, routesRes] = await Promise.all([
                vehicleAPI.getAll(),
                routeAPI.getAll()
            ]);

            setVehicles(vehiclesRes.data.data);
            setRoutes(routesRes.data.data);

            // Center map on first active vehicle if available
            if (vehiclesRes.data.data.length > 0) {
                const firstVehicle = vehiclesRes.data.data[0];
                if (firstVehicle.currentLocation?.latitude) {
                    setMapCenter([
                        firstVehicle.currentLocation.latitude,
                        firstVehicle.currentLocation.longitude
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = useCallback((vehicle) => {
        setSelectedVehicle(vehicle);
        if (vehicle.currentLocation?.latitude) {
            setMapCenter([
                vehicle.currentLocation.latitude,
                vehicle.currentLocation.longitude
            ]);
            setMapZoom(15);
        }

        // Find and select the route for this vehicle
        if (vehicle.route) {
            const route = routes.find(r => r._id === vehicle.route._id || r._id === vehicle.route);
            setSelectedRoute(route);
        }
    }, [routes]);

    const handleRouteSelect = (e) => {
        const routeId = e.target.value;
        if (!routeId) {
            setSelectedRoute(null);
            return;
        }

        const route = routes.find(r => r._id === routeId);
        setSelectedRoute(route);

        if (route?.startPoint) {
            setMapCenter([route.startPoint.latitude, route.startPoint.longitude]);
            setMapZoom(12);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'active': 'badge-success',
            'en-route': 'badge-info',
            'inactive': 'badge-neutral',
            'maintenance': 'badge-warning'
        };
        return badges[status] || 'badge-neutral';
    };

    const calculateETA = (vehicle) => {
        if (!vehicle.route || !vehicle.speed || vehicle.speed < 1) return 'N/A';

        const route = routes.find(r => r._id === vehicle.route._id || r._id === vehicle.route);
        if (!route?.estimatedDuration) return 'N/A';

        // Simple ETA calculation based on average speed
        const remainingTime = Math.round(route.estimatedDuration * 0.6);
        return `~${remainingTime} min`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading live tracking...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Live Tracking</h1>
                <p className="page-subtitle">Real-time vehicle locations on the map</p>
            </div>

            <div className="dashboard-grid">
                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="map-container">
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* Route Lines for Active Vehicles */}
                            {[...new Set(vehicles.filter(v => ['active', 'en-route'].includes(v.status) && v.route).map(v => v.route._id || v.route))].map(routeId => {
                                const route = routes.find(r => r._id === routeId);
                                if (!route) return null;
                                const points = [
                                    [route.startPoint.latitude, route.startPoint.longitude],
                                    ...route.stops.sort((a, b) => a.order - b.order).map(s => [s.latitude, s.longitude]),
                                    [route.endPoint.latitude, route.endPoint.longitude]
                                ];
                                return <Polyline key={routeId} positions={points} color={route.color || '#3b82f6'} weight={4} opacity={0.6} dashArray="10, 10" />;
                            })}

                            <MapUpdater center={mapCenter} zoom={mapZoom} />

                            {/* Vehicle markers */}
                            {vehicles.map((vehicle) => {
                                if (!vehicle.currentLocation?.latitude) return null;

                                const isSelected = selectedVehicle?._id === vehicle._id;
                                const isMoving = vehicle.speed > 0;
                                const isInactive = vehicle.status === 'inactive';
                                const routeColor = vehicle.route?.color || '#3b82f6';
                                const markerColor = isInactive ? '#64748b' : (isSelected ? '#8b5cf6' : routeColor);

                                return (
                                    <Marker
                                        key={vehicle._id}
                                        position={[
                                            vehicle.currentLocation.latitude,
                                            vehicle.currentLocation.longitude
                                        ]}
                                        icon={createVehicleIcon(vehicle.type, markerColor, isMoving)}
                                        eventHandlers={{
                                            click: () => handleVehicleSelect(vehicle)
                                        }}
                                        opacity={isInactive ? 0.7 : 1}
                                    >
                                        <Popup>
                                            {isInactive ? (
                                                <div style={{ padding: '8px', textAlign: 'center', minWidth: '150px' }}>
                                                    <div style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        display: 'inline-block',
                                                        marginBottom: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        INACTIVE
                                                    </div>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{vehicle.registrationNumber}</h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                                        Currently not in service
                                                    </p>
                                                </div>
                                            ) : (
                                                <div style={{ minWidth: '200px' }}>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                                                        {vehicle.registrationNumber}
                                                    </h4>
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        <strong>Type:</strong> {vehicle.type}
                                                    </p>
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        <strong>Route:</strong> {vehicle.route?.routeName || 'Not assigned'}
                                                    </p>
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        <strong>Speed:</strong> {vehicle.speed || 0} km/h
                                                    </p>
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        <strong>ETA:</strong> {calculateETA(vehicle)}
                                                    </p>
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#999' }}>
                                                        Updated: {new Date(vehicle.currentLocation.updatedAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            )}
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* Route stops markers */}
                            {selectedRoute?.stops?.map((stop, index) => (
                                <Marker
                                    key={`stop-${index}`}
                                    position={[stop.latitude, stop.longitude]}
                                    icon={createStopIcon(stop.order || index + 1)}
                                >
                                    <Popup>
                                        <div>
                                            <strong>{stop.name}</strong>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                                                Stop #{stop.order || index + 1}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Route Filter */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: '16px' }}>Filter by Route</h3>
                        <select
                            className="form-input form-select"
                            value={selectedRoute?._id || ''}
                            onChange={handleRouteSelect}
                        >
                            <option value="">All Routes</option>
                            {routes.map(route => (
                                <option key={route._id} value={route._id}>
                                    {route.routeNumber} - {route.routeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Vehicles */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header">
                            <h3 className="card-title">Active Vehicles</h3>
                            <span className="badge badge-success">
                                {vehicles.length} online
                            </span>
                        </div>

                        {vehicles.length > 0 ? (
                            <div className="vehicle-list">
                                {vehicles
                                    .filter(v => !selectedRoute || v.route?._id === selectedRoute._id || v.route === selectedRoute._id)
                                    .map((vehicle) => (
                                        <div
                                            key={vehicle._id}
                                            className={`vehicle-item ${selectedVehicle?._id === vehicle._id ? 'selected' : ''}`}
                                            onClick={() => handleVehicleSelect(vehicle)}
                                        >
                                            <div
                                                className="vehicle-icon"
                                                style={{ background: vehicle.route?.color || '#3b82f6' }}
                                            >
                                                {(() => {
                                                    const color = "currentColor";
                                                    switch (vehicle.type?.toLowerCase()) {
                                                        case 'metro':
                                                        case 'train':
                                                            return (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                                                                    <path d="M4 15c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v9zm2-5h12v2H6v-2zm3-7h6v2H9V3z" />
                                                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                                                </svg>
                                                            );
                                                        case 'tram':
                                                            return (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                                                                    <rect x="6" y="4" width="12" height="14" rx="2" />
                                                                    <line x1="12" y1="1" x2="12" y2="4" />
                                                                    <line x1="8" y1="1" x2="16" y2="1" />
                                                                    <circle cx="7" cy="19" r="2" />
                                                                    <circle cx="17" cy="19" r="2" />
                                                                </svg>
                                                            );
                                                        case 'minibus':
                                                        case 'van':
                                                            return (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                                                                    <path d="M1 6c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v10H1V6zm3 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                                    <rect x="3" y="7" width="18" height="6" stroke="none" fill="rgba(255,255,255,0.3)" />
                                                                </svg>
                                                            );
                                                        case 'car':
                                                        case 'taxi':
                                                            return (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                                                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                                                                    <circle cx="7.5" cy="17.5" r="2.5" />
                                                                    <circle cx="16.5" cy="17.5" r="2.5" />
                                                                </svg>
                                                            );
                                                        case 'bus':
                                                        default:
                                                            return (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                                                                    <rect x="1" y="3" width="15" height="13" />
                                                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                                                </svg>
                                                            );
                                                    }
                                                })()}
                                            </div>

                                            <div className="vehicle-info">
                                                <div className="vehicle-name">{vehicle.registrationNumber}</div>
                                                <div className="vehicle-route">
                                                    {vehicle.route?.routeName || 'No route assigned'}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    marginTop: '4px',
                                                    fontSize: '12px',
                                                    color: '#94a3b8'
                                                }}>
                                                    <span>🚗 {vehicle.speed || 0} km/h</span>
                                                    <span>⏱️ {calculateETA(vehicle)}</span>
                                                </div>
                                            </div>

                                            <div className={`badge ${getStatusBadge(vehicle.status)}`}>
                                                <span className={`status-dot ${vehicle.status}`}></span>
                                                {vehicle.status}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p className="text-muted">No active vehicles at the moment</p>
                            </div>
                        )}
                    </div>

                    {/* Selected Vehicle Details */}
                    {selectedVehicle && (
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            borderColor: 'rgba(139, 92, 246, 0.3)'
                        }}>
                            <h3 className="card-title" style={{ marginBottom: '16px' }}>
                                Vehicle Details
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Registration</span>
                                    <span style={{ fontWeight: '600' }}>{selectedVehicle.registrationNumber}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Type</span>
                                    <span style={{ textTransform: 'capitalize' }}>{selectedVehicle.type}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Capacity</span>
                                    <span>{selectedVehicle.capacity} seats</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Current Speed</span>
                                    <span style={{ fontWeight: '600', color: '#10b981' }}>{selectedVehicle.speed || 0} km/h</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>ETA to End</span>
                                    <span style={{ fontWeight: '600' }}>{calculateETA(selectedVehicle)}</span>
                                </div>

                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: '8px' }}
                                    onClick={() => setSelectedVehicle(null)}
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add pulse animation for moving vehicles */}
            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          color: #f8fafc !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background: #1e293b !important;
        }
        .leaflet-popup-content h4 {
          color: #f8fafc !important;
        }
        .leaflet-popup-content p {
          color: #94a3b8 !important;
        }
        .leaflet-popup-content p strong {
          color: #f8fafc !important;
        }
      `}</style>
        </div>
    );
};

export default LiveTracking;
