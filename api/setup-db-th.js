const conn = require('./connect');

async function ตั้งค่าฐานข้อมูล() {
  try {
    console.log('เริ่มต้นการตั้งค่าฐานข้อมูล...');
    
    // นำเข้าโมเดลทั้งหมด
    const BillSaleModel = require('./models/BillSaleModel');
    const BillSaleDetailModel = require('./models/BillSaleDetailModel');
    const CustomerModel = require('./models/CustomerModel');
    const ProductModel = require('./models/ProductModel');
    const PointTransactionModel = require('./models/PointTransactionModel');
    const RewardModel = require('./models/RewardModel');
    
    console.log('นำเข้าโมเดลสำเร็จ');
    
    // ตัวเลือกในการลบตารางเดิมและสร้างใหม่
    const ลบตารางเดิม = process.argv.includes('--force');
    const ตัวเลือกการซิงค์ = ลบตารางเดิม ? { force: true } : { alter: true };
    
    console.log(`กำลังใช้ตัวเลือกการซิงค์: ${JSON.stringify(ตัวเลือกการซิงค์)}`);
    
    // ถ้าเลือกลบตารางเดิม ให้ลบตามลำดับที่ถูกต้อง
    if (ลบตารางเดิม) {
      console.log('กำลังลบตารางตามลำดับ...');
      
      // ลบตารางลูกก่อน
      await BillSaleDetailModel.drop();
      await PointTransactionModel.drop();
      
      // จากนั้นลบตารางหลัก
      await BillSaleModel.drop();
      await CustomerModel.drop();
      await ProductModel.drop();
      await RewardModel.drop();
      
      console.log('ลบตารางสำเร็จ');
    }

    // สร้างตารางตามลำดับการอ้างอิง
    console.log('กำลังสร้างตารางตามลำดับ...');
    
    // สร้างตารางหลักก่อน
    await CustomerModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง Customer สำเร็จ');
    
    await ProductModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง Product สำเร็จ');
    
    await BillSaleModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง BillSale สำเร็จ');
    
    await RewardModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง Reward สำเร็จ');
    
    // จากนั้นสร้างตารางที่พึ่งพาตารางอื่น
    await PointTransactionModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง PointTransaction สำเร็จ');
    
    await BillSaleDetailModel.sync(ตัวเลือกการซิงค์);
    console.log('ซิงค์ตาราง BillSaleDetail สำเร็จ');
    
    console.log('สร้างตารางทั้งหมดสำเร็จ!');
    process.exit(0);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error);
    process.exit(1);
  }
}

// เริ่มต้นกระบวนการตั้งค่า
ตั้งค่าฐานข้อมูล();
