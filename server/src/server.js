const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const companyRoutes = require('./routes/companyRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const roundRoutes = require('./routes/roundRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const learningMaterialRoutes = require('./routes/learningMaterialRoutes');
const alumniRoutes = require('./routes/alumniRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g. mobile apps or curl)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local development
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for learning materials and local assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Apply rate limiting to all API endpoints
app.use('/api', apiLimiter);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GECR Placement Sarthi API',
  });
});

// Mount Routes
app.use('/api/companies', companyRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning-materials', learningMaterialRoutes);
app.use('/api/alumni', alumniRoutes);

// 404 Not Found Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.originalUrl}' not found on this server`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Placement Portal Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
