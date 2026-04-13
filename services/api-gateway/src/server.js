require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth');
const authRouter = require('./routes/auth');
const googleAuthRouter = require('./routes/googleAuth');
const userRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy (required behind Azure Container Apps / APIM reverse proxies)
app.set('trust proxy', true);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.STATIC_WEBSITE_URL,
  'http://localhost:3000',
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());
app.use(morgan('combined'));

// IMPORTANT: Do NOT apply express.json() globally.
// It consumes the raw body stream, which prevents http-proxy-middleware from forwarding
// the body to backend services. Only parse JSON for gateway-handled routes.
const jsonParser = express.json({ limit: '10mb' });

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  validate: { trustProxy: false },
});
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes (handled directly by gateway - need JSON body parsing)
app.use('/api/auth', jsonParser, authRouter);
app.use('/api/auth/google', jsonParser, googleAuthRouter);
app.use('/api/users', jsonParser, authMiddleware, userRouter);

// Upload routes (multipart/form-data — no jsonParser)
app.use('/api/upload', uploadRouter);

// Proxy configuration
const services = {
  '/api/patients': process.env.PATIENT_SERVICE_URL || 'http://localhost:3001',
  '/api/doctors': process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002',
  '/api/appointments': process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  '/api/prescriptions': process.env.PRESCRIPTION_SERVICE_URL || 'http://localhost:3004',
  '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  '/api/reviews': process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002',
};

// Public routes (no auth required)
const publicPaths = [
  '/api/doctors/public',
  '/api/doctors/specializations',
  '/api/doctors/featured',
  '/api/reviews/doctor',
];

// Setup proxies with auth middleware
Object.entries(services).forEach(([path, target]) => {
  app.use(path, (req, res, next) => {
    const fullPath = path + req.path;
    const isPublic = publicPaths.some(p => fullPath.startsWith(p));
    // Allow public GET for individual doctor profiles (/api/doctors/:uuid)
    const isDoctorDetail = path === '/api/doctors' && req.method === 'GET' && /^\/[0-9a-f-]{36}$/.test(req.path);
    if (isPublic || isDoctorDetail || req.method === 'OPTIONS') {
      return next();
    }
    return authMiddleware(req, res, next);
  }, createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: false,
    pathRewrite: (reqPath) => {
      // /api/reviews shares the doctor-service which mounts reviews at /api/reviews
      if (path === '/api/reviews') return reqPath;
      return reqPath.replace(new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '/api');
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${path}:`, err.message);
      res.status(503).json({ error: 'Service temporarily unavailable', service: path });
    },
    onProxyReq: (proxyReq, req) => {
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-role', req.user.role);
        proxyReq.setHeader('x-user-email', req.user.email);
        proxyReq.setHeader('x-user-name', req.user.name || '');
      }
    },
    onProxyRes: (proxyRes) => {
      // Strip CORS headers from backend services so the gateway's CORS config takes effect
      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];
    },
  }));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal gateway error' : err.message,
  });
});

// Connect to MongoDB and start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/healthsync_auth';

mongoose.connect(MONGO_URI, { retryWrites: false })
  .then(() => {
    console.log('📦 Connected to MongoDB (auth)');
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
