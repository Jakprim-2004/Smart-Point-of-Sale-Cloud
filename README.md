# Smart Point of Sale (POS) System

ระบบ Point of Sale (POS) แบบครบวงจรสำหรับธุรกิจขนาดเล็กถึงขนาดกลาง พัฒนาด้วย React.js และ Node.js พร้อมฐานข้อมูล PostgreSQL (Neon)

## 🚀 คุณสมบัติหลัก

- **จัดการสินค้า**: เพิ่ม/แก้ไข/ลบสินค้า พร้อมระบบบาร์โค้ด
- **อัปโหลดรูปภาพ**: ใช้ Cloudinary สำหรับจัดเก็บรูปภาพสินค้า
- **จัดการหมวดหมู่**: จัดกลุ่มสินค้าตามประเภท
- **ระบบขาย**: หน้าจอขายที่ใช้งานง่าย
- **รายงานยอดขาย**: ติดตามยอดขายรายวัน/เดือน/ปี
- **จัดการผู้ใช้**: ระบบสมาชิกและการจัดการสิทธิ์
- **ฐานข้อมูล Cloud**: ใช้ PostgreSQL จาก Neon สำหรับประสิทธิภาพสูง

## 📋 ความต้องการของระบบ

### Frontend (React.js)
- Node.js 16+ 
- npm หรือ yarn
- React 18+
- Bootstrap 4
- Axios
- SweetAlert2

### Backend (Node.js)
- Node.js 16+
- Express.js
- **PostgreSQL 14+ (Neon Database)**
- Sequelize ORM
- Cloudinary (สำหรับจัดเก็บรูปภาพ)
- JWT Authentication

### Database (PostgreSQL - Neon)
- **Neon Database** (Serverless PostgreSQL)
- หรือ PostgreSQL 14+ สำหรับ local development

## 🛠️ การติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/your-username/Smart-Point-of-Sale.git
cd Smart-Point-of-Sale
```

### 2. ตั้งค่าฐานข้อมูล Neon

1. **สร้างบัญชี Neon**: ไปที่ [neon.tech](https://neon.tech)
2. **สร้าง Project ใหม่**
3. **คัดลอก Connection String** (DATABASE_URL)

### 3. ติดตั้ง Backend Dependencies
```bash
cd api
npm install

# ติดตั้ง PostgreSQL driver
npm install pg pg-hstore

# สร้างไฟล์ .env
cp .env.example .env
```

### 4. การตั้งค่า Environment Variables

แก้ไขไฟล์ `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Neon PostgreSQL Database (Production)
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# Local PostgreSQL Database (Development - Optional)
DB_HOST=localhost
DB_NAME=pos_database
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# CORS Settings
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.vercel.app
```

### 5. การตั้งค่าฐานข้อมูล

#### สำหรับ Neon (Production):
```bash
# ระบบจะใช้ DATABASE_URL โดยอัตโนมัติ
npm run migrate
npm run seed  # (ถ้ามี initial data)
```

#### สำหรับ Local PostgreSQL (Development):
```bash
# ติดตั้ง PostgreSQL locally
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows - ดาวน์โหลดจาก postgresql.org

# สร้างฐานข้อมูล
createdb pos_database

# รัน migrations
npm run migrate
```

### 6. ติดตั้ง Frontend
```bash
cd ../web/app
npm install

# สร้างไฟล์ config
cp src/config.example.js src/config.js
```

แก้ไขไฟล์ `src/config.js`:
```javascript
const config = {
  // สำหรับ Development
  api_path: 'http://localhost:3001',
  
  // สำหรับ Production
  // api_path: 'https://your-backend-api.vercel.app',
  
  headers: () => ({
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('pos_token'),
      'Content-Type': 'application/json'
    }
  })
};

export default config;
```

## 🚀 การรันระบบ

### Development Mode
```bash
# เริ่ม Backend Server
cd api
npm run dev  # รันที่ port 3001

# เริ่ม Frontend Server (terminal ใหม่)
cd web/app
npm start    # รันที่ port 3000
```

### Production Build
```bash
# Build Frontend
cd web/app
npm run build

# Deploy Backend
cd ../../api
npm start
```

## 🗄️ Database Schema (PostgreSQL)

### ตารางหลัก:
- **products**: สินค้าและข้อมูลพื้นฐาน
- **product_images**: รูปภาพสินค้า (เชื่อมต่อ Cloudinary)
- **categories**: หมวดหมู่สินค้า
- **bill_sales**: รายการขาย
- **bill_sale_details**: รายละเอียดการขาย
- **customers**: ข้อมูลลูกค้า
- **members**: สมาชิก
- **users**: ผู้ใช้งานระบบ

### การ Migration Database:
```sql
-- ตัวอย่าง SQL สำหรับ PostgreSQL
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    barcode VARCHAR(13) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    image_name VARCHAR(255),
    image_url TEXT,  -- Cloudinary URL
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📱 การใช้งาน

