const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const events = require('events');
require('dotenv').config();

// Increase event listeners limit
events.EventEmitter.defaultMaxListeners = 20;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));





// Import controllers หลังจาก middleware
try {
  app.use(require("./controllers/MemberController"));
  app.use(require("./controllers/ProductController"));
  app.use(require("./controllers/ProductImageController"));
  app.use(require("./controllers/BillSaleController"));
  app.use(require("./controllers/StockController"));
  app.use(require("./controllers/DashboardController"));
  app.use(require('./controllers/CustomerControllers'));
  app.use(require('./controllers/RewardController'));
  app.use(require('./controllers/CategoryController'));
} catch (error) {
  console.error('Error loading controllers:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// For Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
