const express = require('express')
const Service = require('./Service')
const app = express()
const ProductImageModel = require('../models/ProductImageModel');
const { cloudinary, upload } = require('../Cloudinary');

// สำหรับการอัพโหลดรูปภาพไปยัง Cloudinary

app.post('/productImage/insert/', Service.isLogin, upload.single('productImage'), async (req, res) => {
    try {        
        // ตรวจสอบว่ามีไฟล์หรือไม่
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาเลือกรูปภาพ' });
        }

        // บันทึกข้อมูลรูปภาพลงฐานข้อมูล
        await ProductImageModel.create({
            isMain: false,
            imageName: req.file.filename, // Cloudinary public_id
            imageUrl: req.file.path, // Cloudinary URL
            productId: req.body.productId
        });

        res.send({ 
            message: 'success',
            imageUrl: req.file.path,
            publicId: req.file.filename
        });
    } catch (e) {
        // จัดการข้อผิดพลาดจากการจำกัดขนาดไฟล์
        if (e.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)',
                error: 'FILE_TOO_LARGE'
            });
        } else if (e.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                message: 'อัปโหลดได้เพียงไฟล์เดียวต่อครั้ง',
                error: 'TOO_MANY_FILES'
            });
        } else if (e.message.includes('Only image files')) {
            return res.status(400).json({ 
                message: 'รองรับเฉพาะไฟล์รูปภาพเท่านั้น',
                error: 'INVALID_FILE_TYPE'
            });
        } else if (e.message.includes('Invalid file extension')) {
            return res.status(400).json({ 
                message: 'นามสกุลไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, GIF, WEBP',
                error: 'INVALID_FILE_EXTENSION'
            });
        }
        
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ',
            error: e.message
        });
    }
})

app.get('/productImage/list/:productId/', Service.isLogin, async (req, res) => {
    try {
        const results = await ProductImageModel.findAll({
            where: {
                productId: req.params.productId
            },
            order: [['id', 'DESC']]
        })
        
        results.forEach(img => {
           
        });
        
        res.send({message: 'success', results: results});
    } catch (e) {
        console.error('List images error:', e);
        res.statusCode = 500;
        res.send({message: e.message});
    }
})
app.delete('/productImage/delete/:id/', Service.isLogin, async (req, res) => {
    try {
        const row = await ProductImageModel.findByPk(req.params.id);
        if (!row) {
            return res.status(404).json({ message: 'ไม่พบรูปภาพ' });
        }

        const imageName = row.imageName; // Cloudinary public_id

        // ลบข้อมูลจากฐานข้อมูล
        await ProductImageModel.destroy({
            where: {
                id: req.params.id
            }
        });

        // ลบรูปภาพจาก Cloudinary
        try {
            await cloudinary.uploader.destroy(imageName);
        } catch (cloudinaryError) {
            return res.status(500).json({ message: 'ไม่สามารถลบรูปภาพจาก Cloudinary ได้' });
        }

        res.send({message: 'success'});
    } catch (e) {
        res.statusCode = 500;
        res.send({message: e.message});
    }
})
app.get('/productImage/chooseMainImage/:id/:productId/', Service.isLogin, async (req, res) => {
    try {
        await ProductImageModel.update({
            isMain: false
        }, {
            where: {
                productId: req.params.productId
            }
        })

        await ProductImageModel.update({
            isMain: true
        }, {
            where: {
                id: req.params.id
            }
        })

        res.send({message: 'success'});
    } catch (e) {
        res.statusCode = 500;
        res.send({message: e.message});
    }
})

// Endpoint สำหรับทดสอบดูข้อมูลรูปภาพทั้งหมด
app.get('/productImage/debug/all/', Service.isLogin, async (req, res) => {
    try {
        const results = await ProductImageModel.findAll({
            order: [['id', 'DESC']],
            limit: 10
        })
        
        results.forEach(img => {
           
        });
        
        res.send({
            message: 'success', 
            results: results,
            summary: {
                total: results.length,
                withImageUrl: results.filter(img => img.imageUrl).length,
                withoutImageUrl: results.filter(img => !img.imageUrl).length
            }
        });
    } catch (e) {
        console.error('Debug all images error:', e);
        res.statusCode = 500;
        res.send({message: e.message});
    }
})

module.exports = app;