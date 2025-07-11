const express = require('express');
const router = express.Router();
const StockModel = require('../models/StockModel');
const BillSaleDetailModel = require('../models/BillSaleDetailModel');
const ProductModel = require('../models/ProductModel');
const BillSaleModel = require('../models/BillSaleModel');
const sequelize = require('sequelize');
require("dotenv").config();
const service = require("./Service");

// Import associations to ensure they are loaded
require('../models/associations');


router.post("/reportSumSalePerMonth", async (req, res) => {
  try {
    const { year, month, viewType } = req.body;
    const userId = service.getMemberId(req);
    
    
    // กำหนดค่าสำหรับมุมมองรายวันหรือรายเดือน
    const dateUnit = viewType === "daily" ? "DAY" : "MONTH";
    const dateAlias = viewType === "daily" ? "day" : "month";
    
    // สร้าง attributes ที่ต้องการเลือก
    const attributes = [
      [sequelize.fn("EXTRACT", sequelize.literal(`${dateUnit} FROM "billSaleDetail"."createdAt"`)), dateAlias],
      [sequelize.fn("SUM", sequelize.literal(`"product"."price" * "billSaleDetail"."qty"`)), "sum"],
      [sequelize.fn("SUM", sequelize.literal(`("product"."price" - "product"."cost") * "billSaleDetail"."qty"`)), "profit"],
      [sequelize.fn("SUM", sequelize.literal(`"product"."cost" * "billSaleDetail"."qty"`)), "cost"]
    ];
    
    // สร้างเงื่อนไข where
    const whereConditions = {
      userId,
      [sequelize.Op.and]: [
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal(`YEAR FROM "billSaleDetail"."createdAt"`)), year)
      ]
    };
    
    // เงื่อนไขกรองตามเดือน (เฉพาะมุมมองรายวัน)
    if (viewType === "daily") {
      whereConditions[sequelize.Op.and].push(
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal(`MONTH FROM "billSaleDetail"."createdAt"`)), month)
      );
    }
    
    // ดึงข้อมูลจากฐานข้อมูล
    const results = await BillSaleDetailModel.findAll({
      attributes,
      where: whereConditions,
      group: [sequelize.fn("EXTRACT", sequelize.literal(`${dateUnit} FROM "billSaleDetail"."createdAt"`))],
      include: [{ 
        model: ProductModel, 
        as: 'product',  
        attributes: [] 
      }, {
        model: BillSaleModel,
        as: 'billSale',
        attributes: [],
        required: true,
        where: { status: 'pay' }
      }],
      order: [[sequelize.fn("EXTRACT", sequelize.literal(`${dateUnit} FROM "billSaleDetail"."createdAt"`)), 'ASC']]
    });
    
    
    // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
    const formattedResults = results.map(item => {
      const result = {
        day: parseInt(item.dataValues.day) || null,
        month: parseInt(item.dataValues.month) || null,
        sum: parseFloat(item.dataValues.sum || 0),
        profit: parseFloat(item.dataValues.profit || 0),
        cost: parseFloat(item.dataValues.cost || 0)
      };
      return result;
    });
    
    // แสดงข้อมูลวันที่มีข้อมูลเพื่อการตรวจสอบ
    if (viewType === "daily") {
      const daysWithData = formattedResults
        .filter(item => item && item.day)
        .map(item => item.day)
        .sort((a, b) => a - b);
      
    }
    
    // คำนวณผลรวม
    const totalSales = formattedResults.reduce((sum, item) => sum + (item.sum || 0), 0);
    const totalProfit = formattedResults.reduce((sum, item) => sum + (item.profit || 0), 0);
    const totalCost = formattedResults.reduce((sum, item) => sum + (item.cost || 0), 0);
    
   
    
    // ส่งผลลัพธ์กลับไป
    res.send({
      message: "success",
      results: formattedResults,
      totalSales,
      totalProfit,
      totalCost
    });
  } catch (error) {
    console.error("Error in reportSumSalePerMonth:", error);
    res.status(500).send({ message: error.message });
  }
});

