import { useState } from "react";
import axios from 'axios';
import config from "../config";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import mochiGif from '../assets/mochi-young-woman.gif';

function LoginCustomer() {
    const [loginData, setLoginData] = useState({
        email: "",
        phone: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.phone) {
            Swal.fire({
                title: 'แจ้งเตือน',
                text: 'กรุณากรอกทั้งอีเมลและเบอร์โทรศัพท์',
                icon: 'warning'
            });
            return;
        }

        try {
            const response = await axios.post(config.api_path + '/login/customer', loginData);
            if (response.data.success === false) {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: response.data.message || 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
                    icon: 'error'
                });
                return;
            }

            if (response.data.result) {
                localStorage.setItem('customerData', JSON.stringify(response.data.result));
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'เข้าสู่ระบบสำเร็จ',
                    icon: 'success',
                    timer: 2000,
                }).then(() => {
                    navigate('/DetailCustomer');
                });
            }
        } catch (error) {
            let errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                icon: 'error'
            });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
            padding: '2rem 0'
        }}>
            <div className="container">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-md-8">
                        <div className="card" style={{
                            borderRadius: '20px',
                            border: 'none',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.95)'
                        }}>
                            <div className="card-body p-0">
                                <div className="row g-0">
                                    {/* Image Section - Now on the left */}
                                    <div className="col-md-6 d-none d-md-block" style={{
                                        background: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem'
                                    }}>
                                        <img 
                                            src={mochiGif} 
                                            alt="Mochi woman" 
                                            style={{
                                                maxWidth: '100%',
                                                borderRadius: '15px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                    {/* Form Section - Now on the right */}
                                    <div className="col-md-6 p-5">
                                        <h2 className="text-center mb-4" style={{
                                            color: '#2c3e50',
                                            fontWeight: '600'
                                        }}>เข้าสู่ระบบ</h2>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="form-label" style={{fontWeight: '500'}}>
                                                    อีเมล <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={loginData.email}
                                                    onChange={handleChange}
                                                    required
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '10px',
                                                        border: '2px solid #e2e8f0',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label" style={{fontWeight: '500'}}>
                                                    เบอร์โทรศัพท์ <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phone"
                                                    value={loginData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '10px',
                                                        border: '2px solid #e2e8f0',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                            <div className="text-muted mb-4 small">
                                                * กรุณากรอกข้อมูลให้ครบทุกช่อง
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary w-100"
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: '10px',
                                                    background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
                                                    border: 'none',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(71, 118, 230, 0.2)'
                                                }}
                                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                            >
                                                เข้าสู่ระบบ
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginCustomer;