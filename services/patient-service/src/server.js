require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'patient-service', timestamp: new Date().toISOString() });
});

app.use('/api', patientRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/healthsync_patients';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Connected to MongoDB (patients)');
    app.listen(PORT, () => {
      console.log(`🏥 Patient Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