router.get('/reportStock', async (req, res) => {
  try {
    const userId = service.getMemberId(req); 
    const stocks = await StockModel.findAll({
      attributes: ['productId', 'qty'],
      include: [{ 
        model: ProductModel, 
        as: 'product',  
        attributes: ['name'] 
      }],
      where: { userId: userId } 
    });

    const billSaleDetails = await BillSaleDetailModel.findAll({
      attributes: ['productId', [sequelize.fn('SUM', sequelize.col('qty')), 'totalQty']],
      group: ['productId'],
      where: { userId: userId } 
    });

    const stockMap = new Map();

    stocks.forEach(stock => {
      const productId = stock.productId;
      const currentStock = stockMap.get(productId) || {
        productId: productId,
        productName: stock.product.name,
        totalQty: 0 
      };

      currentStock.totalQty += parseInt(stock.qty, 10); 
      stockMap.set(productId, currentStock);
    });

    billSaleDetails.forEach(bill => {
      const productId = bill.productId;
      if (stockMap.has(productId)) {
        const currentStock = stockMap.get(productId);
        const soldQty = parseInt(bill.dataValues.totalQty, 10);
        currentStock.totalQty = Math.max(0, currentStock.totalQty - soldQty); 
      }
    });

    const totalStock = Array.from(stockMap.values());

    res.send({ message: 'success', results: totalStock });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/reportTopSellingProducts', async (req, res) => {
  try {
    const userId = service.getMemberId(req); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get product info first
    const products = await ProductModel.findAll({
      attributes: ['id', 'name', 'price'],
      where: { userId: userId },
      raw: true
    });

    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.id, {
        name: product.name || 'สินค้าไม่มีชื่อ',
        price: parseFloat(product.price || 0)
      });
    });

    // Get all paid billSales for today
    const paidBills = await BillSaleModel.findAll({
      attributes: ['id'],
      where: {
        userId: userId,
        status: 'pay',
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        }
      },
      raw: true
    });

    if (paidBills.length === 0) {
      // Return default data for empty state
      return res.send({ 
        message: 'success', 
        results: [{
          productId: 0,
          productName: 'ไม่มีข้อมูลการขาย',
          totalQty: 0,
          totalAmount: 0
        }] 
      });
    }

    const paidBillIds = paidBills.map(bill => bill.id);

    // Get product quantities and include price calculation from the database
    const salesDetails = await BillSaleDetailModel.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('qty')), 'totalQty'],
        [sequelize.fn('SUM', sequelize.literal('qty * "billSaleDetail"."price"')), 'totalAmount'],
        [sequelize.col('product.name'), 'productName']
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: [],
        required: false
      }],
      group: ['productId', 'product.name'],
      where: { 
        userId: userId,
        billSaleId: {
          [sequelize.Op.in]: paidBillIds
        }
      },
      raw: true
    });

    // Process results with improved fallbacks
    const results = salesDetails.map(item => {
      const product = productMap.get(item.productId);
      const totalQty = parseInt(item.totalQty || 0);
      let totalAmount = parseFloat(item.totalAmount || 0);
      
      // Use product name from join if available, otherwise from map or default
      const productName = item.productName || (product ? product.name : 'สินค้าไม่มีชื่อ');
      
      // If amount is missing, calculate it
      if (isNaN(totalAmount) || totalAmount === 0) {
        const price = product ? product.price : 0;
        totalAmount = totalQty * price;
      }
      
      return {
        productId: item.productId,
        productName: productName,
        totalQty: totalQty,
        totalAmount: totalAmount > 0 ? totalAmount : 1 // Ensure non-zero amount for percentage calculation
      };
    });

    // Sort by totalAmount
    results.sort((a, b) => b.totalAmount - a.totalAmount);
    
    // Take top 5 or use default if empty
    const topResults = results.length > 0 ? results.slice(0, 5) : [{
      productId: 0,
      productName: 'ไม่มีข้อมูลการขาย',
      totalQty: 0,
      totalAmount: 0
    }];
    
    res.send({ message: 'success', results: topResults });
  } catch (error) {
    console.error('Error in reportTopSellingProducts:', error);
    // Return default data in case of error
    res.send({ 
      message: 'success', 
      results: [{
        productId: 0,
        productName: 'เกิดข้อผิดพลาด',
        totalQty: 0,
        totalAmount: 0
      }] 
    });
  }
});

