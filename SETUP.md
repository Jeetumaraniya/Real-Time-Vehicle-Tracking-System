# Vehicle Tracking System - Complete Setup Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing the Setup](#testing-the-setup)
- [Troubleshooting](#troubleshooting)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)

---

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

### Required Software
1. **Node.js** (v16.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **MongoDB** (v5.x or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`
   - **Important**: MongoDB must be running before starting the backend

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

### Recommended Tools
- **MongoDB Compass** (GUI for MongoDB): https://www.mongodb.com/products/compass
- **Postman** (API testing): https://www.postman.com/
- **VS Code** (Code editor): https://code.visualstudio.com/

---

## Project Structure

```
Vehicle Tracking System/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── sockets/               # Socket.io handlers
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   ├── seed.js                # Database seeder
│   └── package.json           # Backend dependencies
│
├── frontend/                   # React frontend
│   ├── public/                # Static files
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   └── package.json           # Frontend dependencies
│
└── README.md                   # Basic documentation
```

---

## Installation Steps

### Step 1: Clone or Navigate to Project Directory

If you haven't already, navigate to the project directory:
```bash
cd "d:\Vehicle Tracking System"
```

### Step 2: Install Backend Dependencies

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install all required packages:
```bash
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `nodemon` - Development auto-restart (dev dependency)

### Step 3: Install Frontend Dependencies

1. Open a new terminal and navigate to the frontend directory:
```bash
cd "d:\Vehicle Tracking System\frontend"
```

2. Install all required packages:
```bash
npm install
```

This will install:
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Real-time client
- `leaflet` & `react-leaflet` - Map visualization
- `react-scripts` - React build tools

---

## Environment Configuration

### Backend Environment Variables

The backend uses a `.env` file for configuration. The file is already present at `backend\.env` with the following settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vehicle-tracking
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

#### Configuration Details:

- **PORT**: The port on which the backend server runs (default: 5000)
- **MONGODB_URI**: MongoDB connection string
  - `localhost:27017` - Default MongoDB address
  - `vehicle-tracking` - Database name
- **JWT_SECRET**: Secret key for JWT token generation
  - ⚠️ **IMPORTANT**: Change this in production to a strong, random string
- **JWT_EXPIRES_IN**: Token expiration time (7 days)

#### For Production:
Create a `.env.production` file with secure values:
```env
PORT=5000
MONGODB_URI=mongodb://your-production-db-url/vehicle-tracking
JWT_SECRET=generate-a-strong-random-secret-key-here
JWT_EXPIRES_IN=7d
```

### Frontend Configuration

The frontend connects to the backend API. If you need to change the API URL:

1. Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

2. Update API service files to use these environment variables if needed.

---

## Database Setup

### Step 1: Start MongoDB

#### On Windows:
```bash
# Start MongoDB service
net start MongoDB

# Or run MongoDB manually
mongod --dbpath "C:\data\db"
```

#### On macOS/Linux:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using Homebrew (macOS)
brew services start mongodb-community
```

### Step 2: Verify MongoDB is Running

```bash
# Connect to MongoDB shell
mongosh

# Or using legacy mongo shell
mongo
```

You should see a MongoDB prompt. Type `exit` to close.

### Step 3: Seed the Database (Optional)

The backend includes a seed file to populate the database with sample data:

```bash
cd backend
node seed.js
```

This will create:
- Sample users (admin, drivers)
- Sample vehicles
- Sample routes
- Sample tracking data

---

## Running the Application

### Option 1: Run Backend and Frontend Separately

#### Terminal 1 - Backend:
```bash
cd "d:\Vehicle Tracking System\backend"
npm run dev
```

Expected output:
```
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB connected successfully
Socket.IO initialized
```

#### Terminal 2 - Frontend:
```bash
cd "d:\Vehicle Tracking System\frontend"
npm start
```

Expected output:
```
Compiled successfully!

You can now view vehicle-tracking-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

The application will automatically open in your default browser at `http://localhost:3000`.

### Option 2: Using npm scripts

You can also use the following commands:

**Backend (Production mode):**
```bash
cd backend
npm start
```

**Backend (Development mode with auto-restart):**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

---

## Testing the Setup

### 1. Check Backend Health

Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Or visit: `http://localhost:5000/api/health`

### 2. Check Frontend

Visit: `http://localhost:3000`

You should see the Vehicle Tracking System login page.

### 3. Test Authentication

#### Using the seeded data (if you ran seed.js):

**Admin User:**
- Email: `admin@vehicletracking.com`
- Password: `admin123`

**Driver User:**
- Email: `driver1@vehicletracking.com`
- Password: `driver123`

### 4. Test Real-Time Tracking

1. Log in as admin
2. Navigate to Live Tracking page
3. Open browser console (F12)
4. Check for Socket.IO connection messages

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (requires auth)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle (admin only)
- `PUT /api/vehicles/:id` - Update vehicle (admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)

### Tracking
- `GET /api/tracking/vehicle/:vehicleId` - Get vehicle location
- `POST /api/tracking/update` - Update vehicle location (driver only)
- `GET /api/tracking/history/:vehicleId` - Get location history

### Socket.IO Events
- `connection` - Client connects
- `joinVehicle` - Subscribe to vehicle updates
- `leaveVehicle` - Unsubscribe from vehicle
- `locationUpdate` - Real-time location broadcast

---

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)
- Check MongoDB connection string in `.env`
- Verify MongoDB is listening on port 27017

#### 2. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change the port in backend/.env
PORT=5001
```

#### 3. Frontend Cannot Connect to Backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify API URL in frontend code

#### 4. npm install Fails

**Error:** Various npm errors during installation

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 5. React Build Errors

**Error:** `Module not found` or build failures

**Solution:**
```bash
# Clear React cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Restart dev server
npm start
```

#### 6. Socket.IO Connection Issues

**Error:** Socket not connecting or frequent disconnections

**Solution:**
- Check browser console for errors
- Verify backend Socket.IO is initialized
- Check firewall settings
- Ensure both frontend and backend are using compatible Socket.IO versions

#### 7. JWT Authentication Errors

**Error:** `Invalid token` or `Token expired`

**Solution:**
- Clear browser localStorage: `localStorage.clear()`
- Log in again to get a new token
- Check JWT_SECRET matches in `.env`

---

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **Leaflet** - Interactive maps
- **React-Leaflet** - React wrapper for Leaflet

---

## Next Steps

After successful setup:

1. **Explore the Application**
   - Test all features (login, vehicle tracking, etc.)
   - Check real-time updates

2. **Customize Configuration**
   - Update JWT secret for production
   - Configure MongoDB for production use
   - Set up proper CORS policies

3. **Development**
   - Review code structure
   - Add new features
   - Write tests

4. **Deployment**
   - Set up production environment
   - Configure environment variables
   - Deploy to cloud platform (AWS, Heroku, etc.)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs in terminal
3. Check browser console for frontend errors
4. Review MongoDB logs for database issues

---

## License

This project is for educational/development purposes.

---

**Last Updated:** January 2026
