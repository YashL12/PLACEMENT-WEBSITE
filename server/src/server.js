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
const codingQuestionRoutes = require('./routes/codingQuestionRoutes');
const executeRoutes = require('./routes/executeRoutes');

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

// Static asset caching options
const staticOptions = {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  },
};

// Static uploads directory for learning materials and local assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), staticOptions));
// Fallback for logos served at /logos
app.use('/logos', express.static(path.join(__dirname, '..', 'uploads', 'logos'), staticOptions));
app.use('/logos', express.static(path.join(__dirname, '..', '..', 'client', 'public', 'logos'), staticOptions));

// Lightweight health checks for UptimeRobot and load balancers (placed before rate limiter)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'GECRPlacement API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiting to all other API endpoints
app.use('/api', apiLimiter);

// Mount Routes
app.use('/api/companies', companyRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning-materials', learningMaterialRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/coding-questions', codingQuestionRoutes);
app.use('/api/execute', executeRoutes);

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