router.get('/reportTopSellingCategories', async (req, res) => {
  try {
    const userId = service.getMemberId(req); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // แก้ไขการคำนวณยอดจาก totalprice เป็นการคำนวณจาก price ของสินค้าและจำนวน
    const topSellingCategories = await BillSaleDetailModel.findAll({
      attributes: [
        [sequelize.col('product.category'), 'category'],
        [sequelize.fn('SUM', sequelize.col('qty')), 'totalQty'],
        [sequelize.fn('SUM', 
          sequelize.literal('qty * price') // ใช้ price จาก billSaleDetail แทน totalprice
        ), 'totalAmount']
      ],
      group: ['product.category'],
      having: sequelize.literal('SUM(qty) > 0'),
      order: [[sequelize.fn('SUM', sequelize.literal('qty * price')), 'DESC']],
      limit: 5,
      include: [{ 
        model: ProductModel, 
        as: 'product',
        attributes: [],
        required: true // เพิ่ม required เพื่อทำ INNER JOIN
      },
      {
        model: BillSaleModel,
        as: 'billSale',
        attributes: [],
        where: { status: 'pay' },
        required: true // เพิ่ม required เพื่อทำ INNER JOIN
      }],
      where: { 
        userId: userId,
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        }
      } 
    });

    const results = topSellingCategories.map(category => {
      const data = category.get({ plain: true });
      return {
        ...data,
        totalAmount: parseFloat(data.totalAmount) || 0,
        totalQty: parseInt(data.totalQty) || 0
      };
    });

    // คำนวณ total amount รวมทั้งหมดให้ถูกต้อง
    const totalAmount = results.reduce((sum, category) => 
      sum + parseFloat(category.totalAmount || 0), 0);

    // เพิ่มเปอร์เซ็นต์ให้แต่ละ category
    const categoriesWithPercentage = results.map(category => ({
      ...category,
      percentage: totalAmount > 0 ? 
        ((parseFloat(category.totalAmount || 0) / totalAmount) * 100).toFixed(2) : 0
    }));

    res.send({ 
      message: 'success', 
      results: categoriesWithPercentage 
    });
  } catch (error) {
    console.error('Error in reportTopSellingCategories:', error);
    res.status(500).send({ message: error.message });
  }
});

router.get('/reportTodaySales', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all sales for today
    const todaySales = await BillSaleModel.findAll({
      where: {
        userId: userId,
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        },
        status: 'completed'
      },
      include: [{
        model: BillSaleDetailModel,
        as: 'details',
        include: [{
          model: ProductModel,
          as: 'product'
        }]
      }]
    });

    // Calculate metrics
    const totalAmount = todaySales.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const billCount = todaySales.length;
    const averagePerBill = billCount > 0 ? totalAmount / billCount : 0;

    // Calculate hourly sales
    const hourlyData = Array(24).fill().map((_, hour) => ({
      hour,
      amount: 0
    }));

    todaySales.forEach(bill => {
      const hour = new Date(bill.createdAt).getHours();
      hourlyData[hour].amount += bill.totalAmount || 0;
    });

    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.send({
      message: 'success',
      results: {
        date: today,
        totalAmount,
        billCount,
        averagePerBill,
        hourlyData,
        topProducts
      }
    });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/todaySalesReport', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySales = await BillSaleModel.findAll({
      where: {
        userId: userId,
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        },
        status: 'pay' 
      }
    });

    const yesterdaySales = await BillSaleModel.findAll({
      where: {
        userId: userId,
        createdAt: {
          [sequelize.Op.gte]: yesterday,
          [sequelize.Op.lt]: today
        },
        status: 'pay' 
      }
    });

    const todayTotal = todaySales.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0);
    const yesterdayTotal = yesterdaySales.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0);
    
    const todayBillCount = todaySales.length;
    const yesterdayBillCount = yesterdaySales.length;
    const todayAveragePerBill = todayBillCount > 0 ? todayTotal / todayBillCount : 0;
    const yesterdayAveragePerBill = yesterdayBillCount > 0 ? yesterdayTotal / yesterdayBillCount : 0;

    const growthRate = yesterdayTotal ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;
    const billCountGrowth = yesterdayBillCount ? ((todayBillCount - yesterdayBillCount) / yesterdayBillCount) * 100 : 0;
    const averageGrowth = yesterdayAveragePerBill ? ((todayAveragePerBill - yesterdayAveragePerBill) / yesterdayAveragePerBill) * 100 : 0;

    const hourlyData = Array(24).fill().map((_, hour) => ({
      hour,
      amount: 0
    }));

    // Calculate hourly totals directly from bill totalAmount
    todaySales.forEach(bill => {
      const hour = new Date(bill.createdAt).getHours();
      hourlyData[hour].amount += parseFloat(bill.totalAmount || 0);
    });

   

    const response = {
      message: 'success',
      results: {
        date: today,
        totalAmount: todayTotal,
        billCount: todayBillCount,
        yesterdayBillCount: yesterdayBillCount,
        billCountGrowth: parseFloat(billCountGrowth.toFixed(2)),
        averagePerBill: todayAveragePerBill,
        yesterdayAveragePerBill: yesterdayAveragePerBill,
        averageGrowth: parseFloat(averageGrowth.toFixed(2)),
        hourlyData: hourlyData,
        growthRate: parseFloat(growthRate.toFixed(2)),
        yesterdayTotal
      }
    };

    res.send(response);

  } catch (error) {
    console.error('Error in todaySalesReport:', error);
    res.status(500).send({ 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน',
      error: error.message 
    });
  }
});

