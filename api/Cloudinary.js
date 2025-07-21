const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-pos', // folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      // สร้าง unique filename
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      return `product_${timestamp}_${randomNum}`;
    },
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit - เพิ่มจาก 5MB เพื่อรองรับภาพคุณภาพสูง
    files: 1, // จำกัดการอัปโหลดเป็นไฟล์เดียวต่อ request
    fields: 10, // จำกัดจำนวน field ใน form
    fieldNameSize: 100, // จำกัดขนาดชื่อ field
    fieldSize: 1024 * 1024 // จำกัดขนาดข้อมูลในแต่ละ field เป็น 1MB
  },
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์
    if (file.mimetype.startsWith('image/')) {
      // เพิ่มการตรวจสอบนามสกุลไฟล์เพื่อความปลอดภัย
      const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
      if (!allowedExtensions.test(file.originalname)) {
        cb(new Error('Invalid file extension. Only JPG, JPEG, PNG, GIF, and WEBP are allowed!'), false);
        return;
      }
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload
};