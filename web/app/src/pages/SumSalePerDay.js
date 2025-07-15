import { useEffect, useState } from "react";
import Template from "../components/Template";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import Modal from "../components/Modal";

function SumSalePerDay() {
    const [currentYear, setCurrentYear] = useState(() => {
        let myDate = new Date();
        return myDate.getFullYear();
    });

    const [arrYear] = useState(() => {
        let arr = [];
        let myDate = new Date();
        let currentYear = myDate.getFullYear();
        let beforeYear = currentYear - 5;

        for (let i = beforeYear; i <= currentYear; i++) {
            arr.push(i);
        }

        return arr;
    });

    const [currentMonth, setCurrentMonth] = useState(() => {
        let myDate = new Date();
        return myDate.getMonth() + 1;
    });
    const [arrMonth] = useState(() => {
        return [
            { value: 1, label: 'มกราคม' },
            { value: 2, label: 'กุมภาพันธ์' },
            { value: 3, label: 'มีนาคม' },
            { value: 4, label: 'เมษายน' },
            { value: 5, label: 'พฤษภาคม' },
            { value: 6, label: 'มิถุนายน' },
            { value: 7, label: 'กรกฏาคม' },
            { value: 8, label: 'สิงหาคม' },
            { value: 9, label: 'กันยายน' },
            { value: 10, label: 'ตุลาคม' },
            { value: 11, label: 'พฤศจิกายน' },
            { value: 12, label: 'ธันวาคม' }
        ];
    });
    const [billSales, setBillSales] = useState([]);
    const [currentBillSale, setCurrentBillSale] = useState({});
    const [billSaleDetails, setBillSaleDetails] = useState([]);
    const [showBillSaleModal, setShowBillSaleModal] = useState(false);
    const [showBillDetailModal, setShowBillDetailModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        handleShowReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentYear, currentMonth]);

    const handleShowReport = async () => {
        try {
            setIsLoading(true);
            const path = config.api_path + '/billSale/listByYearAndMonth/' + currentYear + '/' + currentMonth;
            await axios.get(path, config.headers()).then(res => {
                if (res.data.message === 'success') {
                    setBillSales(res.data.results);
                }
            }).catch(err => {
                throw err.response.data;
            })
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Template>
                <div className="card shadow-lg border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
                    <div className="card-header bg-gradient-primary text-white" style={{ background: "linear-gradient(to right, #4e73df, #224abe)" }}>
                        <div className="card-title d-flex align-items-center py-2">
                            <i className="fa fa-chart-bar me-2 fa-lg"></i>
                            <h5 className="mb-0">รายงานสรุปยอดขายรายวัน</h5>
                        </div>
                    </div>
                    <div className="card-body bg-light" style={{ padding: "25px" }}>
                        <div className="row mb-4 g-3">
                            <div className="col-12 col-md-6">
                                <div className="form-floating">
                                    <select 
                                        onChange={e => setCurrentYear(e.target.value)}
                                        value={currentYear}
                                        className={`form-select shadow-sm ${isLoading ? 'bg-light text-muted' : ''}`}
                                        id="yearSelect"
                                        disabled={isLoading}
                                    >
                                        {arrYear.map(item =>
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        )}
                                    </select>
                                    <label htmlFor="yearSelect" className={isLoading ? 'text-muted' : ''}>ปี</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="form-floating">
                                    <select 
                                        onChange={e => setCurrentMonth(e.target.value)}
                                        value={currentMonth}
                                        className={`form-select shadow-sm ${isLoading ? 'bg-light text-muted' : ''}`}
                                        id="monthSelect"
                                        disabled={isLoading}
                                    >
                                        {arrMonth.map(item =>
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        )}
                                    </select>
                                    <label htmlFor="monthSelect" className={isLoading ? 'text-muted' : ''}>เดือน</label>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            {isLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">กำลังโหลด...</span>
                                    </div>
                                    <p className="mt-2 text-primary">กำลังโหลดข้อมูล...</p>
                                </div>
                            ) : (
                                <table className="table table-hover shadow-sm bg-white" style={{ borderRadius: "10px", overflow: "hidden" }}>
                                    <thead className="bg-gradient-primary text-white" style={{ background: "linear-gradient(to right, #4e73df, #224abe)" }}>
                                        <tr>
                                            <th width="100px" className="text-end py-3">วันที่</th>
                                            <th className="text-end py-3">ยอดขาย</th>
                                            <th width="180px" className="text-center py-3">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billSales.length > 0 ? (
                                            billSales.map((item, index) =>
                                                <tr key={index} className="align-middle">
                                                    <td className="text-end py-3">
                                                        <span className="fw-medium">
                                                            {new Date(item.date).toLocaleDateString('th-TH', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="text-end py-3">
                                                        <span className="fw-bold text-primary fs-5">
                                                            {item.sum.toLocaleString('th-TH')} บาท
                                                        </span>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <button
                                                            onClick={() => {
                                                                setCurrentBillSale(item.results);
                                                                setShowBillSaleModal(true);
                                                            }}
                                                            className={`btn ${item.results.length === 0 ? 'btn-secondary' : 'btn-outline-primary'}`}
                                                            style={{ 
                                                                borderRadius: "8px",
                                                                transition: "all 0.2s",
                                                                opacity: item.results.length === 0 ? 0.65 : 1
                                                            }}
                                                            disabled={item.results.length === 0}
                                                        >
                                                            <i className="fa fa-file-alt me-2"></i>
                                                            แสดงรายการ
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted">
                                                    <i className="fa fa-info-circle me-2 fa-lg"></i>
                                                    ไม่พบข้อมูลการขายในช่วงเวลาที่เลือก
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </Template>

            <Modal 
                show={showBillSaleModal}
                onHide={() => setShowBillSaleModal(false)}
                title={<><i className="fa fa-receipt me-2"></i>บิลขาย</>}
            >
                <div className="table-responsive">
                    <table className="table table-hover bg-white">
                        <thead className="bg-gradient-info text-white" style={{ background: "linear-gradient(to right, #36b9cc, #1a8a9e)" }}>
                            <tr>
                                <th className="text-end">เลขบิล</th>
                                <th>วันที่</th>
                                <th width="180px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBillSale.length > 0 ? currentBillSale.map(item =>
                                <tr key={item.id}>
                                    <td className="text-end fw-bold">{item.id}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => {
                                                setBillSaleDetails(item.billSaleDetails);
                                                setShowBillDetailModal(true);
                                            }}
                                            className={`btn btn-sm ${item.billSaleDetails && item.billSaleDetails.length > 0 ? 'btn-info text-white' : 'btn-secondary'}`}
                                            disabled={!item.billSaleDetails || item.billSaleDetails.length === 0}
                                        >
                                            <i className="fa fa-file-alt me-2"></i>
                                            แสดงรายการ
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-3 text-muted">
                                        ไม่พบรายการ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>

            <Modal 
                show={showBillDetailModal}
                onHide={() => setShowBillDetailModal(false)}
                title={<><i className="fa fa-list-alt me-2"></i>รายละเอียดบิลขาย</>}
                modalSize="modal-lg"
            >
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="bg-gradient-success text-white" style={{ background: "linear-gradient(to right, #1cc88a, #169a6f)" }}>
                            <tr>
                                <th>รายการ</th>
                                <th className="text-end">ราคา</th>
                                <th className="text-end">จำนวน</th>
                                <th className="text-end">ยอดรวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billSaleDetails.length > 0 ? billSaleDetails.map(item =>
                                <tr key={item.id}>
                                    <td className="fw-medium">{item.product.name}</td>
                                    <td className="text-end">{parseInt(item.price).toLocaleString('th-TH')}</td>
                                    <td className="text-end">{item.qty}</td>
                                    <td className="text-end fw-bold text-success">
                                        {(item.price * item.qty).toLocaleString('th-TH')}
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-3 text-muted">
                                        ไม่พบรายการ
                                    </td>
                                </tr>
                            )}
                            {billSaleDetails.length > 0 && (
                                <tr className="bg-light">
                                    <td colSpan="3" className="text-end fw-bold">ยอดรวมทั้งสิ้น</td>
                                    <td className="text-end fw-bold fs-5 text-success">
                                        {billSaleDetails.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString('th-TH')} บาท
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
    )
}

export default SumSalePerDay;