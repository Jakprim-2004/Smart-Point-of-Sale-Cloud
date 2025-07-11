import Template from "../components/Template";
import Swal from "sweetalert2";
import config from "../config";
import axios from "axios";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function BillSales() {
  const [billSales, setBillSales] = useState([]);
  const [selectBill, setSelectBill] = useState({});
  const [searchBillNo, setSearchBillNo] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filteredBills, setFilteredBills] = useState([]);
  const [showBillDetailModal, setShowBillDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [billSales, searchBillNo, startDate, endDate]);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/billSale/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setBillSales(res.data.results);
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const filterBills = () => {
    let filtered = [...billSales];

    // กรองตามเลขบิล
    if (searchBillNo) {
      filtered = filtered.filter(bill => 
        bill.id.toString().includes(searchBillNo)
      );
    }

    // กรองตามช่วงวันที่
    if (startDate && endDate) {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.createdAt);
        return billDate >= startDate && billDate <= endDate;
      });
    }

    setFilteredBills(filtered);
  };

  return (
    <>
      <Template>
        <div className="container-fluid p-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white py-3">
              <h5 className="card-title mb-0">
                <i className="fas fa-file-invoice me-2"></i>
                รายงานบิลขาย
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-search text-primary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      value={searchBillNo}
                      onChange={(e) => setSearchBillNo(e.target.value)}
                      placeholder="ค้นหาเลขบิล..."
                    />
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="far fa-calendar-alt text-primary"></i>
                    </span>
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      className="form-control border-start-0"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="เลือกช่วงวันที่"
                      isClearable={true}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover border">
                  <thead className="bg-light">
                    <tr>
                      
                      <th width="100px" className="border-0">เลขบิล</th>
                      <th className="border-0">วันที่</th>
                      <th width="200px" className="border-0">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.length > 0 ? (
                      filteredBills.map((item, index) =>
                        item ? (
                          <tr key={index}>
                           
                            <td className="fw-bold text-primary">{item.id}</td>
                            <td>
                              {new Date(item.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="#">
                              <button
                                onClick={() => {
                                  setSelectBill(item);
                                  setShowBillDetailModal(true);
                                }}
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="fa fa-file-alt me-2"></i>
                                รายการบิลขาย
                              </button>
                            </td>
                          </tr>
                        ) : null
                      )
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">
                          <i className="fas fa-inbox fa-2x mb-3 d-block"></i>
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Template>

      <Modal 
        show={showBillDetailModal}
        onHide={() => setShowBillDetailModal(false)}
        title={`รายละเอียดบิล #${selectBill?.id}`}
        modalSize="modal-lg"
      >
        <div className="modal-header border-0 pb-0">
          <h5 className="modal-title">
            <i className="fas fa-receipt text-primary me-2"></i>
            รายละเอียดบิล #{selectBill?.id}
          </h5>
        </div>
        <div className="modal-body">
          {/* Bill Summary */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-light border-0">
                <div className="card-body p-3">
                  <h6 className="text-muted mb-2">วันที่ออกบิล</h6>
                  <p className="mb-0">
                    {selectBill?.createdAt && new Date(selectBill.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light border-0">
                <div className="card-body p-3">
                  <h6 className="text-muted mb-2">ชำระโดย</h6>
                  <p className="mb-0 fw-bold">
                    {(() => {
                      const payment = selectBill?.paymentMethod;
                      
                      
                      if (payment === 'Cash ') {
                        return <span className="text-success">
                          <i className="fas fa-money-bill me-2"></i>Cash (เงินสด)
                        </span>;
                      } else if (payment === 'PromptPay') {
                        return <span className="text-primary">
                          <i className="fas fa-exchange-alt me-2"></i>PromptPay (พร้อมเพย์)
                        </span>;
                      } else {
                        return <span className="text-green">
                           <i className="fas fa-money-bill me-2"></i>Cash (เงินสด)
                         
                        </span>;
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-primary text-white border-0">
                <div className="card-body p-3">
                  <h6 className="mb-2">ยอดรวมทั้งสิ้น (รวม VAT)</h6>
                  <h4 className="mb-0">
                    ฿{selectBill?.totalAmount?.toLocaleString('th-TH')}
                  </h4>
                </div>
              </div>
            </div>
            {/* เพิ่มส่วนแสดง description */}
            {selectBill?.description && (
              <div className="col-12 mt-3">
                <div className="card bg-light border-0">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2">ใช้แต้มแลกส่วนลด</h6>
                    <p className="mb-0">
                      {selectBill.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill Details Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3" style={{width: '50px'}}>#</th>
                  <th>รายการสินค้า</th>
                  <th className="text-end" style={{width: '180px'}}>ราคา/หน่วย</th>
                  <th className="text-end" style={{width: '100px'}}>จำนวน</th>
                  
                </tr>
              </thead>
              <tbody>
                {selectBill?.billSaleDetails?.length > 0 ? (
                  selectBill.billSaleDetails.map((item, index) =>
                    item?.product ? (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="ms-2">
                              <h6 className="mb-0">{item.product.name}</h6>
                              <small className="text-muted">บาร์โค้ด: {item.product.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-end">
                          <div>฿{parseInt(item.price).toLocaleString("th-TH")}</div>
                          <small className="text-muted">VAT: ฿{(item.price * 0.07).toLocaleString("th-TH")}</small>
                        </td>
                        <td className="text-end">{item.qty} ชิ้น</td>
                      </tr>
                    ) : null
                  )
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted">
                        <i className="fas fa-box-open fa-3x mb-3"></i>
                        <p className="mb-0">ไม่พบข้อมูลรายการ</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
             
            </table>
          </div>

          
          
        </div>
      </Modal>
    </>
  );
}

export default BillSales;
