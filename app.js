// app.js
const express = require('express');
const sequelize = require('./config/database');
const MeterRoutes = require('./routes/MeterRoutes');
// const PowerSourceUsage = require('./models/PowerSourceUsage'); // Import the model

const app = express();
const PORT = process.env.PORT || 3010;
const cors = require('cors');

// Middleware
app.use(express.json());
// app.use(cors());
// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins. Change '*' to your frontend URL to restrict access.
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));


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
