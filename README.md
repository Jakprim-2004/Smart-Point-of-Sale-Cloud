# 🏪 SmartPOS - Smart Point of Sale System

ระบบ Point of Sale (POS) อัจฉริยะสำหรับธุรกิจขนาดเล็กถึงขนาดกลาง พัฒนาด้วยเทคโนโลยีล้ำสมัย React.js และ Node.js พร้อมฟีเจอร์ครบครันสำหรับการจัดการร้านค้าแบบครบวงจร

![SmartPOS Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=SmartPOS+-+Smart+Point+of+Sale+System)

## ✨ คุณสมบัติเด่น

### 💰 ระบบขายหน้าร้าน
- **หน้าจอขายสะดวกใช้** - Interface ที่ออกแบบมาเพื่อความรวดเร็ว
- **ค้นหาลูกค้า** - ค้นหาด้วยชื่อหรือเบอร์โทรศัพท์
- **ระบบแต้มสะสม** - สะสมและใช้แต้มเพื่อรับส่วนลด
- **คำนวณเงินทอนอัตโนมัติ** - ระบบคิดเงินที่แม่นยำ
- **พิมพ์ใบเสร็จ** - ใบเสร็จดิจิทัลและการพิมพ์

### 📦 จัดการสินค้า
- **เพิ่ม/แก้ไข/ลบสินค้า** - จัดการข้อมูลสินค้าครบครัน
- **ระบบบาร์โค้ดอัตโนมัติ** - สร้างบาร์โค้ด EAN-13 อัตโนมัติ
- **อัปโหลดรูปภาพสินค้า** - รองรับหลายรูปภาพต่อสินค้า
- **จัดการหมวดหมู่** - จัดกลุ่มสินค้าเป็นหมวดหมู่
- **ติดตามสต็อก** - เช็คสต็อกสินค้าแบบเรียลไทม์

### 👥 จัดการลูกค้า
- **ฐานข้อมูลลูกค้า** - เก็บข้อมูลลูกค้าและประวัติการซื้อ
- **ระบบสมาชิก** - สมัครสมาชิกและจัดการข้อมูลส่วนตัว
- **ระบบแต้มสะสม** - สะสมแต้มจากการซื้อสินค้า
- **ของรางวัล** - แลกแต้มเป็นของรางวัลหรือส่วนลด

### 📊 รายงานและวิเคราะห์
- **Dashboard แบบเรียลไทม์** - ข้อมูลสำคัญในหน้าเดียว
- **รายงานยอดขาย** - วิเคราะห์ยอดขายรายวัน/เดือน/ปี
- **รายงานสินค้า** - สินค้าขายดี สินค้าคงคลัง
- **รายงานกำไร** - วิเคราะห์กำไรขาดทุน
- **กราฟและชาร์ต** - แสดงผลข้อมูลด้วยกราฟสวยงาม

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React.js 18+** - JavaScript library สำหรับสร้าง UI
- **Bootstrap 5** - CSS framework สำหรับ responsive design
- **Chart.js** - สร้างกราฟและชาร์ต
- **SweetAlert2** - แสดงข้อความแจ้งเตือนสวยงาม
- **React Router** - จัดการ navigation
- **Axios** - HTTP client สำหรับเรียก API

### Backend
- **Node.js + Express.js** - Server-side JavaScript framework
- **MySQL + Sequelize ORM** - ฐานข้อมูลและ Object-Relational Mapping
- **JWT Authentication** - ระบบยืนยันตัวตนแบบ token-based
- **bcrypt** - เข้ารหัสรหัสผ่าน
- **Multer** - จัดการการอัปโหลดไฟล์
- **CORS** - จัดการ Cross-Origin Resource Sharing

### DevOps & Deployment
- **Vercel** - Platform สำหรับ deploy frontend และ backend
- **GitHub** - Version control และ CI/CD
- **MySQL Database** - ฐานข้อมูลสำหรับ production

## 📋 ความต้องการของระบบ

- **Node.js** 16 หรือสูงกว่า
- **npm** หรือ **yarn** package manager
- **MySQL** 8.0 หรือสูงกว่า
- **Git** สำหรับ version control
- **เบราว์เซอร์สมัยใหม่** (Chrome, Firefox, Safari, Edge)

## 🚀 การติดตั้งและใช้งาน

### 1. Clone Repository
```bash
git clone https://github.com/Jakprim-2004/Smart-Point-of-Sale-Cloud.git
cd Smart-Point-of-Sale-Cloud
```

### 2. ติดตั้ง Backend Dependencies
```bash
cd api
npm install
```

### 3. ตั้งค่าฐานข้อมูล
สร้างไฟล์ `.env` ในโฟลเดอร์ `api`:
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=smartpos_db
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. สร้างฐานข้อมูล
```bash
# เข้าสู่ MySQL
mysql -u root -p

# สร้างฐานข้อมูล
CREATE DATABASE smartpos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 5. รัน Database Migrations
```bash
cd api
npm run setup-db
```

### 6. เริ่มต้น Backend Server
```bash
cd api
npm run dev  # Development mode
# หรือ
npm start    # Production mode
```

### 7. ติดตั้งและรัน Frontend
```bash
# เปิด terminal ใหม่
cd web/app
npm install

