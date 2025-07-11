import React, { useEffect, useState } from "react";
import Template from "../components/Template";
import config from "../config";
import axios from "axios";
import Swal from "sweetalert2";

function PointHistory() {
  const [pointTransactions, setPointTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPointsUsed, setTotalPointsUsed] = useState(0);

  useEffect(() => {
    fetchPointTransactions();
  }, []);

  const fetchPointTransactions = async () => {
    try {
      setLoading(true);
      // ใช้ API endpoint ที่แก้ไขใหม่
      const res = await axios.get(config.api_path + "/point-redemption-history", config.headers());
      if (res.data.message === "success") {
        setPointTransactions(res.data.results);
        setTotalPointsUsed(res.data.totalPointsUsed);
      }
    } catch (error) {
      Swal.fire({
        title: "error",
        text: error.message,
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = pointTransactions.filter(transaction => 
    transaction.Customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.Customer?.phone?.includes(searchQuery)
  );

  return (
    <Template>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">ประวัติการใช้แต้มสะสม</h4>
            <div className="bg-white text-primary p-2 rounded">
              <strong>รวมแต้มที่ใช้ทั้งหมด: {totalPointsUsed} แต้ม</strong>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาด้วยชื่อหรือเบอร์โทรลูกค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>วันที่</th>
                    <th>ชื่อลูกค้า</th>
                    <th>เบอร์โทร</th>
                    <th>ประเภท</th>
                    <th className="text-end">แต้มที่ใช้</th>
                    <th>รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{new Date(transaction.transactionDate).toLocaleString('th-TH')}</td>
                      <td>{transaction.Customer?.name || '-'}</td>
                      <td>{transaction.Customer?.phone || '-'}</td>
                      <td>
                        {transaction.transactionType === 'REDEEM_REWARD' ? 
                          'แลกของรางวัล' : 
                          transaction.transactionType === 'DISCOUNT' ? 
                          'ส่วนลด' : 
                          transaction.transactionType}
                      </td>
                      <td className="text-end">
                        <span className="text-danger">
                          -{transaction.points}
                        </span>
                      </td>
                      <td>{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-history fa-3x text-muted mb-3"></i>
              <p className="text-muted">ไม่พบประวัติการใช้แต้ม</p>
            </div>
          )}
        </div>
      </div>
    </Template>
  );
}

export default PointHistory;