import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Add this import
import Template from "../components/Template";
import Swal from "sweetalert2";
import config from "../config";
import axios from "axios";
import Modal from "../components/Modal";

function Category() {
  const navigate = useNavigate();  // Add this line
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(config.api_path + "/category/list", config.headers());
      if (res.data.message === "success") {
        setCategories(res.data.results);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error"
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = category.id 
        ? `${config.api_path}/category/update/${category.id}`
        : `${config.api_path}/category/insert`;
      
      const res = await axios.post(url, category, config.headers());
      if (res.data.message === "success") {
        Swal.fire({
          title: "บันทึกข้อมูล",
          text: "บันทึกข้อมูลหมวดหมู่สำเร็จ",
          icon: "success",
          timer: 2000
        });
        fetchCategories();
        setShowModal(false);
        setCategory({});
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error"
      });
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "ลบข้อมูล",
      text: "ยืนยันการลบหมวดหมู่นี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${config.api_path}/category/delete/${item.id}`, 
            config.headers()
          );
          if (res.data.message === "success") {
            Swal.fire({
              title: "ลบข้อมูล",
              text: "ลบข้อมูลหมวดหมู่สำเร็จ",
              icon: "success",
              timer: 2000
            });
            fetchCategories();
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error"
          });
        }
      }
    });
  };

  const handleBack = () => {
    navigate('/product');
  };

  return (
    <Template>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">จัดการหมวดหมู่สินค้า</h4>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
            <button
              className="btn btn-primary d-flex align-items-center shadow-sm"
              style={{ borderRadius: 20, fontWeight: 500, padding: '8px 20px' }}
              onClick={() => {
                setCategory({});
                setShowModal(true);
              }}
            >
              <i className="fa fa-plus mr-2"></i> เพิ่มหมวดหมู่
            </button>
            <button
              onClick={handleBack}
              className="btn btn-outline-primary d-flex align-items-center shadow-sm"
              style={{ borderRadius: 20, fontWeight: 500, padding: '8px 20px' }}
              title="กลับไปหน้าสินค้า"
            >
              <i className="fa fa-shopping-cart mr-2"></i> กลับไปหน้าสินค้า
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-bordered shadow-sm bg-white" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <thead className="thead-light">
                <tr style={{ background: "#f1f3f6" }}>
                  <th className="py-3">ชื่อหมวดหมู่</th>
                  <th className="py-3" width="150">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm mr-2"
                          style={{ borderRadius: 8, fontWeight: 500 }}
                          onClick={() => {
                            setCategory(item);
                            setShowModal(true);
                          }}
                          title="แก้ไข"
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ borderRadius: 8, fontWeight: 500 }}
                          onClick={() => handleDelete(item)}
                          title="ลบ"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center text-muted py-4">
                      <i className="fa fa-box-open mb-2 fa-2x"></i>
                      <p>ไม่มีหมวดหมู่</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .table th, .table td {
          vertical-align: middle !important;
        }
        .table th {
          color: #495057;
          font-weight: 600;
          background: #f1f3f6 !important;
        }
        .btn {
          font-size: 15px;
        }
      `}</style>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={category.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>ชื่อหมวดหมู่</label>
            <input
              type="text"
              className="form-control"
              value={category.name || ""}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fa fa-save mr-2"></i>บันทึก
          </button>
        </form>
      </Modal>
    </Template>
  );
}

export default Category;
