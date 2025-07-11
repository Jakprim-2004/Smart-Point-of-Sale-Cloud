const express = require("express");
const app = express();
const ProductModel = require("../models/ProductModel");
const Service = require("./Service");
const { Op } = require('sequelize'); 

// API สำหรับเพิ่มสินค้าใหม่
app.post("/product/insert", Service.isLogin, async (req, res) => {
  try {
    let payload = req.body;
    payload.userId = Service.getMemberId(req);

    const result = await ProductModel.create(payload);
    
    res.send({ result: result, message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// API สำหรับดึงรายการสินค้าทั้งหมด
app.get("/product/list", Service.isLogin, async (req, res) => {
  try {
    const results = await ProductModel.findAll({
      where: {
        userId: Service.getMemberId(req)
      },
      order: [["id", "DESC"]],
    });
    res.send({ results: results, message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// API สำหรับลบสินค้าตาม ID
app.delete("/product/delete/:id", Service.isLogin, async (req, res) => {
  try {
    await ProductModel.destroy({
      where: {
        id: req.params.id,
        userId: Service.getMemberId(req),
      },
    });
    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// API สำหรับอัปเดตข้อมูลสินค้า
app.post("/product/update", Service.isLogin, async (req, res) => {
  try {
    let payload = req.body;
    payload.userId = Service.getMemberId(req);

    await ProductModel.update(payload, {
      where: {
        id: req.body.id,
      },
    });
    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// API สำหรับดึงรายการสินค้าพร้อมรูปภาพหลักสำหรับหน้าร้าน
app.get("/product/listForSale", Service.isLogin, async (req, res) => {
  const ProductImageModel = require("../models/ProductImageModel");

  ProductModel.hasMany(ProductImageModel);

  try {
    const results = await ProductModel.findAll({
      where: {
        userId: Service.getMemberId(req)
      },
      order: [["id", "DESC"]],
      include: {
        model: ProductImageModel,
        where: {
          isMain: true,
        },
      },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// API สำหรับตรวจสอบบาร์โค้ดซ้ำ
app.get('/product/checkBarcode/:barcode', Service.isLogin, async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // ตรวจสอบว่าบาร์โค้ดมีอยู่แล้วหรือไม่
    const product = await ProductModel.findOne({
      where: { 
        barcode: barcode,
        userId: Service.getMemberId(req) // เพิ่มเงื่อนไขเพื่อดูเฉพาะสินค้าของผู้ใช้นั้น
      }
    });
    
    res.json({
      message: 'success',
      exists: !!product // true ถ้ามี, false ถ้าไม่มี
    });
  } catch (error) {
    res.status(500).json({
      message: 'error',
      error: error.message
    });
  }
});

module.exports = app;
