import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import config from "../config";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';
import Lottie from 'lottie-react';
import animationData from '../assets/Logo-new.json';
import welcomeIcon from '../assets/welcome.svg';

function Login() {
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loginType, setLoginType] = useState('member');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            let payload;
            let endpoint;
            
            if (loginType === 'member') {
                payload = { 
                    phone: phone || '', 
                    password: pass 
                };
                endpoint = '/member/signin';
            } else {
                payload = {
                    usr: username,
                    pwd: pass
                };
                endpoint = '/user/signin';
            }

            if (loginType === 'member' && !phone) {
                Swal.fire({
                    title: 'Sign In',
                    text: 'กรุณากรอกเบอร์โทรศัพท์',
                    icon: 'warning',
                    timer: 2000
                });
                return;
            }

            const res = await axios.post(config.api_path + endpoint, payload);
            
            if (res.data.message === 'success') {
                Swal.fire({
                    title: 'Sign In',
                    text: 'เข้าสู่ระบบแล้ว',
                    imageUrl: welcomeIcon,
                    imageWidth: 200,
                    imageHeight: 200,
                    timer: 2000
                });

                localStorage.setItem(config.token_name, res.data.token);
                localStorage.setItem('userType', loginType);
                
                // Store user level and redirect based on role
                if (loginType === 'employee') {
                    localStorage.setItem('userLevel', res.data.userInfo.level);
                    navigate('/sale'); // Redirect employees to sale page
                } else {
                    localStorage.setItem('userLevel', 'owner');
                    navigate('/dashboard'); // Owners go to dashboard
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Sign In',
                text: loginType === 'member' ? 
                    'เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง' : 
                    'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                icon: 'error',
                timer: 2000
            });
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center vh-100">
            <div className="card login-card shadow-lg p-4">
                <div className="row">
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                        <h3 className="login-title">Smart POS</h3>
                        <p className="login-subtitle">Online inventory management system</p>
                        <div className="w-32 h-32 mx-auto mb-4">
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                autoplay={true}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 login-form-container">
                        <h3 className="text-center mb-4">เข้าสู่ระบบ</h3>
                        
                        <nav className="nav nav-pills nav-justified mb-4">
                           
                           
                        </nav>

                        <div className="login-form p-3">
                            <div className="form-group mb-4">
                                <label className="form-label">
                                    {loginType === 'member' ? 'เบอร์โทรศัพท์' : 'ชื่อผู้ใช้'}
                                </label>
                                {loginType === 'member' ? (
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fas fa-user"></i>
                                        </span>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder={loginType === 'member' ? "กรอกเบอร์โทรศัพท์" : "กรอกชื่อผู้ใช้"}
                                            value={loginType === 'member' ? (phone || email) : username}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (loginType === 'member') {
                                                    if (value.includes('@')) {
                                                        setEmail(value);
                                                        setPhone('');
                                                    } else {
                                                        setPhone(value);
                                                        setEmail('');
                                                    }
                                                } else {
                                                    setUsername(value);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fas fa-user"></i>
                                        </span>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="กรอกชื่อผู้ใช้"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label">รหัสผ่าน</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-lock"></i>
                                    </span>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        placeholder="กรอกรหัสผ่าน"
                                        value={pass}
                                        onChange={(e) => setPass(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSignIn} 
                                className="btn btn-primary w-100 py-2 mb-3">
                                <i className="fas fa-sign-in-alt me-2"></i>
                                เข้าสู่ระบบ
                            </button>

                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