# สร้างไฟล์ config
cp src/config.example.js src/config.js
```

แก้ไขไฟล์ `src/config.js`:
```javascript
const config = {
  api_path: 'http://localhost:3001',
  
  headers: () => ({
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
};

export default config;
```

### 8. เริ่มต้น Frontend Server
```bash
cd web/app
npm start
```

## 🔐 การเข้าสู่ระบบครั้งแรก

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. คลิก "สมัครสมาชิก" เพื่อสร้างบัญชีผู้ดูแลระบบ
3. กรอกข้อมูลสำหรับบัญชีแรก
4. เข้าสู่ระบบด้วยบัญชีที่สร้าง

## 📱 การใช้งานระบบ

### การจัดการสินค้า
1. **เพิ่มสินค้าใหม่**
   - ไปที่เมนู "จัดการสินค้า"
   - คลิก "เพิ่มสินค้า"
   - กรอกข้อมูล: ชื่อสินค้า, ราคาทุน, ราคาขาย, หมวดหมู่
   - ระบบจะสร้างบาร์โค้ดอัตโนมัติ
   - บันทึกข้อมูล

2. **อัปโหลดรูปภาพสินค้า**
   - คลิกไอคอน "รูปภาพ" ในตารางสินค้า
   - เลือกไฟล์รูปภาพ
   - คลิก "อัปโหลด"

### การขายสินค้า
1. **เลือกสินค้า**
   - ไปที่หน้า "ขายสินค้า"
   - คลิกเลือกสินค้าจากรายการ
   - หรือค้นหาด้วยชื่อ/บาร์โค้ด
   - กำหนดจำนวน

2. **เลือกลูกค้า (ถ้าต้องการสะสมแต้ม)**
   - ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทร
   - เลือกจากรายการที่ค้นหา
   - ระบบจะแสดงแต้มสะสมปัจจุบัน

3. **ชำระเงิน**
   - ตรวจสอบรายการสินค้า
   - ใส่จำนวนเงินที่รับ
   - ระบบคำนวณเงินทอนอัตโนมัติ
   - คลิก "ชำระเงิน"

### การจัดการลูกค้า
1. **เพิ่มลูกค้าใหม่**
   - ไปที่เมนู "จัดการลูกค้า"
   - คลิก "เพิ่มลูกค้า"
   - กรอกข้อมูล: ชื่อ, เบอร์โทร, ที่อยู่

2. **จัดการแต้มสะสม**
   - ดูประวัติการสะสมแต้ม
   - เพิ่ม/ลดแต้มแบบ manual (สำหรับผู้ดูแล)

## 🚀 การ Deploy บน Vercel

### Deploy Frontend
```bash
cd web/app
npm install -g vercel
vercel

# ตั้งค่า Environment Variables ใน Vercel Dashboard
# REACT_APP_API_URL=https://your-api-domain.vercel.app
```

### Deploy Backend
```bash
cd api
vercel

# ตั้งค่า Environment Variables ใน Vercel Dashboard
# DB_HOST=your_mysql_host
# DB_NAME=your_database_name
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret
```

## 🗂️ โครงสร้างโปรเจค

```
Smart-Point-of-Sale-Cloud/
├── api/                          # Backend (Node.js + Express)
│   ├── controllers/              # API Controllers
│   ├── models/                   # Database Models (Sequelize)
│   ├── utils/                    # Utility functions
│   ├── index.js                  # Main server file (Vercel)
│   ├── server.js                 # Local development server
│   └── package.json              # Backend dependencies
├── web/app/                      # Frontend (React.js)
│   ├── public/                   # Static files
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── styles/               # CSS files
│   │   ├── config.js             # API configuration
│   │   └── index.js              # Main React file
│   └── package.json              # Frontend dependencies
├── package.json                  # Root package.json
└── README.md                     # This file
```

## 🔒 ความปลอดภัย

- **JWT Authentication** - ระบบยืนยันตัวตนด้วย JSON Web Token
- **Password Encryption** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Input Validation** - ตรวจสอบข้อมูลก่อนบันทึก
- **SQL Injection Protection** - ใช้ Sequelize ORM ป้องกัน
- **CORS Configuration** - จำกัดการเข้าถึงจาก domain ที่อนุญาต


## 📄 License

โปรเจคนี้เป็น open source 

## 👨‍💻 ผู้พัฒนา

- **Jakprim-2004** - *Lead Developer* - [@Jakprim-2004](https://github.com/Jakprim-2004)


- [React.js](https://reactjs.org/) - UI Library
- [Node.js](https://nodejs.org/) - JavaScript Runtime
- [Express.js](https://expressjs.com/) - Web Framework
- [MySQL](https://mysql.com/) - Database
- [Sequelize](https://sequelize.org/) - ORM
- [Bootstrap](https://getbootstrap.com/) - CSS Framework
- [Chart.js](https://chartjs.org/) - Charting Library
- [Vercel](https://vercel.com/) - Deployment Platform

---

## 🌟 Star ให้กำลังใจ

หากคุณชชอบโปรเจคนี้ อย่าลืม ⭐ Star ให้กำลังใจครับ!

---

**Made with ❤️ in Thailand** 🇹🇭
 
