const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDatabase = require('./db/connection');
require('dotenv').config(); // Loads .env file from the root of quicknurse-api

const authRoutes = require('./routes/auth');
const nurseRoutes = require('./routes/nurses');
const trackingRoutes = require('./routes/tracking');
const documentRoutes = require('./routes/documents');
// Add other route imports here if you create them:
// const patientRoutes = require('./routes/patients');
// const serviceRequestRoutes = require('./routes/serviceRequests');


const app = express();

// Connect to Database
connectDatabase();

// Middleware
app.use(cors()); // Allow requests from your frontend (and other origins if needed)
app.use(helmet()); // Basic security headers
app.use(express.json()); // To parse JSON request bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/documents', documentRoutes);
// app.use('/api/patients', patientRoutes); // Example for future
// app.use('/api/servicerequests', serviceRequestRoutes); // Example for future

// Simple root route for health check or API info
app.get('/', (req, res) => {
  res.send('QuickNurse API is running...');
});

// Basic Error Handling Middleware (Keep this last before app.listen)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ success: false, error: 'Something broke on the server!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});