const express = require("express");
const MemberModel = require("../models/MemberModel");
const { Op } = require("sequelize");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const service = require("./Service");
const { encryptPassword, comparePassword } = require('../utils/encryption');

app.post("/member/check-duplicate", async (req, res) => {
  try {
    const { email, phone } = req.body;
    let whereClause = {};
    
    if (email) {
      whereClause.email = email;
    }
    if (phone) {
      whereClause.phone = phone;
    }

    const existingMember = await MemberModel.findOne({
      where: whereClause
    });

    res.send({
      isDuplicate: !!existingMember,
      message: existingMember ? 
        `${email ? 'อีเมล' : 'เบอร์โทรศัพท์'}นี้มีผู้ใช้งานแล้ว` : 
        'สามารถใช้งานได้'
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

app.post("/member/signin", async (req, res) => {
  try {
    const searchCriteria = {};
    if (req.body.email) {
      searchCriteria.email = req.body.email;
    }
    if (req.body.phone) {
      searchCriteria.phone = req.body.phone;
    }

    const member = await MemberModel.findOne({
      where: {
        [Op.or]: [searchCriteria]
      }
    });

    if (member) {
      const validPassword = await comparePassword(req.body.password, member.pass);
      if (validPassword) {
        // Set token expiration to 24 hours for better security
        let token = jwt.sign(
          { id: member.id }, 
          process.env.secret, 
          { expiresIn: '24h' }
        );
        res.send({ token: token, message: "success" });
      } else {
        res.statusCode = 401;
        res.send({ message: "รหัสผ่านไม่ถูกต้อง" });
      }
    } else {
      res.statusCode = 401;
      res.send({ message: "ไม่พบบัญชีผู้ใช้" });
    }
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.post("/member/register", async (req, res) => {
  try {
    const encryptedPassword = await encryptPassword(req.body.password);
    
    const payload = {
      email: req.body.email,
      phone: req.body.phone,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      pass: encryptedPassword, 
    };

    const member = await MemberModel.create(payload);
    res.send({ message: "success", result: member });
  } catch (e) {
    res.statusCode = 500; 
    res.send({ message: e.message });
  }
});

app.get("/member/info", service.isLogin, async (req, res, next) => {
    try {
      // Use jwt.verify() instead of jwt.decode() for security
      const payLoad = jwt.verify(service.getToken(req), process.env.secret);
      const member = await MemberModel.findByPk(payLoad.id, {
        attributes: [
          "id",
          "email",
          "firstName",
          "lastName",
          "phone",
        ]
      });
  
      if (!member) {
        return res.status(404).send({ message: "ไม่พบข้อมูลสมาชิก" });
      }
  
      res.send({ result: member, message: "success" });
    } catch (e) {
      // Handle JWT verification errors specifically
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
        res.status(401).send({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
      } else {
        res.statusCode = 500;
        res.send({ message: e.message });
      }
    }
  });

app.get("/member/list", service.isLogin, async (req, res) => {
  try {
    const results = await MemberModel.findAll({
      order: [["id", "DESC"]],
      attributes: [
        "id", 
        "firstName", 
        "lastName", 
        "email",
        "phone", 
        "createdAt"
      ],
    });

    res.send({ 
      message: "success", 
      results: results.map(member => ({
        ...member.toJSON(),
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim()
      }))
    });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

module.exports = app;
