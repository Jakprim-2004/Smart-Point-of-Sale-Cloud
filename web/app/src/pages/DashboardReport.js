import React, { useEffect, useState } from "react";
import Template from "../components/Template";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

function Dashboard() {
  const myDate = new Date();
  const [year, setYear] = useState(myDate.getFullYear());
  const [month, setMonth] = useState(myDate.getMonth() + 1);
  const [viewType, setViewType] = useState("daily");
  const [arrYear,] = useState(() => {
    let arr = [];
    const y = myDate.getFullYear();
    const startYear = y - 5;
    for (let i = startYear; i <= y; i++) {
      arr.push(i);
    }
    return arr;
  });

  const [myData, setMyData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topSellingCategories, setTopSellingCategories] = useState([]);  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  // เพิ่มฟังก์ชันสำหรับแสดงชื่อเดือนภาษาไทย
  const getThaiMonthName = (monthNumber) => {
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
      "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", 
      "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return thaiMonths[monthNumber - 1];
  };
    const [options,] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          title: function(tooltipItems) {
            const day = tooltipItems[0].label;
            return `${day}`;
          },
          label: function (tooltipItem) {
            let label = tooltipItem.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += parseFloat(tooltipItem.raw).toFixed(2) + " บาท";
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function (value) {
            return parseFloat(value).toFixed(2);
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      },
    },
  });

  const [dateRange, setDateRange] = useState("today");
  const [dateRangeValue, setDateRangeValue] = useState([null, null]);
  const [salesData, setSalesData] = useState([]);
  const [activeSection, setActiveSection] = useState('sales');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [productDateRange, setProductDateRange] = useState([new Date(), new Date()]);
  const [topSalesDays, setTopSalesDays] = useState([]);  const [showSold, setShowSold] = useState(true);  const [showRemaining, setShowRemaining] = useState(false);
  const [combinedStockData, setCombinedStockData] = useState([]);

  useEffect(() => {
    reportSumSalePerMonth();
    reportStock();
    reportTopSellingProducts();
    reportTopSellingCategories();
    fetchSalesData();
    if (activeSection === 'stock') {
      fetchProductDetails();
    }
  }, [year, month, viewType, dateRange, dateRangeValue, activeSection, productDateRange]);

  useEffect(() => {
    if (activeSection === 'stock') {
      fetchTopSalesDays();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'stock' && productDateRange[0] && productDateRange[1]) {
      fetchTopSalesDays();
      fetchProductDetails();
    }
  }, [productDateRange, activeSection]);

  useEffect(() => {
    if (activeSection === 'timeline') {
      fetchCombinedStockData();
    }
  }, [activeSection, dateRange, dateRangeValue]);

  const reportSumSalePerMonth = async () => {
    try {
      const url = config.api_path + "/reportSumSalePerMonth";
      const payload = { year, month, viewType };      const res = await axios.post(url, payload, config.headers());      if (res.data.message === "success") {
        // คัดกรองและตรวจสอบข้อมูลที่ได้รับ
        const results = res.data.results || [];
        
        // สร้างรายการข้อมูลที่ละเอียดมากขึ้นเพื่อการตรวจสอบ
        const detailedData = results.map(item => ({
          day: item.day,
          month: item.month,
          sum: parseFloat(item.sum || 0),
          profit: parseFloat(item.profit || 0),
          cost: parseFloat(item.cost || 0),
          hasData: (parseFloat(item.sum || 0) > 0 || parseFloat(item.profit || 0) > 0 || parseFloat(item.cost || 0) > 0)
        }));
        
        console.log("ข้อมูลที่ได้รับจาก API:", {
          จำนวนข้อมูล: results.length,
          วันที่มีข้อมูล: detailedData
            .filter(item => item.hasData)
            .map(item => item.day)
            .sort((a,b) => a-b)
            .join(", "),
          ข้อมูลละเอียด: detailedData
        });
        
        // ตรวจสอบข้อมูลของวันที่ 14 และ 15 มิถุนายน
        const day14 = detailedData.find(item => item.day === 14);
        const day15 = detailedData.find(item => item.day === 15);
        
        if (month === 6) { // มิถุนายน
          console.log("ข้อมูลวันที่ 14:", day14 ? day14 : "ไม่พบข้อมูล");
          console.log("ข้อมูลวันที่ 15:", day15 ? day15 : "ไม่พบข้อมูล");
        }
        
        let salesData = [],
          profitData = [],
          costData = [];// ไม่คำนวณ VAT เพิ่ม
        if (viewType === "daily") {
          const daysInMonth = new Date(year, month, 0).getDate();
          salesData = Array(daysInMonth).fill(0);
          profitData = Array(daysInMonth).fill(0);
          costData = Array(daysInMonth).fill(0);
          results.forEach((item) => {
            // ใช้ค่าโดยตรงไม่บวก VAT
            salesData[item.day - 1] = parseFloat(item.sum || 0);
            profitData[item.day - 1] = parseFloat(item.profit || 0);
            costData[item.day - 1] = parseFloat(item.cost || 0);
          });
        } else if (viewType === "weekly") {
          const weeksInMonth = 4;
          salesData = Array(weeksInMonth).fill(0);
          profitData = Array(weeksInMonth).fill(0);
          costData = Array(weeksInMonth).fill(0);
          results.forEach((item) => {
            const weekOfMonth = Math.ceil(new Date(year, month - 1, item.day).getDate() / 7);
            if (weekOfMonth <= weeksInMonth) {
              // ใช้ค่าโดยตรงไม่บวก VAT
              salesData[weekOfMonth - 1] = parseFloat(item.sum || 0);
              profitData[weekOfMonth - 1] = parseFloat(item.profit || 0);
              costData[weekOfMonth - 1] = parseFloat(item.cost || 0);
            }
          });
        } else if (viewType === "monthly") {
          salesData = Array(12).fill(0);
          profitData = Array(12).fill(0);
          costData = Array(12).fill(0);
          results.forEach((item) => {
            // ใช้ค่าโดยตรงไม่บวก VAT
            salesData[item.month - 1] = parseFloat(item.sum || 0);
            profitData[item.month - 1] = parseFloat(item.profit || 0);
            costData[item.month - 1] = parseFloat(item.cost || 0);
          });
        }        let labels = [];
        
        // สร้าง labels ตามประเภทการแสดงผล
        if (viewType === "monthly") {
          // กรณีแสดงรายเดือน
          labels = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
            "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
            "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
          ];
        } else if (viewType === "weekly") {
          // กรณีแสดงรายสัปดาห์
          labels = Array.from({ length: 4 }, (_, i) => `สัปดาห์ที่ ${i + 1}`);
        } else {
          // กรณีแสดงรายวัน
          
          // 1. หาวันที่มีข้อมูลจริง
          const daysWithData = [];
          results.forEach(item => {
            if (item.day) {
              daysWithData.push(parseInt(item.day));
            }
          });
            // 2. สร้าง map ของข้อมูลตามวันที่
          const dataByDay = {};
          
          // แสดงข้อมูลดิบที่ได้รับจาก API เพื่อตรวจสอบ
          console.log("ข้อมูลที่ได้รับจาก API:", results);
          
          results.forEach(item => {
            if (item.day) {
              // บันทึกวันที่เป็นตัวเลขจำนวนเต็ม (integer)
              const day = parseInt(item.day);
              dataByDay[day] = {
                sum: parseFloat(item.sum || 0),
                profit: parseFloat(item.profit || 0),
                cost: parseFloat(item.cost || 0),
                day: day
              };
              console.log(`มีข้อมูลของวันที่: ${day}`);
            }
          });
            // แก้ไขเพื่อแสดงทุกวันในเดือนอย่างเดียว (ไม่มีตัวเลือกแสดงเฉพาะวันที่มีข้อมูล)
          const daysInMonth = new Date(year, month, 0).getDate();
          
          // สร้างข้อมูลใหม่สำหรับทุกวัน
          const newLabels = [];
          const newSalesData = Array(daysInMonth).fill(0);
          const newProfitData = Array(daysInMonth).fill(0);
          const newCostData = Array(daysInMonth).fill(0);
            // แสดงรายการวันที่มีข้อมูลจาก results
          console.log("วันที่มีข้อมูลในผลลัพธ์:", daysWithData.join(", "));
          
          // สร้าง labels สำหรับทุกวัน
          for (let i = 1; i <= daysInMonth; i++) {
            newLabels.push(`${i} ${getThaiMonthName(month)}`);
              
            // ใส่ข้อมูลตามวันที่ถ้ามี
            if (dataByDay[i]) {
              newSalesData[i-1] = dataByDay[i].sum;
              newProfitData[i-1] = dataByDay[i].profit; 
              newCostData[i-1] = dataByDay[i].cost;
              console.log(`กำหนดค่าวันที่ ${i}: ยอดขาย=${dataByDay[i].sum}, กำไร=${dataByDay[i].profit}, ต้นทุน=${dataByDay[i].cost}`);
            } else {
              // แสดงวันที่ไม่มีข้อมูล
              console.log(`วันที่ ${i} ไม่มีข้อมูล`);
            }
          }
          
          labels = newLabels;
          salesData = newSalesData;
          profitData = newProfitData;
          costData = newCostData;        }
          // ตรวจสอบวันที่มีข้อมูล
        const daysWithData = [];
        for (let i = 0; i < salesData.length; i++) {
          if (salesData[i] > 0 || costData[i] > 0 || profitData[i] > 0) {
            daysWithData.push(i + 1);
          }
        }
        
        console.log(`วันที่มีข้อมูลในกราฟ: ${daysWithData.join(', ')}`);
        
        // ตรวจสอบพิเศษสำหรับวันที่ 14 และ 15 มิถุนายน
        if (month === 6) { // มิถุนายน
          console.log(`ข้อมูลวันที่ 14 มิถุนายน: ยอดขาย=${salesData[14-1]}, ต้นทุน=${costData[14-1]}, กำไร=${profitData[14-1]}`);
          console.log(`ข้อมูลวันที่ 15 มิถุนายน: ยอดขาย=${salesData[15-1]}, ต้นทุน=${costData[15-1]}, กำไร=${profitData[15-1]}`);
          
          // ตรวจสอบว่ามีข้อมูลของวันที่ 15 หรือไม่ในข้อมูลดิบ
          const day15Data = results.find(item => item.day === 15);
          if (day15Data) {
            console.log("พบข้อมูลวันที่ 15 มิถุนายนในข้อมูลดิบ:", day15Data);
            // ให้แน่ใจว่าข้อมูลถูกใส่ในกราฟ
            salesData[15-1] = parseFloat(day15Data.sum || 0);
            profitData[15-1] = parseFloat(day15Data.profit || 0);
            costData[15-1] = parseFloat(day15Data.cost || 0);
          } else {
            console.warn("ไม่พบข้อมูลวันที่ 15 มิถุนายนในข้อมูลดิบ");
          }
        }
        
        setMyData({
          labels,
          datasets: [
            {
              label: "ยอดขาย",
              data: salesData,
              backgroundColor: "rgba(54, 162, 235, 0.4)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              tension: 0.3,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: "ต้นทุน",
              data: costData,
              backgroundColor: "rgba(255, 99, 132, 0.4)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              tension: 0.3,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: "กำไร",
              data: profitData,
              backgroundColor: "rgba(75, 192, 192, 0.4)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              tension: 0.3,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ],
        });

        // ไม่บวก VAT
        setTotalSales(res.data.totalSales);
        setTotalProfit(res.data.totalProfit);
        setTotalCost(res.data.totalCost);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const reportStock = async () => {
    try {
      const url = config.api_path + "/reportStock";
      const res = await axios.get(url, config.headers());
      if (res.data.message === "success") {
        const results = res.data.results;
        let stockData = results
          .map((item) => ({
            productId: item.productId,
            productName: item.productName,
            remainingQty: item.totalQty,
          }))
          .sort((a, b) => a.remainingQty - b.remainingQty);

        setStockData(stockData);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const reportTopSellingProducts = async () => {
    try {
      const url = config.api_path + "/reportTopSellingProducts";
      const res = await axios.get(url, config.headers());
      if (res.data.message === "success") {
        const results = res.data.results;
        const filteredResults = results.slice(0, 5);
        setTopSellingProducts(filteredResults);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const reportTopSellingCategories = async () => {
    try {
      const url = config.api_path + "/reportTopSellingCategories";
      const res = await axios.get(url, config.headers());
      if (res.data.message === "success") {
        const results = res.data.results;
        const filteredResults = results.slice(0, 5);
        setTopSellingCategories(filteredResults);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchSalesData = async () => {
    try {
      const url = config.api_path + "/reportSalesByDateRange";
      const [start, end] = dateRangeValue;

      if (dateRange === 'custom' && (!start || !end)) {
        setSalesData([]);
        return;
      }

      const payload = {
        dateRange,
        customStartDate: start ? start.toISOString() : null,
        customEndDate: end ? end.toISOString() : null
      };

      const res = await axios.post(url, payload, config.headers());
      if (res.data.message === "success") {
        setSalesData(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchProductDetails = async () => {
    try {
      const url = config.api_path + "/productDetails";
      // Use productDateRange instead of dateRange
      const [start, end] = productDateRange;
      if (!start || !end) return;

      const startDate = new Date(start);
      const endDate = new Date(end);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const res = await axios.post(url, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }, config.headers());

      if (res.data.message === "success") {
        setProductDetails(res.data.results);
      }
    } catch (e) {
      console.error('Error fetching product details:', e);
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchTopSalesDays = async () => {
    try {
      const [start, end] = productDateRange;
      if (!start || !end) return;

      // Clone the dates to avoid modifying the original dates
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Set time to beginning and end of days
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const res = await axios.post(
        `${config.api_path}/reportTopSalesDays`,
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        config.headers()
      );

      if (res.data.message === 'success') {
        setTopSalesDays(res.data.results);
      }
    } catch (error) {
      console.error('Error fetching top sales days:', error);
    }
  };

  const fetchCombinedStockData = async () => {
    try {
      // First fetch stock report data
      const stockReportRes = await axios.get(`${config.api_path}/stock/report`, config.headers());
      const stockReport = stockReportRes.data.results || [];

      // Then fetch combined report data
      const url = config.api_path + "/stock/combinedReport";
      let startDate = new Date();
      let endDate = new Date();

      // กำหนดช่วงเวลาตามที่เลือก
      switch (dateRange) {
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          endDate = new Date(startDate);
          break;
        case 'last7days':
          startDate.setDate(startDate.getDate() - 6);
          break;
        case 'last30days':
          startDate.setDate(startDate.getDate() - 29);
          break;
        case 'lastMonth':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          break;
        case 'custom':
          if (dateRangeValue[0] && dateRangeValue[1]) {
            startDate = dateRangeValue[0];
            endDate = dateRangeValue[1];
          }
          break;
        // case 'today' เป็นค่าเริ่มต้น ไม่ต้องกำหนดอะไร
      }

      // ตั้งค่าเวลาเริ่มต้นและสิ้นสุด
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // เรียก API combinedReport
      const res = await axios.post(url, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dateRange: dateRange
      }, config.headers());

      // ตรวจสอบผลลัพธ์
      if (res.data.message === "success") {
        console.log("API Response:", res.data.results);

        // สร้าง map ของข้อมูล stock
        const stockMap = new Map(stockReport.map(item => [item.result.id, {
          stockIn: item.stockIn || 0,
          stockOut: item.stockOut || 0,
          remainingQty: item.stockIn - item.stockOut
        }]));

        // รวมข้อมูลการขายกับข้อมูล stock และคำนวณกำไรที่ถูกต้อง
        const combinedData = res.data.results.map(item => {
          const stockData = stockMap.get(item.productId) || { remainingQty: 0 };

          // คำนวณกำไรสุทธิอีกครั้งเพื่อความถูกต้อง
          const calculatedProfit = (item.price - item.cost) * item.soldQty;

          // ใช้ค่าที่คำนวณใหม่เสมอ เนื่องจากพบปัญหากับข้อมูลจาก API
          return {
            ...item,
            remainingQty: Math.max(0, stockData.remainingQty),
            barcode: item.barcode || '-',
            name: item.name || 'ไม่ระบุชื่อ',
            cost: typeof item.cost === 'number' ? item.cost : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            // ใช้ค่ากำไรที่คำนวณเอง แทนค่าจาก API ที่อาจไม่ถูกต้อง
            netProfit: calculatedProfit
          };
        });

        // เรียงลำดับตามกำไรสุทธิจากมากไปน้อย
        combinedData.sort((a, b) => b.netProfit - a.netProfit);

        setCombinedStockData(combinedData);
      } else {
        console.error('Error response from API:', res.data);
        Swal.fire({
          title: "ไม่สามารถดึงข้อมูลได้",
          text: "ระบบไม่สามารถดึงข้อมูลสินค้าได้ในขณะนี้",
          icon: "warning"
        });
      }
    } catch (e) {
      console.error('Error fetching combined stock data:', e);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error"
      });
    }
  };


  useEffect(() => {
    if (activeSection === 'stock') {
      fetchProductDetails();
    }
  }, [dateRange, dateRangeValue, activeSection]);

  const renderTopSalesDaysChart = () => {
    const formattedData = topSalesDays.map(day => {
      const date = new Date(day.date);
      const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const dayText = isToday ? 'วันนี้' : thaiDays[date.getDay()];

      const total = topSalesDays.reduce((sum, d) => sum + d.netProfit, 0);
      const percentage = total > 0 ? ((day.netProfit / total) * 100).toFixed(2) : '0.00';

      return {
        label: `${date.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()]} ${date.getFullYear() + 543} ${dayText}`,
        amount: day.netProfit,
        percentage
      };
    });

    return (
      <div className="card mt-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">กำไรสุทธิตามช่วงวันที่ (5 อันดับสูงสุด)</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: formattedData.map(day => day.label),
                    datasets: [{
                      label: 'กำไรสุทธิ',
                      data: formattedData.map(day => day.amount),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `฿${formatNumber(context.raw)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        }
                      },
                      y: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="sales-summary">
                {formattedData.map((day, index) => (
                  <div key={index} className="mb-2 p-2 bg-light rounded">
                    <div className="small">{day.label}</div>
                    <div className="h6 mb-0">฿{formatNumber(day.amount)}</div>
                    <div className="small text-muted">({day.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopSalesChart = () => {
    const sortedProducts = [...combinedStockData]
      .sort((a, b) => b.netProfit - a.netProfit) // เปลี่ยนจาก soldQty เป็น netProfit
      .slice(0, 5);

    const chartColors = [
      { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },   // เขียว
      { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },   // น้ำเงิน
      { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },   // แดง
      { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' },   // ส้ม
      { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' }  // ม่วง
    ];

    return (
      <div className="card mt-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">สินค้าที่ทำกำไรสูงสุด 5 อันดับ</h5>
        </div>
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar
              data={{
                labels: sortedProducts.map(item => item.name),
                datasets: [{
                  label: 'กำไรสุทธิ',
                  data: sortedProducts.map(item => item.netProfit),
                  backgroundColor: sortedProducts.map((_, index) => chartColors[index].bg),
                  borderColor: sortedProducts.map((_, index) => chartColors[index].border),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `฿${formatNumber(context.raw)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return '฿' + formatNumber(value);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const summaryCardStyle = {
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    height: "100%",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    margin: window.innerWidth < 768 ? '0 0 15px 0' : '0'
  };

  const sidebarStyle = {
    width: window.innerWidth < 768
      ? '100%'
      : (isSidebarCollapsed ? '60px' : '250px'),
    height: window.innerWidth < 768 ? 'auto' : '100vh',
    padding: isSidebarCollapsed && window.innerWidth >= 768 ? '20px 5px' : '20px',
    position: window.innerWidth < 768 ? 'relative' : 'sticky',
    top: 0,
    overflowY: 'auto',
    borderRight: window.innerWidth < 768 ? 'none' : '1px solid #e0e0e0',
    borderBottom: window.innerWidth < 768 ? '1px solid #e0e0e0' : 'none',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    zIndex: 1000
  };

  const mainContentStyle = {
    flex: 1,
    padding: '20px',
    marginLeft: window.innerWidth < 768 ? 0 : (isSidebarCollapsed ? '60px' : '250px'),
    width: window.innerWidth < 768 ? '100%' : 'auto',
    overflowX: 'hidden'
  };

  const containerWrapperStyle = {
    display: 'flex',
    width: '100%',
    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
    overflow: 'hidden'
  };

  const menuItemStyle = (isActive) => ({
    padding: isSidebarCollapsed ? '12px 0' : '12px 20px',
    margin: '8px 0',
    cursor: 'pointer',
    color: isActive ? 'white' : '#6c757d',
    backgroundColor: isActive ? '#1976d2' : 'transparent',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
    '&:hover': {
      backgroundColor: isActive ? '#1565c0' : '#f8f9fa',
      color: isActive ? 'white' : '#2c3e50'
    }
  });

  const menuTitleStyle = {
    color: '#6c757d',
    fontSize: '1.1rem',
    fontWeight: '500',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: isSidebarCollapsed ? 'center' : 'space-between'
  };

  const toggleButtonStyle = {
    cursor: 'pointer',
    padding: '5px',
    color: '#6c757d'
  };

  const iconStyle = {
    width: '20px',
    textAlign: 'center',
    fontSize: '1.1rem',
    marginRight: isSidebarCollapsed ? '0' : '10px'
  };

  const formatNumber = (num) => {
    return Number(num).toLocaleString("th-TH");
  };

  const renderStockSection = () => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
      const dayAbbr = date.getTime() === today.getTime() ? 'วันนี้' : thaiDays[date.getDay()];

      return {
        fullDate: date.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        dayAbbr
      };
    };


    return (
      <div className="col-md-12">
        <div className="card" style={summaryCardStyle}>
          <div className="card-header bg-white">
            <div className="row align-items-center">
              <div className="col">
                <h4 className="mb-0">รายละเอียดยอดขาย</h4>
              </div>
              <div className="col-auto">
                <DatePicker
                  selectsRange={true}
                  startDate={productDateRange[0]}
                  endDate={productDateRange[1]}
                  onChange={(update) => {
                    setProductDateRange(update);
                  }}
                  maxDate={new Date()}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                  isClearable={true}
                  placeholderText="เลือกช่วงวันที่"
                />
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table" style={{
                borderSpacing: '0 8px',
                borderCollapse: 'separate'
              }}>
                <thead>
                  <tr style={{ background: 'none' }}>
                    <th style={{ border: 'none', padding: '12px 8px' }}>วันที่จำหน่าย</th>
                    <th style={{ border: 'none', padding: '12px 8px' }}>ยอดรวม</th>
                    <th style={{ border: 'none', padding: '12px 8px' }}>ทุนต่อชิ้น</th>
                    <th style={{ border: 'none', padding: '12px 8px' }}>ขายต่อชิ้น</th>
                    <th style={{ border: 'none', padding: '12px 8px' }}>กำไรสุทธิ</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((item, index) => {
                    const { fullDate, dayAbbr } = formatDate(item.saleDate);
                    return (
                      <tr key={index} style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <td style={{ border: 'none', padding: '12px 8px' }}>
                          {`${fullDate} ${dayAbbr}`}
                        </td>
                        <td style={{ border: 'none', padding: '12px 8px' }}>{formatNumber(item.totalAmount)} บาท</td>
                        <td style={{ border: 'none', padding: '12px 8px' }}>{formatNumber(item.avgCost)} บาท</td>
                        <td style={{ border: 'none', padding: '12px 8px' }}>{formatNumber(item.avgPrice)} บาท</td>
                        <td style={{ border: 'none', padding: '12px 8px' }}>{formatNumber(item.netProfit)} บาท</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              {renderTopSalesDaysChart()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const chartContainerStyle = {
    height: window.innerWidth < 768 ? '300px' : '500px',
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    overflowX: 'auto'
  };

  const tableWrapperStyle = {
    overflowX: 'auto',
    width: '100%',
    fontSize: window.innerWidth < 768 ? '14px' : '16px'
  };

  useEffect(() => {
    const handleResize = () => {

      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  return (
    <Template>
      <div style={containerWrapperStyle}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div className="mb-2">
            <div style={menuTitleStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isSidebarCollapsed && <span style={{ marginRight: '-4px' }}>รายงานสินค้า</span>}
                <i
                  className={`fas fa-${isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}
                  style={toggleButtonStyle}
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
              </div>
            </div>
            <div
              style={menuItemStyle(activeSection === 'sales')}
              onClick={() => setActiveSection('sales')}
              className="d-flex align-items-center"
              title="ยอดขาย"
            >
              <i className="fas fa-chart-line" style={iconStyle} />
              {!isSidebarCollapsed && <span className="ms-2">กราฟ</span>}
            </div>



            <div
              style={menuItemStyle(activeSection === 'timeline')}
              onClick={() => setActiveSection('timeline')}
              className="d-flex align-items-center"
              title="สินค้า"
            >
              <i className="fas fa-boxes" style={iconStyle} />
              {!isSidebarCollapsed && <span className="ms-2">สินค้า</span>}
            </div>

          </div>
        </div>


        <div style={{
          ...mainContentStyle,
          marginLeft: isSidebarCollapsed ? '10px' : '0px',
          transition: 'margin-left 0.3s ease'
        }}>

          <div className="card-body mb-4">
            <div className="row g-4">              <div className="col-12 col-md-4">
                <div className="card text-center" style={summaryCardStyle}>
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">ยอดขายทั้งหมด </h5>
                  </div>
                  <div className="card-body">
                    <h3 className="mb-0">{formatNumber(totalSales)} บาท</h3>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card text-center" style={summaryCardStyle}>
                  <div className="card-header bg-warning text-white">
                    <h5 className="mb-0">ต้นทุน</h5>
                  </div>
                  <div className="card-body">
                    <h3 className="mb-0">{formatNumber(totalCost)} บาท</h3>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card text-center" style={summaryCardStyle}>
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">กำไรสุทธิ</h5>
                  </div>
                  <div className="card-body">
                    <h3 className="mb-0">{formatNumber(totalProfit)} บาท</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Rendering based on activeSection */}
          {activeSection === 'sales' && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-auto">
                    <select
                      className="form-select"
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value)}
                    >
                      <option value="daily">รายวัน</option>

                      <option value="monthly">รายเดือน</option>
                    </select>
                  </div>
                  {viewType !== "monthly" && (
                    <div className="col-12 col-md-auto">                      <select
                        className="form-select"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>
                            {getThaiMonthName(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}                  <div className="col-12 col-md-auto">
                    <select
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      {arrYear.map(y => (
                        <option key={y} value={y}>
                          ปี {y}
                        </option>
                      ))}
                    </select>                  </div>
                </div>
              </div>              <div className="card-body">
                <div style={chartContainerStyle}>
                  {myData.datasets && myData.datasets.length > 0 ? (
                    <>
                      <Line options={options} data={myData} />
                      <div className="text-center mt-3 text-muted small">
                        <i className="fas fa-info-circle me-1"></i>
                        กดที่จุดในกราฟเพื่อดูรายละเอียดเพิ่มเติม
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="fas fa-chart-line fa-3x text-muted"></i>
                      </div>
                      <h5 className="text-muted">ไม่พบข้อมูลสำหรับช่วงเวลาที่เลือก</h5>
                      <p className="text-muted">กรุณาเลือกช่วงเวลาอื่น หรือตรวจสอบว่ามีข้อมูลการขายในช่วงเวลาดังกล่าว</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'timeline' && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <div className="row align-items-center">
                  <div className="col">
                    <h5 className="mb-0">รายละเอียดสินค้า</h5>
                  </div>
                  <div className="col-auto">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showSoldCheck"
                        checked={showSold}
                        onChange={(e) => setShowSold(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="showSoldCheck">
                        ขายได้
                      </label>
                    </div>

                  </div>
                  <div className="col-auto">
                    <select
                      className="form-select"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="today">วันนี้</option>
                      <option value="yesterday">เมื่อวาน</option>
                      <option value="last7days">7 วันล่าสุด</option>
                      <option value="last30days">เดือนนี้</option>
                      <option value="lastMonth">เดือนที่แล้ว</option>
                      <option value="custom">กำหนดช่วงเวลา</option>
                    </select>
                  </div>
                  {dateRange === "custom" && (
                    <div className="col-auto">
                      <DatePicker
                        selectsRange={true}
                        startDate={dateRangeValue[0]}
                        endDate={dateRangeValue[1]}
                        onChange={(update) => setDateRangeValue(update)}
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        isClearable={true}
                        placeholderText="เลือกช่วงวันที่"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div style={tableWrapperStyle}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>บาร์โค้ด</th>
                        <th>ชื่อสินค้า</th>
                        {showSold && <th>จำนวนขาย</th>}
                        <th>รวมเป็นเงิน</th>
                        <th>กำไรสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedStockData.length > 0 ? (
                        combinedStockData.map((item, index) => {
                          // คำนวณกำไรอีกครั้งตอนแสดงผลเพื่อความแน่ใจ
                          const expectedProfit = (item.price - item.cost) * item.soldQty;
                          const displayProfit = Math.abs(expectedProfit - item.netProfit) > 100
                            ? expectedProfit
                            : item.netProfit;

                          return (
                            <tr key={index}>
                              <td>{item.barcode || '-'}</td>
                              <td>{item.name || '-'}</td>
                              {showSold && <td>{formatNumber(item.soldQty) || 0} ชิ้น</td>}
                              {showRemaining && <td>{formatNumber(item.remainingQty) || 0} ชิ้น</td>}
                              <td>฿{formatNumber(item.totalAmount) || 0}</td>

                              <td className="text-success">
                                ฿{formatNumber(displayProfit) || 0}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={showSold && showRemaining ? 7 : (showSold || showRemaining ? 6 : 5)} className="text-center py-3">
                            <div className="text-muted">
                              <i className="fas fa-info-circle mr-2"></i> ไม่พบข้อมูลสินค้าในช่วงเวลาที่เลือก
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {renderTopSalesChart()}
              </div>
            </div>
          )}

          {activeSection === 'stock' && renderStockSection()}




        </div>
      </div>
    </Template>
  );
}

export default Dashboard;