router.get('/paymentMethodStats', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentStats = await BillSaleModel.findAll({
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('billSale.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
      ],
      where: {
        userId: userId,
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        },
        status: 'pay' // Only include paid bills
      },
      group: ['paymentMethod'],
      raw: true
    });

   

    res.send({ 
      message: 'success', 
      results: paymentStats.map(stat => ({
        ...stat,
        paymentMethod: stat.paymentMethod || 'ไม่ระบุ', // Set default for null payment methods
        total: parseFloat(stat.total) || 0,
        label: '' // Add empty label for chart display
      }))
    });
  } catch (error) {
    
    res.status(500).send({ message: error.message });
  }
});

router.post('/reportSalesByDateRange', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const { dateRange, customStartDate, customEndDate } = req.body;
    
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Handle different date ranges with validation
    if (dateRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        return res.send({
          message: 'success',
          results: []
        });
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.send({
          message: 'success',
          results: []
        });
      }
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (dateRange) {
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
        case 'last7days':
          startDate.setDate(startDate.getDate() - 6);
          break;
        case 'last30days':
          startDate.setDate(startDate.getDate() - 29);
          break;
        case 'thisMonth':
          startDate.setDate(1);
          break;
        case 'lastMonth':
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          break;
        case 'custom':
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    }

    const results = await BillSaleDetailModel.findAll({
      attributes: [
        'productId',
        [sequelize.col('product.name'), 'productName'],
        [sequelize.fn('SUM', sequelize.col('qty')), 'quantity'],
        [sequelize.fn('SUM', sequelize.literal('qty * totalprice')), 'totalAmount'],
        [sequelize.col('product.cost'), 'costPerUnit'],
        [sequelize.col('product.price'), 'pricePerUnit'],
        [sequelize.fn('SUM', 
          sequelize.literal('(totalprice - product.cost) * qty')
        ), 'netProfit']
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: []
      }],
      where: {
        userId,
        createdAt: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: [
        'productId',
        'product.name',
        'product.cost',
        'product.price'
      ],
      order: [['productId', 'ASC']],
      raw: true
    });

    res.send({
      message: 'success',
      results: results.map(item => ({
        ...item,
        quantity: parseInt(item.quantity) || 0,
        totalAmount: parseFloat(item.totalAmount) || 0,
        costPerUnit: parseFloat(item.costPerUnit) || 0,
        pricePerUnit: parseFloat(item.pricePerUnit) || 0,
        netProfit: parseFloat(item.netProfit) || 0
      }))
    });
    
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/productDetails', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const { startDate, endDate, dateRange } = req.body;
    
    // Create Date objects for UTC+7 (Bangkok timezone)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Adjust times
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // เรียกข้อมูลแบบรายวัน โดยอย่าเพิ่ม cost/price ในการ GROUP BY
    const results = await BillSaleDetailModel.findAll({
      attributes: [
        [sequelize.literal('DATE("billSaleDetail"."createdAt")'), 'saleDate'],
        [sequelize.fn('SUM', sequelize.literal('qty * "billSaleDetail"."price"')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('qty')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.literal('("billSaleDetail"."price" - "product"."cost") * qty')), 'netProfit'],
        [sequelize.fn('AVG', sequelize.col('product.cost')), 'avgCost'], // เปลี่ยนเป็นค่าเฉลี่ย
        [sequelize.fn('AVG', sequelize.col('product.price')), 'avgPrice'] // เปลี่ยนเป็นค่าเฉลี่ย
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: [],
        required: true
      }, {
        model: BillSaleModel,
        as: 'billSale',
        attributes: [],
        where: {
          status: 'pay' // เพิ่มเงื่อนไขให้ดึงเฉพาะบิลที่ชำระเงินแล้ว
        }
      }],
      where: { 
        userId,
        createdAt: {
          [sequelize.Op.between]: [start, end]
        }
      },
      group: [
        sequelize.literal('DATE("billSaleDetail"."createdAt")')
      ],
      order: [
        [sequelize.literal('DATE("billSaleDetail"."createdAt")'), 'ASC']
      ],
      raw: true
    });

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการใช้งาน
    const processedResults = results.map(item => ({
      saleDate: item.saleDate,
      totalAmount: parseFloat(item.totalAmount) || 0,
      totalQuantity: parseInt(item.totalQuantity) || 0,
      netProfit: parseFloat(item.netProfit) || 0,
      avgCost: parseFloat(item.avgCost) || 0,
      avgPrice: parseFloat(item.avgPrice) || 0
    }));

    res.send({
      message: 'success',
      results: processedResults
    });

  } catch (error) {
    console.error('Error in productDetails:', error);
    res.status(500).send({ message: error.message });
  }
});

