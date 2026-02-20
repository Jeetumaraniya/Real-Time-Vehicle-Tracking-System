# Product Requirements Document (PRD)
## Real-Time Vehicle Tracking System for Urban Public Transport (MERN Stack)

---

## 1. Project Overview

**Project Name:**  
Real-Time Vehicle Tracking System for Urban Public Transport

**Objective:**  
To design and develop a web-based application that enables real-time tracking of urban public transport vehicles using GPS technology.

**Problem Statement:**  
Passengers often face uncertainty regarding bus arrival times, delays, and route information due to the absence of real-time tracking systems.

**Proposed Solution:**  
A MERN stack-based system that collects live GPS data from vehicles, processes it on a backend server, and displays real-time locations and ETAs on an interactive web interface.

---

## 2. Target Users

1. **Passengers**
   - Track live vehicle location
   - View routes and ETA

2. **Transport Authority (Admin)**
   - Manage vehicles and routes
   - Monitor live movement
   - Analyze trip history

3. **Drivers (Optional)**
   - Share live GPS data
   - View assigned routes

---

## 3. Scope of the System

### In Scope
- Live GPS tracking
- Map-based visualization
- Vehicle and route management
- ETA calculation
- Admin dashboard

### Out of Scope
- Online ticket booking
- Payment gateway
- Video surveillance
- Offline mode

---

## 4. Functional Requirements

### User Module
- View available routes
- Track vehicles in real time
- Check estimated arrival time
- See vehicle status

### Admin Module
- Secure admin authentication
- Add / update / delete vehicles
- Create and manage routes
- Assign vehicles to routes
- View trip history

### Tracking Module
- Receive GPS coordinates
- Update location every few seconds
- Store tracking data
- Broadcast live updates using WebSockets

---

## 5. Non-Functional Requirements

- **Performance:** Real-time updates within 3–5 seconds
- **Scalability:** Handle multiple vehicles concurrently
- **Security:** JWT-based authentication
- **Availability:** 24×7 uptime
- **Usability:** Mobile-friendly and responsive UI

---

## 6. Technology Stack (MERN)

| Layer | Technology |
|-----|-----------|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Real-Time | Socket.io |
| Maps | Google Maps API / OpenStreetMap |
| Authentication | JWT |
| Hosting | AWS / Render / Vercel |

---

## 7. System Architecture

```
GPS Device / Mobile App
        ↓
    Node.js API
        ↓
    MongoDB
        ↓
   Socket.io
        ↓
 React Web Application
        ↓
      Users
```

---

## 8. Data Models

### Vehicle
- vehicleId
- registrationNumber
- routeId
- status
- currentLocation (latitude, longitude)

### Route
- routeId
- routeName
- startPoint
- endPoint
- stops[]

### User
- userId
- username
- password
- role

---

## 9. Project Structure (MERN)

### Backend

```
backend/
│── controllers/
│── models/
│── routes/
│── config/
│── sockets/
│── server.js
```

### Frontend

```
frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.js
│   └── index.js
```

---

## 10. Use Case Flow

1. Admin logs in
2. Admin adds routes and vehicles
3. Vehicle sends GPS data
4. Backend processes and stores data
5. Socket.io pushes updates
6. User views live location on map

---

## 11. Expected Outcomes

- Reduced passenger waiting time
- Improved service transparency
- Better fleet management
- Efficient urban transport monitoring

---

## 12. Future Enhancements

- Android & iOS mobile app
- Push notifications for delays
- Traffic-aware ETA
- Driver behavior analytics
- Offline data sync

---
