import { useEffect, useState } from "react";
import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import * as dayjs from 'dayjs';

function Stock() {
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productId, setProductId] = useState(0);
    const [qty, setQty] = useState(0);
    const [stocks, setStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [productStockStatus, setProductStockStatus] = useState({});
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'added', 'notAdded'

    useEffect(() => {
        if (stocks.length > 0 && products.length > 0) {
            const statusMap = {};

            // สร้าง map เก็บสถานะสินค้าที่เพิ่มในสต๊อกแล้ว
            stocks.forEach(stockItem => {
                if (stockItem.product && stockItem.product.id) {
                    statusMap[stockItem.product.id] = true;
                }
            });

            setProductStockStatus(statusMap);
        }
    }, [stocks, products]);

    useEffect(() => {
        fetchDataStock();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(config.api_path + '/product/list', config.headers());
            if (res.data.message === 'success') {
                setProducts(res.data.results);
                setFilteredProducts(res.data.results);
            }
        } catch (e) {
            console.error("Error fetching products:", e);
        }
    };


    const getFilteredProducts = () => {
        let results = [...products];

        // กรองตามสถานะ
        if (statusFilter === 'added') {
            results = results.filter(product => productStockStatus[product.id]);
        } else if (statusFilter === 'notAdded') {
            results = results.filter(product => !productStockStatus[product.id]);
        }

        // กรองตามคำค้นหา
        if (searchQuery) {
            results = results.filter(product =>
                (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.barcode && product.barcode.includes(searchQuery)) ||
                (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return results;
    };

    // ฟังก์ชันการค้นหา
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredProducts([]);
            setProductName('');
            setProductId(0);
            return;
        }

        const filtered = products.filter(product =>
            (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
            (product.barcode && product.barcode.includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query.toLowerCase()))
        );

        setFilteredProducts(filtered);

        // ถ้าพบแค่รายการเดียว ให้เลือกอัตโนมัติ
        if (filtered.length === 1) {
            handleChooseProduct(filtered[0]);
        }
    };

    const fetchDataStock = async () => {
        try {
            await axios.get(config.api_path + '/stock/list', config.headers()).then(res => {
                if (res.data.message === 'success') {
                    setStocks(res.data.results);
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
        }
    }

    const handleChooseProduct = (item) => {
        setProductName(item.name);
        setProductId(item.id);
        setSearchQuery(item.name);
        setFilteredProducts([]);
        setShowModal(false);
    };

    const handleSave = async () => {
        try {
            const payload = {
                qty: qty,
                productId: productId
            }

            await axios.post(config.api_path + '/stock/save', payload, config.headers()).then(res => {
                if (res.data.message === 'success') {
                    fetchDataStock();
                    setQty(1);

                    Swal.fire({
                        title: 'บันทึก',
                        text: 'รับสินค้าเข้าสต้อกแล้ว',
                        timer: 1000,
                        icon: 'success'
                    })
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
        }
    }

    const handleDelete = (item) => {
        Swal.fire({
            title: 'ลบรายการ',
            text: 'ยืนยันการลบรายการ',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        }).then(async res => {
            if (res.isConfirmed) {
                try {
                    await axios.delete(config.api_path + '/stock/delete/' + item.id, config.headers()).then(res => {
                        if (res.data.message === 'success') {
                            fetchDataStock();

                            Swal.fire({
                                title: 'ลบข้อมูล',
                                text: 'ลบข้อมูลแล้ว',
                                icon: 'success',
                                timer: 1000
                            })
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
                }
            }
        })
    }

    return (
        <>
            <Template>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">รับสินค้าเข้า stock</div>
                    </div>
                    <div className="card-body">
                        <div className="row">

                            <div className="col-4">
                                <div className="input-group">
                                    <span className="input-group-text">สินค้า</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="ค้นหาด้วยชื่อ, บาร์โค้ด, หมวดหมู่..."
                                        value={productId > 0 ? productName : searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        autoFocus
                                    />
                                    {(searchQuery || productId > 0) && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => {
                                                setProductId(0);
                                                setProductName('');
                                                setSearchQuery('');
                                                setFilteredProducts([]);
                                            }}
                                        >
                                            <i className="fa fa-times"></i>
                                        </button>
                                    )}
                                </div>

                                {/* แสดงผลการค้นหาเฉพาะเมื่อยังไม่ได้เลือกสินค้า */}
                                {searchQuery && filteredProducts.length > 0 && filteredProducts.length <= 5 && !productId && (
                                    <div className="dropdown-menu d-block position-absolute w-100 shadow">
                                        {filteredProducts.map((item, index) => (
                                            <button
                                                key={index}
                                                className="dropdown-item py-2"
                                                onClick={() => handleChooseProduct(item)}
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <div>{item.name}</div>
                                                    <div className="text-muted">{item.barcode || '-'}</div>
                                                </div>
                                                <div className="small text-muted">{item.category || '-'}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchQuery && filteredProducts.length > 5 && !productId && (
                                    <div className="dropdown-menu d-block position-absolute w-100 shadow">
                                        <div className="dropdown-item text-muted">พบ {filteredProducts.length} รายการ, กรุณาระบุให้ชัดเจนขึ้น</div>
                                    </div>
                                )}
                                {searchQuery && filteredProducts.length === 0 && !productId && (
                                    <div className="dropdown-menu d-block position-absolute w-100 shadow">
                                        <div className="dropdown-item text-muted">ไม่พบสินค้า "{searchQuery}"</div>
                                    </div>
                                )}


                            </div>
                            <div className="col-2">
                                <div className="input-group">
                                    <span className="input-group-text">จำนวน</span>
                                    <input value={qty}
                                        onChange={e => setQty(e.target.value)}
                                        type="number"
                                        className="form-control" />
                                </div>
                            </div>
                            <div className="col-6">
                                <button onClick={handleSave} className="btn btn-primary">
                                    <i className="fa fa-check me-2"></i>
                                    บันทึก
                                </button>
                            </div>
                        </div>

                        <table className="table table-bordered table-stirped mt-3">
                            <thead>
                                <tr>
                                    <th width="150px">barcode</th>
                                    <th>รายการ</th>
                                    <th width="100px" className="text-end">จำนวน</th>
                                    <th width="180px">วันที่</th>
                                    <th width="100px">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length > 0 ? stocks.map((item, index) => (
                                    <tr key={index}>
                                        {item && item.product ? (
                                            <>
                                                <td>{item.product.barcode || '-'}</td>
                                                <td>{item.product.name}</td>
                                                <td className="text-end">{item.qty}</td>
                                                <td>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={e => handleDelete(item)}
                                                        className="btn btn-danger">
                                                        <i className="fa fa-times me-2"></i>
                                                        ลบ
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <td colSpan="5" className="text-center text-muted">ข้อมูลสินค้าไม่สมบูรณ์</td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">ไม่พบข้อมูล</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </Template>

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                title="เลือกสินค้า"
                modalSize="modal-lg"
            >
                <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className="input-group" style={{ maxWidth: '70%' }}>
                        <span className="input-group-text">
                            <i className="fa fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="ค้นหาด้วยชื่อสินค้า, บาร์โค้ด หรือหมวดหมู่..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => handleSearch('')}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>
                    <div>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="added">เพิ่มในสต็อกแล้ว</option>
                            <option value="notAdded">ยังไม่เพิ่มในสต็อก</option>
                        </select>
                    </div>
                </div>

                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th width="180px"></th>
                            <th width="150px">บาร์โค้ด</th>
                            <th>รายการสินค้า</th>
                            <th>หมวดหมู่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? filteredProducts.map((item, index) =>
                            item ? (
                                <tr key={index}>
                                    <td className="text-center">
                                        <button
                                            onClick={e => handleChooseProduct(item)}
                                            className="btn btn-primary">
                                            <i className="fa fa-check me-2"></i>
                                            เลือกรายการ
                                        </button>
                                    </td>
                                    <td>{item.barcode || '-'}</td>
                                    <td>{item.name}</td>
                                    <td>{item.category || '-'}</td>
                                </tr>
                            ) : (
                                <tr key={index}>
                                    <td colSpan="4" className="text-center text-muted">ข้อมูลสินค้าไม่สมบูรณ์</td>
                                </tr>
                            )
                        ) : searchQuery ? (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">
                                    ไม่พบสินค้าที่ตรงกับ "{searchQuery}"
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">ไม่พบข้อมูล</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Modal>
        </>
    )
}

export default Stock;