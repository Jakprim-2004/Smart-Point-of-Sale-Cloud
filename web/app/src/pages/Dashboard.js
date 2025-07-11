import React, { useEffect, useState } from "react";
import Template from "../components/Template";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import banknotes from '../assets/banknotes.png';
import growth from '../assets/growth.svg';
import product from '../assets/product.png';
import star from '../assets/star.png';
import calendar from '../assets/calendar.svg';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const myDate = new Date();
  const [year] = useState(myDate.getFullYear());
  const [month] = useState(myDate.getMonth() + 1);
  const [viewType] = useState("daily"); 
  const [topSellingViewType, setTopSellingViewType] = useState('products');
  const navigate = useNavigate();

  const [stockData, setStockData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topSellingCategories, setTopSellingCategories] = useState([]);
  const [todaySales, setTodaySales] = useState({
    date: new Date(),
    totalAmount: 0,
    billCount: 0,
    averagePerBill: 0,
    hourlyData: [],
    topProducts: [],
    growthRate: 0,
    yesterdayTotal: 0,
    yesterdayBillCount: 0,
    yesterdayAveragePerBill: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [paymentStats, setPaymentStats] = useState([]);

  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    reportTopSellingProducts();
    reportTopSellingCategories();
    getTodaySalesReport();
    getPaymentStats();
  }, [year, month, viewType]);

 

 

  const reportTopSellingProducts = async () => {
    try {
      const url = config.api_path + "/reportTopSellingProducts";
      const res = await axios.get(url, config.headers());
      console.log("Top selling products API response:", res.data);
      
      if (res.data.message === "success") {
        const filteredResults = res.data.results.slice(0, 5);
        console.log("Filtered top selling products:", filteredResults);
        setTopSellingProducts(filteredResults);
      }
    } catch (e) {
      console.error("Error fetching top selling products:", e);
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
      console.log("Categories API response:", res.data); // Add logging to debug
      
      if (res.data.message === "success") {
        // Don't filter by status as API now does the filtering correctly
        setTopSellingCategories(res.data.results);
      }
    } catch (e) {
      console.error("Error fetching top selling categories:", e);
      // Set a default value in case of error
      setTopSellingCategories([{
        category: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        totalQty: 0,
        totalAmount: 0,
        percentage: 100
      }]);
      
      Swal.fire({
        title: "error", 
        text: e.message,
        icon: "error",
      });
    }
  };

  const getTodaySalesReport = async () => {
    try {
      const url = config.api_path + "/todaySalesReport";
      const res = await axios.get(url, config.headers());

      if (res.data.message === "success") {
        const data = res.data.results;

        setTodaySales({
          date: new Date(data.date),
          totalAmount: data.totalAmount || 0,
          billCount: data.billCount || 0,
          averagePerBill: data.averagePerBill || 0,
          hourlyData: data.hourlyData || [],
          topProducts: data.topProducts || [],
          growthRate: data.growthRate || 0,
          yesterdayTotal: data.yesterdayTotal || 0,
          yesterdayBillCount: data.yesterdayBillCount || 0,
          yesterdayAveragePerBill: data.yesterdayAveragePerBill || 0,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "error",
        text: error.message,
        icon: "error",
      });
    }
  };

  const getPaymentStats = async () => {
    try {
      const url = config.api_path + "/paymentMethodStats";
      const res = await axios.get(url, config.headers());
      if (res.data.message === "success") {
        setPaymentStats(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

 

 

 

 

const renderTopSellingContent = () => {
  if (topSellingViewType === 'products') {
    const totalAmount = topSellingProducts.reduce((sum, item) =>
      sum + parseFloat(item.totalAmount || 0), 0);

    return topSellingProducts.length > 0 ? (
        <div className="top-selling-container p-2">
          <div className="row">
            <div className="col-12">
            {topSellingProducts.map((item, index) => {
                const productName = item.productName || 'สินค้าไม่มีชื่อ';
              const amount = parseFloat(item.totalAmount || 0);
              const actualQty = parseInt(item.totalQty || 0);
                
                let percentage = "0.00";
                if (totalAmount > 0) {
                  percentage = ((amount / totalAmount) * 100).toFixed(2);
                } else if (index === 0 && topSellingProducts.length === 1) {
                  percentage = "100.00";
                }
                
                // Calculate width for progress bar based on percentage
                const barWidth = totalAmount > 0 ? `${Math.max(percentage, 5)}%` : '5%';
              
              return (
                <div
                  key={index}
                    className="mb-3 position-relative product-card"
                    style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Rank badge */}
                    <div 
                  style={{
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        background: ['#FF3860', '#3273DC', '#FFDD57', '#23D160', '#209CEE'][index],
                        borderRadius: '0 0 12px 0',
                        padding: '5px 15px',
                        color: index === 2 ? '#333' : 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      #{index + 1}
                    </div>
                    
                    {/* Product info */}
                    <div className="ps-3 pt-4">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <h5 style={{ fontWeight: 'bold', color: '#333' }}>{productName}</h5>
                          <span className="text-primary fw-bold">฿{amount.toLocaleString('th-TH')}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between text-muted small">
                          <div><i className="fas fa-box me-1"></i> {actualQty} ชิ้น</div>
                          <div>{percentage}%</div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="progress mt-2" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{
                            width: barWidth,
                            background: ['#FF3860', '#3273DC', '#FFDD57', '#23D160', '#209CEE'][index]
                          }} 
                          aria-valuenow={percentage}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : (
      <div className="alert alert-info text-center">
        <i className="fas fa-question-circle fa-2x mb-2"></i>
        <p>ไม่มีข้อมูลสินค้าขายดี</p>
      </div>
    );
  } else {
    const totalAmount = topSellingCategories.reduce((sum, item) =>
      sum + parseFloat(item.totalAmount || 0), 0);

    return topSellingCategories.length > 0 ? (
        <div className="top-selling-container p-2">
          <div className="row">
            <div className="col-12">
              {topSellingCategories.map((item, index) => {
                // Handle missing data with defaults
                const categoryName = item.category || 'ไม่ระบุหมวดหมู่';
                const amount = parseFloat(item.totalAmount || 0);
                const qty = parseInt(item.totalQty || 0);
                
                // Safe percentage calculation
                let percentage = item.percentage || "0.00";
                if (!item.percentage && totalAmount > 0) {
                  percentage = ((amount / totalAmount) * 100).toFixed(2);
                }
                
                // Calculate width for progress bar
                const barWidth = totalAmount > 0 ? `${Math.max(percentage, 5)}%` : '5%';
              
              return (
                <div
                  key={index}
                    className="mb-3 position-relative category-card"
                    style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Rank badge */}
                    <div 
                  style={{
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        background: ['#FF3860', '#3273DC', '#FFDD57', '#23D160', '#209CEE'][index],
                        borderRadius: '0 0 12px 0',
                        padding: '5px 15px',
                        color: index === 2 ? '#333' : 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      #{index + 1}
                    </div>
                    
                    {/* Category info */}
                    <div className="ps-3 pt-4">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <h5 style={{ fontWeight: 'bold', color: '#333' }}>{categoryName}</h5>
                          <span className="text-primary fw-bold">฿{amount.toLocaleString('th-TH')}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between text-muted small">
                          <div><i className="fas fa-box me-1"></i> {qty} ชิ้น</div>
                          <div>{percentage}%</div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="progress mt-2" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{
                            width: barWidth,
                            background: ['#FF3860', '#3273DC', '#FFDD57', '#23D160', '#209CEE'][index]
                          }} 
                          aria-valuenow={percentage}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : (
        <div className="text-center w-100 d-flex flex-column align-items-center justify-content-center" style={{ height: '100%' }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#8a94a6" style={{ marginBottom: 8 }}>
            <rect x="3" y="10" width="3" height="7"/><rect x="9" y="7" width="3" height="10"/><rect x="15" y="4" width="3" height="13"/>
          </svg>
          <div style={{ color: '#8a94a6', fontSize: 15, fontWeight: 500 }}>
        ไม่มีข้อมูลหมวดหมู่ขายดี
          </div>
      </div>
    );
  }
};

  const renderPaymentStats = () => {
    const total = paymentStats.reduce((sum, stat) => sum + parseFloat(stat.total || 0), 0);

    const paymentColors = {
      'เงินสด': '#FF6384',
      'โอนเงิน': '#36A2EB',
      'บัตรเครดิต': '#FFCE56',
      'ไม่ระบุ': '#4BC0C0',
    };

    return (
      <div className="p-3">
        <div className="mb-3 text-center">
          <h5 className="text-muted">ยอดรวมทั้งหมด: ฿{total.toLocaleString('th-TH')}</h5>
          </div>
        <div className="payment-methods-list">
          {paymentStats.length > 0 ? (
            paymentStats.map((stat, index) => {
              const amount = parseFloat(stat.total || 0);
              const percentage = ((amount / total) * 100).toFixed(2);
              const color = paymentColors[stat.paymentMethod] || `hsl(${index * 60}, 70%, 60%)`;
              
              return (
                <div
                  key={index}
                  className="payment-method-item mb-3 p-3"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    borderLeft: `5px solid ${color}`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 style={{ fontWeight: 'bold', color: '#333' }}>{stat.paymentMethod}</h5>
                      <div className="text-muted">{stat.count || 0} รายการ</div>
                    </div>
                    <div className="text-end">
                      <h5 style={{ color: '#0d6efd', fontWeight: 'bold' }}>฿{amount.toLocaleString('th-TH')}</h5>
                      <small className="text-muted">{percentage}%</small>
                  </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-5">
              <i className="fas fa-random mb-2" style={{ fontSize: '2.8rem', color: '#bdbdbd' }}></i>
              <div className="text-muted" style={{ fontSize: '1.1rem' }}>ไม่มีข้อมูลวิธีการชำระเงินในวันนี้</div>
          </div>
          )}
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      backgroundColor: "#f8f9fa",
      padding: "25px",
      borderRadius: "15px",
      fontFamily: "'Kanit', sans-serif",
      minHeight: "100vh",
    },
    summaryCard: {
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      height: "100%",
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    modernHeader: {
      backgroundColor: "#abf7",
      color: "white",
      padding: "15px 20px",
      fontSize: "18px",
      fontWeight: "600",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "12px 12px 0 0",
      background: 'linear-gradient(135deg, #0d6ed 0%, #0dcaf0 100%)',
    },
    chartIcon: {
      cursor: 'pointer',
      padding: '5px 10px',
      fontSize: '1.2rem',
      transition: 'all 0.2s'
    },
    activeIcon: {
      color: '#0dcaf0',
      transform: 'scale(1.2)'
    },
    inactiveIcon: {
      color: '#6c757d'
    },
    clickableNumber: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    clickableNumberHover: {
      backgroundColor: '#e9ecef',
      color: '#0dcaf0'
    }
  };

 

  return (
    <Template>
      <div style={styles.container}>
        <div className="row mb-4">
          <div className="col-12">
            <div style={{ ...styles.chartContainer, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
              <div style={styles.modernHeader}>
                <h4 className="text-dark" style={{ margin: 0, fontWeight: '600' }}>
                  ข้อมูลสรุปล่าสุดวันที่ {currentTime.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })} | <span style={{ fontWeight: 'bold' }}>{currentTime.toLocaleTimeString('th-TH')}</span>
                </h4>
              </div>
              <div className="row p-4 g-4">
                <div className="col-md-4">
                  <div style={styles.statCard} className="text-center">
                    <h5 className="mb-0" style={{ color: '#0d6efd', fontWeight: 600 }}><i className="fas fa-coins me-2"></i>ยอดรวม</h5>
                    <h3 className="text-primary mb-0">฿ {todaySales.totalAmount.toLocaleString()}</h3>
                    <div className="text-muted mt-2" style={{ fontSize: '0.95em' }}>เมื่อวาน: ฿ {todaySales.yesterdayTotal.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={styles.statCard} className="text-center">
                    <h5 className="mb-0" style={{ color: '#0dcaf0', fontWeight: 600 }}><i className="fas fa-receipt me-2"></i>จำนวนบิล</h5>
                    <h3 className="text-info mb-0">{todaySales.billCount} บิล</h3>
                    <div className="text-muted mt-2" style={{ fontSize: '0.95em' }}>เมื่อวาน: {todaySales.yesterdayBillCount} บิล</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={styles.statCard} className="text-center">
                    <h5 className="mb-0" style={{ color: '#198754', fontWeight: 600 }}><i className="fas fa-divide me-2"></i>เฉลี่ย/บิล</h5>
                    <h3 className="text-success mb-0">฿ {todaySales.averagePerBill.toLocaleString()}</h3>
                    <div className="text-muted mt-2" style={{ fontSize: '0.95em' }}>เมื่อวาน: ฿ {todaySales.yesterdayAveragePerBill.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100" style={{...styles.summaryCard, overflow: 'hidden'}}>
              <div className="card-header d-flex align-items-center" 
                  style={{ 
                    backgroundColor: 'white',
                    paddingTop: '15px', 
                    paddingBottom: '15px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                  }}>
                <i className="fa fa-trophy me-2 text-warning"></i>
                <div style={{ position: 'relative', marginRight: 8 }}>
                    <select
                      value={topSellingViewType}
                    onChange={e => setTopSellingViewType(e.target.value)}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      border: 'none',
                      background: 'none',
                      fontWeight: 600,
                      color: '#333',
                      fontSize: 16,
                      padding: '2px 22px 2px 0',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="products">สินค้า</option>
                    <option value="categories">หมวดหมู่</option>
                  </select>
                  <span style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#8a94a6',
                    fontSize: 12
                  }}>▼</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#333' }}>ขายดี 5 อันดับ</span>
              </div>
              <div className="card-body" style={{ padding: 0, overflowY: 'auto', maxHeight: '500px' }}>
                {(topSellingViewType === 'products' ? topSellingProducts.length === 0 : topSellingCategories.length === 0) ? (
                  <div className="text-center w-100 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px' }}>
                    <i className="fas fa-chart-bar fa-3x mb-3 text-muted"></i>
                    <div style={{ color: '#8a94a6', fontSize: 15, fontWeight: 500 }}>
                      ไม่มีข้อมูล{topSellingViewType === 'products' ? 'สินค้าขายดี' : 'หมวดหมู่ขายดี'}
                        </div>
                  </div>
                ) : (
                  renderTopSellingContent()
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100" style={styles.summaryCard}>
              <div className="card-header d-flex align-items-center" style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <i className="fas fa-money-bill-wave me-2" style={{ color: '#0d6efd' }}></i>
                <span className="fw-bold" style={{ fontSize: '1.1rem' }}>วิธีการชำระเงิน</span>
              </div>
              <div className="card-body" style={{ overflowY: 'auto' }}>
                {renderPaymentStats()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default Dashboard;