### 1. เข้าสู่ระบบ
- เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### 2. จัดการสินค้า
1. **เพิ่มสินค้าใหม่**:
   - คลิก "เพิ่มสินค้า"
   - กรอกข้อมูลสินค้า (ชื่อ, ราคาทุน, ราคาขาย, หมวดหมู่, บาร์โค้ด)
   - ระบบจะสร้างบาร์โค้ด 13 หลักอัตโนมัติ หรือกรอกเอง
   - คลิก "บันทึกข้อมูล"

2. **อัปโหลดรูปภาพสินค้า**:
   - คลิกปุ่ม "รูปภาพ" (ไอคอนสีน้ำเงิน) ในตารางสินค้า
   - เลือกไฟล์รูปภาพ (รองรับ JPG, PNG, WEBP)
   - คลิก "อัพโหลดรูปภาพ" - รูปจะถูกเก็บใน Cloudinary
   - เลือก "ภาพหลัก" สำหรับรูปที่จะแสดงในหน้าขาย
   - รองรับหลายรูปต่อสินค้า

3. **จัดการหมวดหมู่**:
   - คลิก "จัดการหมวดหมู่"
   - เพิ่ม/แก้ไข/ลบ หมวดหมู่สินค้า

### 3. การขาย
1. **เลือกสินค้า**:
   - คลิกสินค้าที่ต้องการขาย
   - หรือใช้เครื่องอ่านบาร์โค้ด/พิมพ์บาร์โค้ด
   - กำหนดจำนวน

2. **ชำระเงิน**:
   - ตรวจสอบรายการสินค้า
   - กรอกจำนวนเงินที่รับ
   - คลิก "ชำระเงิน"
   - พิมพ์ใบเสร็จ (ถ้าต้องการ)

### 4. รายงาน
- **รายงานยอดขาย**: ดูยอดขายรายวัน/เดือน/ปี
- **รายงานสินค้า**: ดูสถิติสินค้าขายดี
- **รายงานกำไร**: วิเคราะห์กำไรขาดทุน

## 🔧 การปรับแต่ง

### เปลี่ยนการตั้งค่า Cloudinary
```javascript
// api/Cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่าโฟลเดอร์สำหรับเก็บรูป
const storage = CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-pos', // โฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  },
});
```

### การตั้งค่า PostgreSQL Connection Pool
```javascript
// api/connect.js
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,        // จำนวน connection สูงสุด
    min: 0,        // จำนวน connection ต่ำสุด
    acquire: 60000, // เวลารอ connection (ms)
    idle: 10000    // เวลา idle ก่อนปิด connection
  }
});
```

### เปลี่ยนธีมหรือสีของระบบ
```css
/* web/app/src/index.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
}
```

## 🚀 การ Deploy

### Deploy Frontend บน Vercel
```bash
cd web/app
npm install -g vercel
vercel

# ตั้งค่า Environment Variables ใน Vercel Dashboard:
# REACT_APP_API_URL=https://your-backend-api.vercel.app
```

### Deploy Backend บน Vercel
```bash
cd api
vercel

# ตั้งค่า Environment Variables ใน Vercel:
# DATABASE_URL=postgresql://...  (จาก Neon)
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# JWT_SECRET=...
```

### การตั้งค่า Neon Database สำหรับ Production

