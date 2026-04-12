require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const prescriptionRoutes = require('./routes/prescriptionRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'prescription-service', timestamp: new Date().toISOString() });
});

app.use('/api', prescriptionRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/healthsync_prescriptions';

mongoose.connect(MONGO_URI, { retryWrites: false })
  .then(() => {
    console.log('📦 Connected to MongoDB (prescriptions)');
    app.listen(PORT, () => {
      console.log(`💊 Prescription Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
