require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'appointment-service', timestamp: new Date().toISOString() });
});

app.use('/api', appointmentRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('🗄️  PostgreSQL synced (appointments)');
    app.listen(PORT, () => {
      console.log(`📅 Appointment Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err);
    process.exit(1);
  });

module.exports = app;
