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
        res.statusCode = 500;
        res.send({message: e.message});
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
        
        console.log(`Fetching images for product ${req.params.productId}:`, results.length);
        results.forEach(img => {
            console.log('Image data:', {
                id: img.id,
                imageName: img.imageName,
                imageUrl: img.imageUrl,
                isMain: img.isMain
            });
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
            console.log('Image deleted from Cloudinary:', imageName);
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // ไม่ throw error เพราะข้อมูลในฐานข้อมูลถูกลบแล้ว
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
        
        console.log('All images in database (last 10):');
        results.forEach(img => {
            console.log('Image:', {
                id: img.id,
                productId: img.productId,
                imageName: img.imageName,
                imageUrl: img.imageUrl,
                isMain: img.isMain,
                hasImageUrl: !!img.imageUrl
            });
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