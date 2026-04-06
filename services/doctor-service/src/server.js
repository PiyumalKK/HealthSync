require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const Review = require('./models/Review');
const doctorRoutes = require('./routes/doctorRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const seedDoctors = require('./seed');
const seedReviews = require('./seedReviews');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'doctor-service', timestamp: new Date().toISOString() });
});

app.use('/api', doctorRoutes);
app.use('/api/reviews', reviewRoutes);

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('🗄️  PostgreSQL synced (doctors + reviews)');
    await seedDoctors();
    await seedReviews();
    app.listen(PORT, () => {
      console.log(`👨‍⚕️ Doctor Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err);
    process.exit(1);
  });

module.exports = app;
