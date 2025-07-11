 

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const events = require('events'); 
const bcrypt = require('bcrypt');
const conn = require('./connect');

app.use(cors());

events.EventEmitter.defaultMaxListeners = 20;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use(require("./controllers/MemberController"));
app.use(require("./controllers/ProductController"));
app.use(require("./controllers/ProductImageController"));
app.use(require("./controllers/BillSaleController"));
app.use(require("./controllers/StockController"));
app.use( require("./controllers/DashboardController"));
app.use( require('./controllers/CustomerControllers'));
app.use( require('./controllers/RewardController'));
app.use( require('./controllers/CategoryController'));

app.get('/', (req, res) => {
  res.json({ message: 'API is running on Vercel' });
});

const init = async () => {
  try {
    console.log('Starting database connection...');
    
    // นำเข้าโมเดลทั้งหมด
    const BillSaleModel = require('./models/BillSaleModel');
    const BillSaleDetailModel = require('./models/BillSaleDetailModel');
    const RewardModel = require('./models/RewardModel');
    const CustomerModel = require('./models/CustomerModel');
    const PointTransactionModel = require('./models/PointTransactionModel');
    const ProductModel = require('./models/ProductModel');
    
    // นำเข้าความสัมพันธ์ระหว่างโมเดล
    require('./models/associations');
    
    console.log('Syncing database tables in sequence...');
    
    try {
      // === Primary Tables Synchronization === //
      console.log('\n=== Starting Primary Tables Sync ===');
      
      await CustomerModel.sync({ alter: true });
      console.log('✓ Customer Model: Synchronized');
      
      await ProductModel.sync({ alter: true });
      console.log('✓ Product Model: Synchronized');
      
      await BillSaleModel.sync({ alter: true });
      console.log('✓ Bill Sale Model: Synchronized');

      // === Dependent Tables Synchronization === //
      console.log('\n=== Starting Dependent Tables Sync ===');
      
      await PointTransactionModel.sync({ alter: true });
      console.log('✓ Point Transaction Model: Synchronized');
      
      await RewardModel.sync({ alter: true });
      console.log('✓ Reward Model: Synchronized');
      
      await BillSaleDetailModel.sync({ alter: true });
      console.log('✓ Bill Sale Detail Model: Synchronized');

      console.log('\n✨ All database tables synchronized successfully!\n');
      
    } catch (syncError) {
      console.error('\n❌ Error syncing tables:', syncError);
      throw syncError;
    }

    app.listen(port, () => {
      console.log('\n===========================================');
      console.log(`🚀 Server running successfully on port ${port}`);
      console.log('===========================================\n');
    });

    } catch (error) {
      console.error('\n❌ Database initialization error:', error);
      process.exit(1);
    }
    };

    init();