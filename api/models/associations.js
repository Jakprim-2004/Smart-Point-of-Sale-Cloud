const ProductModel = require('./ProductModel');
const StockModel = require('./StockModel');
const BillSaleDetailModel = require('./BillSaleDetailModel'); 
const BillSaleModel = require('./BillSaleModel');
const CustomerModel = require('./CustomerModel');
const PointTransactionModel = require('./PointTransactionModel');

// การเชื่อมโยงระหว่าง Product และ Stock
ProductModel.hasMany(StockModel, { foreignKey: 'productId' });
StockModel.belongsTo(ProductModel, { foreignKey: 'productId' });

// การเชื่อมโยงระหว่าง Product และ BillSaleDetail
ProductModel.hasMany(BillSaleDetailModel, { 
    foreignKey: 'productId',
    sourceKey: 'id'
});
BillSaleDetailModel.belongsTo(ProductModel, { 
    foreignKey: 'productId',
    targetKey: 'id'
});

// Add BillSale and BillSaleDetail associations 
BillSaleModel.hasMany(BillSaleDetailModel, { 
  foreignKey: 'billSaleId',
  as: 'details'
});
BillSaleDetailModel.belongsTo(BillSaleModel, { 
  foreignKey: 'billSaleId',
  as: 'billSale'
});



// Add Customer and BillSale associations
BillSaleModel.belongsTo(CustomerModel, { 
  foreignKey: 'customerId', 
  targetKey: 'id',
  constraints: false  
});
CustomerModel.hasMany(BillSaleModel, { 
  foreignKey: 'customerId',
  sourceKey: 'id',
  constraints: false 
});

// Add Customer and PointTransaction associations
CustomerModel.hasMany(PointTransactionModel, { foreignKey: 'customerId' });
PointTransactionModel.belongsTo(CustomerModel, { foreignKey: 'customerId' });

