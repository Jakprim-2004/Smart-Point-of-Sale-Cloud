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

// Health check endpoint 
app.get('/', async (req, res) => {
  try {
    // Neon DB check
    let neonStatus = '🌑 Not Connected';
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL.trim().replace(/^['"]|['"]$/g, ''));
        const result = await sql`SELECT 1`;
        neonStatus = '🛰️ Connected';
      } catch (err) {
        neonStatus = '🚨 Error';
      }
    }

    // Cloudinary check
    let cloudinaryStatus = '🌑 Not Connected';
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
        await cloudinary.api.ping();
        cloudinaryStatus = '☁️ Connected';
      } catch (err) {
        cloudinaryStatus = '🚨 Error';
      }
    }

    // Vercel check (assume always running on Vercel if process.env.VERCEL)
    let vercelStatus = process.env.VERCEL ? '🪐 Running on Vercel' : '🌍 Local/Other';

    res.json({
      status: '🚀 Healthy',
      message: '🪐 Smart POS API is online and orbiting Vercel!',
      theme: 'Cosmic Space',
      timestamp: new Date().toLocaleString(),
      connections: [
        { name: 'NeonDB', status: neonStatus },
        { name: 'Cloudinary', status: cloudinaryStatus },
        { name: 'Vercel', status: vercelStatus }
      ],
      galaxy: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        database: process.env.DATABASE_URL ? '🛰️ Set' : '🌑 Not Set',
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? '☁️ Set' : '🌑 Not Set',
      },
      stars: Math.floor(Math.random() * 10000),
      nebula: 'Welcome to the future of POS, powered by cosmic tech.',
      fun: '✨ May your sales be stellar! ✨'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: '☄️ Error',
      message: 'Health check failed',
      error: error.message
    });
  }
});



// Initialize database on first request
let isDbInitialized = false;

const initDatabase = async () => {
  if (isDbInitialized) return;
  
  try {
    console.log('Initializing database connection...');
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Import database connection first
    const conn = require('./connect');
    
    // Test database connection
    await conn.authenticate();
    console.log('Database connection successful');
    
    // Import models only after successful connection
    const BillSaleModel = require('./models/BillSaleModel');
    const BillSaleDetailModel = require('./models/BillSaleDetailModel');
    const RewardModel = require('./models/RewardModel');
    const CustomerModel = require('./models/CustomerModel');
    const PointTransactionModel = require('./models/PointTransactionModel');
    const ProductModel = require('./models/ProductModel');
    
    // Import associations
    require('./models/associations');
    
    console.log('Syncing database tables...');
    
    // Sync tables in correct order (without alter for production)
    await CustomerModel.sync();
    await ProductModel.sync();
    await BillSaleModel.sync();
    await PointTransactionModel.sync();
    await RewardModel.sync();
    await BillSaleDetailModel.sync();

    isDbInitialized = true;
    console.log('Database initialized successfully!');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Middleware to ensure database is initialized (only for non-health-check routes)
app.use('/member', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/product', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/billSale', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/stock', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/dashboard', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/customer', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/reward', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/category', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

app.use('/productImage', async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
});

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