// แก้ไข GET endpoint เช่นเดียวกัน
router.get('/productDetails', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    
    // Get today's date by default
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const results = await BillSaleDetailModel.findAll({
      attributes: [
        'productId',
        [sequelize.col('product.name'), 'productName'],
        [sequelize.fn('SUM', sequelize.col('qty')), 'quantity'],
        [sequelize.fn('SUM', sequelize.literal('qty * totalprice')), 'totalAmount'],
        [sequelize.col('product.cost'), 'costPerUnit'],
        [sequelize.col('product.price'), 'pricePerUnit'],
        [sequelize.fn('SUM', 
          sequelize.literal('(totalprice - product.cost) * qty')
        ), 'netProfit'],
        [sequelize.literal('DATE("billSaleDetail"."createdAt")'), 'saleDate']
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: []
      }],
      where: { 
        userId,
        createdAt: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        }
      },
      group: [
        'productId', 
        'product.name', 
        'product.cost', 
        'product.price',
        sequelize.literal('DATE("billSaleDetail"."createdAt")')
      ],
      order: [
        [sequelize.literal('DATE("billSaleDetail"."createdAt")'), 'ASC'],
        ['productId', 'ASC']
      ],
      raw: true
    });

    res.send({
      message: 'success',
      results: results.map(item => ({
        ...item,
        quantity: parseInt(item.quantity) || 0,
        totalAmount: parseFloat(item.totalAmount) || 0,
        costPerUnit: parseFloat(item.costPerUnit) || 0,
        pricePerUnit: parseFloat(item.pricePerUnit) || 0,
        netProfit: parseFloat(item.netProfit) || 0
      }))
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/reportTopSalesDays', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const { startDate, endDate } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(7, 0, 0, 0);
    end.setHours(30, 59, 59, 999);

    const results = await BillSaleDetailModel.findAll({
      attributes: [
        [sequelize.literal('DATE("billSaleDetail"."createdAt" AT TIME ZONE \'Asia/Bangkok\')'), 'date'],
        [sequelize.fn('SUM', 
          sequelize.literal('(totalprice - product.cost) * qty')
        ), 'netProfit']
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: [],
        required: true
      }],
      where: {
        userId,
        createdAt: {
          [sequelize.Op.between]: [start, end]
        }
      },
      group: [sequelize.literal('DATE("billSaleDetail"."createdAt" AT TIME ZONE \'Asia/Bangkok\')')],
      having: sequelize.literal('SUM((totalprice - product.cost) * qty) > 0'),
      order: [[sequelize.fn('SUM', 
        sequelize.literal('(totalprice - product.cost) * qty')
      ), 'DESC']],
      limit: 5,
      raw: true
    });

    // ส่งเฉพาะผลลัพธ์ 5 อันดับแรก 
    res.send({
      message: 'success',
      results: results.map(item => ({
        date: item.date,
        netProfit: parseFloat(item.netProfit) || 0
      }))
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/stock/combinedReport', async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const { startDate, endDate } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    // ใช้ Model API แทน raw query
    const results = await BillSaleDetailModel.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('qty')), 'soldQty'],
        [sequelize.fn('SUM', sequelize.literal('"billSaleDetail"."price" * qty')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.literal('("billSaleDetail"."price" - "product"."cost") * qty')), 'netProfit']
      ],
      include: [{
        model: ProductModel,
        as: 'product',
        attributes: ['name', 'barcode', 'cost', 'price']
      }, {
        model: BillSaleModel,
        as: 'billSale',
        attributes: [],
        where: {
          userId,
          createdAt: { [sequelize.Op.between]: [start, end] },
          status: 'pay'
        }
      }],
      group: ['productId', 'product.id', 'product.name', 'product.barcode', 'product.cost', 'product.price'],
      raw: true
    });

    res.send({
      message: 'success',
      results: results.map(item => ({
        productId: item.productId,
        name: item['product.name'] || 'ไม่ระบุชื่อ',
        barcode: item['product.barcode'] || '-',
        soldQty: parseInt(item.soldQty) || 0,
        cost: parseFloat(item['product.cost']) || 0,
        price: parseFloat(item['product.price']) || 0,
        totalAmount: parseFloat(item.totalAmount) || 0,
        netProfit: parseFloat(item.netProfit) || 0
      }))
    });
  } catch (error) {
    console.error('Error in combined stock report:', error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;