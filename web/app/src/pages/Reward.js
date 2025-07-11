import React, { useEffect, useState } from "react";
import Template from "../components/Template";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "../components/Modal";


function Reward() {
    const [rewards, setRewards] = useState([]);
    const [customerPoints, setCustomerPoints] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Add new state for reward form
    const [newReward, setNewReward] = useState({
        name: '',
        description: '',
        pointsCost: '',
        stock: ''
    });

    const [editingReward, setEditingReward] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        loadRewards();
        loadCustomers();
    }, []);


    // ฟังก์ชันตรวจสอบสถานะการแลก
    const getRedeemButtonStatus = (reward) => {
        if (!selectedCustomer) {
            return {
                disabled: true,
                className: "btn btn-secondary", // สีเทา
                text: "กรุณาเลือกลูกค้า"
            };
        }
        if (reward.stock <= 0) {
            return {
                disabled: true,
                className: "btn btn-secondary",
                text: "สินค้าหมด"
            };
        }
        if (selectedCustomer.points < reward.pointsCost) {
            return {
                disabled: true,
                className: "btn btn-secondary",
                text: "แต้มไม่พอ"
            };
        }
        return {
            disabled: false,
            className: "btn btn-primary", // สีฟ้า
            text: "แลกของรางวัล"
        };
    };

    const loadRewards = async () => {
        try {
            const response = await axios.get(config.api_path + "/rewards", config.headers());
            setRewards(response.data.results);
        } catch (error) {
            console.error("Error loading rewards:", error);
            Swal.fire("Error", "ไม่สามารถโหลดข้อมูลของรางวัลได้", "error");
        }
    };

    const loadCustomers = async () => {
        try {
            const response = await axios.get(config.api_path + "/customers", config.headers());
            setCustomers(response.data.result);
        } catch (error) {
            console.error("Error loading customers:", error);
        }
    };

    const handleRedeem = async (reward) => {
        if (!selectedCustomer) {
            Swal.fire("กรุณาเลือกลูกค้า", "โปรดเลือกลูกค้าก่อนแลกของรางวัล", "warning");
            return;
        }

        if (selectedCustomer.points < reward.pointsCost) {
            Swal.fire("แต้มไม่พอ", "ลูกค้ามีแต้มไม่เพียงพอสำหรับแลกของรางวัลนี้", "warning");
            return;
        }

        try {
            setLoading(true);

            // สร้างข้อความอธิบายการแลกของรางวัลที่ละเอียดขึ้น
            const detailedDescription = [
                `แลกของรางวัล: ${reward.name}`,
                reward.description ? ` ${reward.description}` : '',

            ].filter(Boolean).join(' | '); // กรองข้อความว่างออก

            const response = await axios.post(
                config.api_path + "/rewards/redeem",
                {
                    customerId: selectedCustomer.id,
                    rewardId: reward.id,
                    pointTransaction: {
                        customerId: selectedCustomer.id,
                        points: reward.pointsCost,
                        transactionType: 'REDEEM_REWARD',
                        description: detailedDescription
                    }
                },
                config.headers()
            );

            if (response.data.message === "success") {
                // อัพเดทข้อมูลของรางวัลในหน้าจอทันที
                setRewards(response.data.result.updatedRewards);

                // อัพเดทข้อมูลลูกค้าที่เลือกไว้
                setSelectedCustomer(response.data.result.customer);

                // อัพเดทข้อมูลในรายการลูกค้าทั้งหมด
                setCustomers(prevCustomers =>
                    prevCustomers.map(customer =>
                        customer.id === response.data.result.customer.id
                            ? response.data.result.customer
                            : customer
                    )
                );

                // ปรับปรุงรายการลูกค้าที่กรองไว้
                setFilteredCustomers(prevFiltered =>
                    prevFiltered.map(customer =>
                        customer.id === response.data.result.customer.id
                            ? response.data.result.customer
                            : customer
                    )
                );

                Swal.fire({
                    title: "สำเร็จ",
                    text: "แลกของรางวัลเรียบร้อยแล้ว",
                    icon: "success",
                    timer: 1500
                });
            }
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "ไม่สามารถแลกของรางวัลได้", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCustomer = (query) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredCustomers([]);
            return;
        }

        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );
        setFilteredCustomers(filtered);
    };



    // Add new handler for reward creation
    const handleCreateReward = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${config.api_path}/rewards`,
                newReward,
                config.headers()
            );

            if (response.data.message === 'success') {
                await loadRewards();
                Swal.fire('สำเร็จ', 'เพิ่มของรางวัลเรียบร้อยแล้ว', 'success');
                setUploadModalOpen(false);
                setNewReward({ name: '', description: '', pointsCost: '', stock: '' });
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.error === "กรุณาเข้าสู่ระบบใหม่") {
                Swal.fire('Error', 'กรุณาเข้าสู่ระบบใหม่', 'error');

            } else {
                Swal.fire('Error', 'ไม่สามารถเพิ่มของรางวัลได้', 'error');
            }
        }
    };

    const handleEditClick = (reward) => {
        setEditingReward({ ...reward });
        setShowEditModal(true);
    };

    const handleUpdateReward = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${config.api_path}/rewards/${editingReward.id}`,
                editingReward,
                config.headers()
            );

            if (response.data.message === 'success') {
                await loadRewards();
                Swal.fire('สำเร็จ', 'แก้ไขของรางวัลเรียบร้อยแล้ว', 'success');
                setShowEditModal(false);
                setEditingReward(null);
            }
        } catch (error) {
            Swal.fire('Error', 'ไม่สามารถแก้ไขของรางวัลได้', 'error');
        }
    };

    const handleDeleteReward = (reward) => {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: `ต้องการลบของรางวัล ${reward.name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(
                        `${config.api_path}/rewards/${reward.id}`,
                        config.headers()
                    );
                    await loadRewards();
                    Swal.fire('สำเร็จ', 'ลบของรางวัลเรียบร้อยแล้ว', 'success');
                } catch (error) {
                    Swal.fire('Error', 'ไม่สามารถลบของรางวัลได้', 'error');
                }
            }
        });
    };

    return (
        <Template>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>แลกของรางวัล</h2>
                    <div className="d-flex gap-2">
                        <div className="position-relative" style={{ width: '300px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทร..."
                                value={searchQuery}
                                onChange={(e) => handleSearchCustomer(e.target.value)}
                                onFocus={() => setShowCustomerSearch(true)}
                            />
                            {showCustomerSearch && searchQuery && (
                                <div className="position-absolute w-100 mt-1 shadow bg-white rounded border"
                                    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(customer => (
                                            <div
                                                key={customer.id}
                                                className="p-2 border-bottom hover-bg-light cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setSearchQuery(`${customer.name} (${customer.phone})`);
                                                    setShowCustomerSearch(false);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="fw-bold">{customer.name}</div>
                                                <div className="small text-muted">
                                                    เบอร์โทร: {customer.phone}
                                                    <br />
                                                    แต้มสะสม: {customer.points} แต้ม
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-center text-muted">
                                            ไม่พบข้อมูลลูกค้า
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setUploadModalOpen(true)}
                        >
                            <i className="fas fa-sitemap me-2"></i>
                            เพิ่มของรางวัล
                        </button>
                    </div>
                </div>

                {selectedCustomer && (
                    <div className="alert alert-info mb-4">
                        <h5>ข้อมูลลูกค้า</h5>
                        <p className="mb-1">ชื่อ: {selectedCustomer.name}</p>
                        <p className="mb-1">แต้มสะสม: {selectedCustomer.points} แต้ม</p>
                        <p className="mb-0">ระดับสมาชิก: {selectedCustomer.membershipTier}</p>
                    </div>
                )}

                <div className="row">
                    {rewards.map(reward => (
                        <div key={reward.id} className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{reward.name}</h5>
                                    <p className="card-text">{reward.description}</p>
                                    <p className="card-text">
                                        <small className="text-muted">
                                            ใช้แต้ม: {reward.pointsCost} แต้ม
                                        </small>
                                    </p>
                                    <p className="card-text">
                                        <small className="text-muted">
                                            คงเหลือ: {reward.stock} ชิ้น
                                        </small>
                                    </p>
                                    <div className="d-flex gap-2">
    {/* แทนที่ปุ่มเดิม */}
    {(() => {
        const buttonStatus = getRedeemButtonStatus(reward);
        return (
            <button 
                className={buttonStatus.className}
                onClick={() => handleRedeem(reward)}
                disabled={buttonStatus.disabled || loading}
                title={buttonStatus.text}
            >
                {buttonStatus.text}
            </button>
        );
    })()}
    <button 
        className="btn btn-warning"
        onClick={() => handleEditClick(reward)}
    >
        <i className="fas fa-edit"></i>
    </button>
    <button 
        className="btn btn-danger"
        onClick={() => handleDeleteReward(reward)}
    >
        <i className="fas fa-trash"></i>
    </button>
</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                show={uploadModalOpen}
                onHide={() => setUploadModalOpen(false)}
                title="เพิ่มของรางวัลใหม่"
            >
                <form onSubmit={handleCreateReward}>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">ชื่อของรางวัล <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={newReward.name}
                                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">รายละเอียด</label>
                            <textarea
                                className="form-control"
                                value={newReward.description}
                                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">แต้มที่ใช้แลก <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                value={newReward.pointsCost}
                                onChange={(e) => setNewReward({ ...newReward, pointsCost: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">จำนวนของรางวัล <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                value={newReward.stock}
                                onChange={(e) => setNewReward({ ...newReward, stock: e.target.value })}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setUploadModalOpen(false)}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            บันทึก
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                title="แก้ไขของรางวัล"
            >
                <form onSubmit={handleUpdateReward}>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">ชื่อของรางวัล</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editingReward?.name || ''}
                                onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">รายละเอียด</label>
                            <textarea
                                className="form-control"
                                value={editingReward?.description || ''}
                                onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">แต้มที่ใช้แลก</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editingReward?.pointsCost || ''}
                                onChange={(e) => setEditingReward({ ...editingReward, pointsCost: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">จำนวนของรางวัล</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editingReward?.stock || ''}
                                onChange={(e) => setEditingReward({ ...editingReward, stock: e.target.value })}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            บันทึก
                        </button>
                    </div>
                </form>
            </Modal>
        </Template>
    );
}

export default Reward;