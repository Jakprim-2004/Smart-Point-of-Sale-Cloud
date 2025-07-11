import React, { useEffect, useState } from "react";
import Template from "../components/Template";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";


function Customer() {
    const [customers, setCustomers] = useState([]);
    const [editCustomer, setEditCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await axios.get(
                config.api_path + "/customers", 
                config.headers()
            ); // เพิ่ม config.headers()
            if (response.data.result) {
                setCustomers(response.data.result);
            }
        } catch (error) {
            console.error("Error loading customers:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error || "Failed to load customers",
                icon: "error"
            });
        }
    };

    const handleEdit = (customer) => {
        setEditCustomer(customer);
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                config.api_path + "/customer/" + editCustomer.id, 
                editCustomer,
                config.headers()  
            );
            
            if (response.data.message === 'success') {
                setEditCustomer(null);
                loadCustomers();
                Swal.fire("สำเร็จ", "อัปเดตข้อมูลลูกค้าเรียบร้อย", "success");
            }
        } catch (error) {
            console.error("Error updating customer:", error);
            if (error.response?.data?.error === "กรุณาเข้าสู่ระบบใหม่") {
                Swal.fire({
                    title: "เซสชันหมดอายุ",
                    text: "กรุณาเข้าสู่ระบบใหม่",
                    icon: "warning",
                    confirmButtonText: "เข้าสู่ระบบ"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirect to login page or handle re-authentication
                        window.location.href = "/login";
                    }
                });
            } else {
                Swal.fire("Error", error.response?.data?.error || "ไม่สามารถอัปเดตข้อมูลลูกค้าได้", "error");
            }
        }
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        
        // Validate phone number
        if (!/^\d{10}$/.test(newCustomer.phone)) {
            Swal.fire('Error', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)', 'error');
            return;
        }

        try {
            const response = await axios.post(
                `${config.api_path}/customer`,
                newCustomer,
                config.headers()
            );

            if (response.data.message === 'success') {
                await loadCustomers();
                Swal.fire('สำเร็จ', 'เพิ่มข้อมูลลูกค้าเรียบร้อย', 'success');
                setNewCustomer({ name: '', phone: '', email: '', address: '' });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.error === "กรุณาเข้าสู่ระบบใหม่") {
                Swal.fire('Error', 'กรุณาเข้าสู่ระบบใหม่', 'error');
            } else {
                Swal.fire('Error', error.response?.data?.error || 'ไม่สามารถเพิ่มข้อมูลลูกค้าได้', 'error');
            }
        }
    };

    return (
        <Template>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>จัดการข้อมูลลูกค้า</h2>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'ปิดฟอร์ม' : 'เพิ่มลูกค้าใหม่'}
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title">เพิ่มลูกค้าใหม่</h4>
                            <form onSubmit={handleCreateCustomer}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">ชื่อลูกค้า *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCustomer.name}
                                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">เบอร์โทรศัพท์ *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                            pattern="[0-9]{10}"
                                            title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">อีเมล *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    
                                </div>
                                <button type="submit" className="btn btn-success">บันทึกข้อมูล</button>
                            </form>
                        </div>
                    </div>
                )}

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Points</th>
                            <th>Membership</th>
                            <th>Total Spent</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>
                                    {editCustomer?.id === customer.id ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editCustomer.name}
                                            onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
                                        />
                                    ) : customer.name}
                                </td>
                                <td>
                                    {editCustomer?.id === customer.id ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editCustomer.phone}
                                            onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                                        />
                                    ) : customer.phone}
                                </td>
                                <td>
                                    {editCustomer?.id === customer.id ? (
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editCustomer.email}
                                            onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                                        />
                                    ) : customer.email}
                                </td>
                                <td>{customer.points}</td>
                                <td>{customer.membershipTier}</td>
                                <td>{customer.totalSpent}</td>
                                <td>
                                    {editCustomer?.id === customer.id ? (
                                        <button className="btn btn-success me-2" onClick={handleSave}>
                                            Save
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary me-2" onClick={() => handleEdit(customer)}>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Template>
    );
}

export default Customer;