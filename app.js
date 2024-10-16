// app.js
const express = require('express');
const sequelize = require('./config/database');
const MeterRoutes = require('./routes/MeterRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/', MeterRoutes);

// Sync with Database and Start Server
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to create the database:', error);
  });