1. **Login เข้า Neon Console**: [console.neon.tech](https://console.neon.tech)
2. **สร้าง Branch**: สร้าง branch แยกสำหรับ production และ development
3. **Connection Pooling**: เปิดใช้งาน connection pooler สำหรับประสิทธิภาพ
4. **Backup Settings**: ตั้งค่า backup อัตโนมัติ

```env
# Production Environment Variables
DATABASE_URL=postgresql://user:pass@hostname/dbname?sslmode=require&pgbouncer=true
```

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **รูปภาพไม่แสดง**:
   - ตรวจสอบการตั้งค่า Cloudinary API keys
   - ดู Network tab ใน Developer Tools
   - ตรวจสอบ CORS settings
   - ตรวจสอบว่า imageUrl ถูกบันทึกในฐานข้อมูล

2. **PostgreSQL/Neon เชื่อมต่อไม่ได้**:
   - ตรวจสอบ DATABASE_URL ใน .env
   - ตรวจสอบว่า SSL certificate ถูกต้อง
   - ตรวจสอบ connection pooling settings
   - ลองเทสการเชื่อมต่อ: `npm run db:test`

3. **API ไม่ทำงาน**:
   - ตรวจสอบ port ที่ใช้
   - ดู console logs ใน backend
   - ตรวจสอบ CORS configuration
   - ตรวจสอบ JWT token expiration

4. **Migration ล้มเหลว**:
   ```bash
   # รีเซ็ต migrations
   npm run db:reset
   npm run migrate
   ```

### Debug Commands
```bash
# ตรวจสอบการเชื่อมต่อฐานข้อมูล
npm run db:test

# ดู Database schema
npm run db:schema

# เปิด debug mode สำหรับ backend
DEBUG=* npm run dev

# ตรวจสอบ Cloudinary connection
npm run cloudinary:test
```

### Database Queries สำหรับ Debug
```sql
-- ตรวจสอบข้อมูลสินค้าและรูปภาพ
SELECT 
  p.id, 
  p.name, 
  p.barcode,
  pi.image_url,
  pi.is_main
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.id;

-- ตรวจสอบรูปภาพที่ไม่มี URL
SELECT * FROM product_images WHERE image_url IS NULL OR image_url = '';

-- อัปเดตรูปภาพเก่าให้มี URL (Migration)
UPDATE product_images 
SET image_url = 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/smart-pos/' || image_name || '.jpg'
WHERE image_url IS NULL AND image_name IS NOT NULL;
```

## 🔒 Security Features

- **JWT Authentication**: ระบบ token-based authentication
- **Password Hashing**: ใช้ bcrypt สำหรับเข้ารหัสรหัสผ่าน
- **SSL/TLS**: การเชื่อมต่อฐานข้อมูล Neon ผ่าน SSL
- **CORS Protection**: ป้องกันการเข้าถึงจาก domain ที่ไม่ได้รับอนุญาต
- **Input Validation**: ตรวจสอบข้อมูลก่อนบันทึก
- **SQL Injection Protection**: ใช้ Sequelize ORM ป้องกัน SQL injection

## ⚡ Performance Optimization

### Database (Neon PostgreSQL)
- **Connection Pooling**: จัดการ connection อย่างมีประสิทธิภาพ
- **Indexing**: สร้าง index สำหรับการค้นหาที่เร็วขึ้น
- **Query Optimization**: ใช้ Sequelize optimized queries

### Image Storage (Cloudinary)
- **Automatic Optimization**: รูปภาพถูก optimize อัตโนมัติ
- **CDN**: ใช้ global CDN สำหรับโหลดรูปเร็วขึ้น
- **Responsive Images**: รองรับรูปภาพหลายขนาด

### Frontend Optimization
- **Code Splitting**: แบ่งโหลด JavaScript เป็นส่วนๆ
- **Lazy Loading**: โหลดข้อมูลเมื่อจำเป็น
- **Caching**: ใช้ browser cache อย่างเหมาะสม

## 🤝 การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📄 License

โครงการนี้อยู่ภายใต้ MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

## 🛠️ Technology Stack

### Backend
- **Node.js + Express.js**: Server framework
- **PostgreSQL (Neon)**: Serverless database
- **Sequelize ORM**: Database abstraction layer
- **Cloudinary**: Image storage and optimization
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Frontend
- **React.js**: UI framework
- **Bootstrap 4**: CSS framework
- **Axios**: HTTP client
- **SweetAlert2**: Alert dialogs
- **React Router**: Navigation

### DevOps & Deployment
- **Vercel**: Hosting platform
- **Neon**: Serverless PostgreSQL
- **GitHub**: Version control
- **npm**: Package management

## 👥 ผู้พัฒนา

- **Kaimuk** - *Initial work* - [YourGitHub](https://github.com/jakprim-2004)

## 🙏 กิตติกรรมประกาศ

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://postgresql.org/)
- [Neon Database](https://neon.tech/)
- [Sequelize](https://sequelize.org/)
- [Cloudinary](https://cloudinary.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Vercel](https://vercel.com/)

---


### 📞 Quick Start Guide

1. **สร้างบัญชี Neon**: [neon.tech](https://neon.tech)
2. **สร้างบัญชี Cloudinary**: [cloudinary.com](https://cloudinary.com)
3. **Clone โปรเจกต์และติดตั้ง dependencies**
4. **ตั้งค่า environment variables**
5. **รัน migration และ seed data**
6. **เริ่มใช้งานระบบ POS**

🎉 **Happy Coding!**
"# Smart-Point-of-Sale-Cloud" 
"# Smart-Point-of-Sale-Cloud" 
"# Smart-Point-of-Sale-Cloud" 
