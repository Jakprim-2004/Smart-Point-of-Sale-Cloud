import { useEffect, useState } from "react";
import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import * as dayjs from 'dayjs';

function Stock() {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showBulkAddModal, setShowBulkAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('notInStock'); // 'notInStock', 'inStock', 'addStock', 'lowStock'
    const [lowStockThreshold, setLowStockThreshold] = useState(10); // เกณฑ์สินค้าเหลือน้อย

    useEffect(() => {
        fetchDataStock();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(config.api_path + '/product/list', config.headers());
            if (res.data.message === 'success') {
                setProducts(res.data.results);
            }
        } catch (e) {
            console.error("Error fetching products:", e);
        }
    };

    const fetchDataStock = async () => {
        try {
            const res = await axios.get(config.api_path + '/stock/list', config.headers());
            if (res.data.message === 'success') {
                setStocks(res.data.results);
            }
        } catch (e) {
            Swal.fire({
                title: 'Error',
                text: e.message,
                icon: 'error'
            });
        }
    };

    // สินค้าที่ยังไม่มีในสต็อก
    const getProductsNotInStock = () => {
        const stockProductIds = stocks.map(stock => stock.product?.id).filter(id => id);
        return products.filter(product => !stockProductIds.includes(product.id));
    };

    // สินค้าที่มีในสต็อกแล้ว
    const getProductsInStock = () => {
        const stockProductIds = stocks.map(stock => stock.product?.id).filter(id => id);
        return products.filter(product => stockProductIds.includes(product.id));
    };

    // คำนวณสต็อกรวมของสินค้าแต่ละชิ้น
    const getTotalStock = (productId) => {
        return stocks
            .filter(stock => stock.product?.id === productId)
            .reduce((total, stock) => {
                // แปลงค่าเป็น number และลบอักขระพิเศษ
                const qty = parseInt(String(stock.qty || 0).replace(/[^0-9]/g, '')) || 0;
                return total + qty;
            }, 0);
    };

    // สินค้าที่เหลือน้อยหรือหมด
    const getLowStockProducts = () => {
        return getProductsInStock().filter(product => {
            const totalStock = getTotalStock(product.id);
            return totalStock <= lowStockThreshold;
        });
    };

    // สินค้าที่หมดสต็อก
    const getOutOfStockProducts = () => {
        return getProductsInStock().filter(product => {
            const totalStock = getTotalStock(product.id);
            return totalStock === 0;
        });
    };

    // ฟิลเตอร์ตามการค้นหา
    const filterProducts = (productList) => {
        if (!searchQuery) return productList;
        
        return productList.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (product.barcode && product.barcode.includes(searchQuery)) ||
            (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    // เพิ่มสินค้าแบบรายตัว
    const handleAddSingleProduct = async (product, qty = 1) => {
        try {
            // แสดง prompt ให้ผู้ใช้ใส่จำนวน
            const { value: quantity } = await Swal.fire({
                title: `เพิ่มสต็อก: ${product.name}`,
                text: 'กรุณาระบุจำนวนที่ต้องการเพิ่ม',
                input: 'number',
                inputValue: qty,
                inputAttributes: {
                    min: 1,
                    step: 1,
                    placeholder: 'จำนวน (ชิ้น)'
                },
                showCancelButton: true,
                confirmButtonText: 'เพิ่มสต็อก',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#28a745',
                inputValidator: (value) => {
                    if (!value || value <= 0) {
                        return 'กรุณาใส่จำนวนที่มากกว่า 0'
                    }
                    if (value > 10000) {
                        return 'จำนวนไม่ควรเกิน 10,000 ชิ้น'
                    }
                }
            });

            if (quantity) {
                const payload = {
                    qty: parseInt(quantity),
                    productId: product.id
                };

                const res = await axios.post(config.api_path + '/stock/save', payload, config.headers());
                
                if (res.data.message === 'success') {
                    fetchDataStock();
                    Swal.fire({
                        title: 'เพิ่มสต็อกสำเร็จ!',
                        html: `เพิ่มสินค้า <strong>"${product.name}"</strong><br>จำนวน <strong>${quantity} ชิ้น</strong> เข้าสต็อกแล้ว`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        } catch (e) {
            Swal.fire({
                title: 'Error',
                text: e.response?.data?.message || 'เกิดข้อผิดพลาด',
                icon: 'error'
            });
        }
    };

    // เพิ่มสินค้าหลายรายการ
    const handleBulkAdd = () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: 'กรุณาเลือกสินค้า',
                text: 'กรุณาเลือกสินค้าที่ต้องการเพิ่มเข้าสต็อก',
                icon: 'warning'
            });
            return;
        }
        setShowBulkAddModal(true);
    };

    // บันทึกการเพิ่มหลายรายการ
    const handleSaveBulkAdd = async () => {
        try {
            const promises = selectedProducts.map(item => 
                axios.post(config.api_path + '/stock/save', {
                    qty: parseInt(item.qty),
                    productId: item.product.id
                }, config.headers())
            );

            await Promise.all(promises);
            
            fetchDataStock();
            setSelectedProducts([]);
            setShowBulkAddModal(false);
            
            Swal.fire({
                title: 'เพิ่มสต็อกสำเร็จ',
                text: `เพิ่มสินค้า ${selectedProducts.length} รายการเข้าสต็อกแล้ว`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            Swal.fire({
                title: 'Error',
                text: 'เกิดข้อผิดพลาดในการเพิ่มสต็อก',
                icon: 'error'
            });
        }
    };

    // เพิ่ม/ลบสินค้าในรายการที่เลือก
    const toggleProductSelection = (product) => {
        const exists = selectedProducts.find(item => item.product.id === product.id);
        
        if (exists) {
            setSelectedProducts(selectedProducts.filter(item => item.product.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, { product, qty: 1 }]);
        }
    };

    // อัปเดตจำนวนสินค้าที่เลือก
    const updateSelectedProductQty = (productId, qty) => {
        setSelectedProducts(selectedProducts.map(item => 
            item.product.id === productId ? { ...item, qty: parseInt(qty) || 1 } : item
        ));
    };

    // ลบสต็อก
    const handleDeleteStock = (item) => {
        Swal.fire({
            title: 'ลบรายการสต็อก',
            text: `ยืนยันการลบ "${item.product?.name || 'รายการนี้'}" จากสต็อก`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(config.api_path + '/stock/delete/' + item.id, config.headers());
                    fetchDataStock();
                    Swal.fire({
                        title: 'ลบสำเร็จ',
                        text: 'ลบรายการสต็อกแล้ว',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (e) {
                    Swal.fire({
                        title: 'Error',
                        text: e.response?.data?.message || 'เกิดข้อผิดพลาด',
                        icon: 'error'
                    });
                }
            }
        });
    };

    return (
        <>
            <Template>
                <div className="container-fluid p-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">
                                    <i className="fas fa-boxes me-2"></i>
                                    จัดการสต็อกสินค้า
                                </h5>
                                <div className="d-flex gap-2 align-items-center">
                                    {/* แสดงการแจ้งเตือนสินค้าเหลือน้อย */}
                                    {getLowStockProducts().length > 0 && (
                                        <div className="alert alert-warning mb-0 py-2 px-3 d-flex align-items-center" style={{fontSize: '0.875rem'}}>
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <span>มีสินค้าเหลือน้อย/หมด <strong>{getLowStockProducts().length}</strong> รายการ</span>
                                            <button 
                                                onClick={() => setActiveTab('lowStock')}
                                                className="btn btn-warning btn-sm ms-2"
                                                style={{fontSize: '0.75rem'}}
                                            >
                                                ดูรายการ
                                            </button>
                                        </div>
                                    )}
                                    
                                    {selectedProducts.length > 0 && (
                                        <button 
                                            onClick={handleBulkAdd}
                                            className="btn btn-warning btn-sm"
                                        >
                                            <i className="fas fa-plus-circle me-1"></i>
                                            เพิ่มที่เลือก ({selectedProducts.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Tab Navigation */}
                            <ul className="nav nav-pills mb-4">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'notInStock' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('notInStock')}
                                    >
                                        <i className="fas fa-plus-circle me-2"></i>
                                        เพิ่มสต็อก ({getProductsNotInStock().length})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'inStock' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('inStock')}
                                    >
                                        <i className="fas fa-check-circle me-2"></i>
                                        มีในสต็อก ({getProductsInStock().length})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'lowStock' ? 'active' : ''} ${getLowStockProducts().length > 0 ? 'border-warning text-warning' : ''}`}
                                        onClick={() => setActiveTab('lowStock')}
                                    >
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        เหลือน้อย/หมด ({getLowStockProducts().length})
                                        {getLowStockProducts().length > 0 && (
                                            <span className="badge bg-warning text-dark ms-1">!</span>
                                        )}
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'addStock' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('addStock')}
                                    >
                                        <i className="fas fa-history me-2"></i>
                                        ประวัติเพิ่มสต็อก ({stocks.length})
                                    </button>
                                </li>
                            </ul>

                            {/* Search Bar */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fas fa-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="ค้นหาด้วยชื่อสินค้า, บาร์โค้ด, หมวดหมู่..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => setSearchQuery('')}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'notInStock' && (
                                <div className="tab-content">
                                    <div className="alert alert-info border-0">
                                        <i className="fas fa-info-circle me-2"></i>
                                        สินค้าที่ยังไม่ได้เพิ่มเข้าสต็อก - คลิกเพื่อเพิ่มรายการ หรือเลือกหลายรายการแล้วเพิ่มพร้อมกัน
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th width="50px">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const newSelections = filterProducts(getProductsNotInStock())
                                                                        .filter(product => !selectedProducts.find(item => item.product.id === product.id))
                                                                        .map(product => ({ product, qty: 1 }));
                                                                    setSelectedProducts([...selectedProducts, ...newSelections]);
                                                                } else {
                                                                    const currentPageIds = filterProducts(getProductsNotInStock()).map(p => p.id);
                                                                    setSelectedProducts(selectedProducts.filter(item => !currentPageIds.includes(item.product.id)));
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th width="120px">บาร์โค้ด</th>
                                                    <th>ชื่อสินค้า</th>
                                                    <th width="150px">หมวดหมู่</th>
                                                    <th width="100px">ราคา</th>
                                                    <th width="150px">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterProducts(getProductsNotInStock()).length > 0 ? 
                                                    filterProducts(getProductsNotInStock()).map((product, index) => (
                                                        <tr key={product.id}>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={selectedProducts.some(item => item.product.id === product.id)}
                                                                    onChange={() => toggleProductSelection(product)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <code className="bg-light p-1 rounded">
                                                                    {product.barcode || '-'}
                                                                </code>
                                                            </td>
                                                            <td>
                                                                <div className="fw-bold">{product.name}</div>
                                                                {product.description && (
                                                                    <small className="text-muted">{product.description}</small>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-secondary">
                                                                    {product.category || 'ไม่ระบุ'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="fw-bold text-success">
                                                                    ฿{product.price?.toLocaleString() || '0'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleAddSingleProduct(product)}
                                                                    className="btn btn-primary btn-sm"
                                                                    title="คลิกเพื่อระบุจำนวนและเพิ่มเข้าสต็อก"
                                                                >
                                                                    <i className="fas fa-plus me-1"></i>
                                                                    เพิ่มสต็อก
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                                <i className="fas fa-check-circle fa-2x mb-2 d-block text-success"></i>
                                                                {searchQuery ? 
                                                                    `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"` : 
                                                                    'สินค้าทั้งหมดมีในสต็อกแล้ว'
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inStock' && (
                                <div className="tab-content">
                                    <div className="alert alert-success border-0">
                                        <i className="fas fa-check-circle me-2"></i>
                                        สินค้าที่มีในสต็อกแล้ว - สามารถเพิ่มจำนวนเพิ่มเติมได้
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th width="120px">บาร์โค้ด</th>
                                                    <th>ชื่อสินค้า</th>
                                                    <th width="150px">หมวดหมู่</th>
                                                    <th width="100px">ราคา</th>
                                                    <th width="100px">สต็อกรวม</th>
                                                    <th width="150px">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterProducts(getProductsInStock()).length > 0 ? 
                                                    filterProducts(getProductsInStock()).map((product, index) => {
                                                        const totalStock = getTotalStock(product.id);
                                                        const isLowStock = totalStock <= lowStockThreshold;
                                                        const isOutOfStock = totalStock === 0;
                                                        
                                                        return (
                                                            <tr key={product.id} className={isOutOfStock ? 'table-danger' : isLowStock ? 'table-warning' : ''}>
                                                                <td>
                                                                    <code className="bg-light p-1 rounded">
                                                                        {product.barcode || '-'}
                                                                    </code>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-bold">{product.name}</div>
                                                                    {product.description && (
                                                                        <small className="text-muted">{product.description}</small>
                                                                    )}
                                                                    {isOutOfStock && (
                                                                        <span className="badge bg-danger ms-2">หมดสต็อก</span>
                                                                    )}
                                                                    {isLowStock && !isOutOfStock && (
                                                                        <span className="badge bg-warning text-dark ms-2">เหลือน้อย</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-secondary">
                                                                        {product.category || 'ไม่ระบุ'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-bold text-success">
                                                                        ฿{product.price?.toLocaleString() || '0'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge fs-6 ${isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning text-dark' : 'bg-info'}`}>
                                                                        {Number(totalStock).toLocaleString()} ชิ้น
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        onClick={() => handleAddSingleProduct(product)}
                                                                        className={`btn btn-sm ${isOutOfStock ? 'btn-danger' : isLowStock ? 'btn-warning' : 'btn-outline-primary'}`}
                                                                        title="เพิ่มสต็อกเพิ่มเติม"
                                                                    >
                                                                        <i className="fas fa-plus me-1"></i>
                                                                        {isOutOfStock ? 'เติมด่วน' : 'เพิ่ม'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                                <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
                                                                {searchQuery ? 
                                                                    `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"` : 
                                                                    'ยังไม่มีสินค้าในสต็อก'
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'lowStock' && (
                                <div className="tab-content">
                                    <div className="alert alert-warning border-0">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        สินค้าที่เหลือน้อยหรือหมดสต็อก (เกณฑ์: ≤ {lowStockThreshold} ชิ้น)
                                        <div className="mt-2">
                                            <label className="form-label small">ปรับเกณฑ์สินค้าเหลือน้อย:</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm d-inline-block ms-2"
                                                style={{width: '80px'}}
                                                value={lowStockThreshold}
                                                min="1"
                                                max="100"
                                                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                                            />
                                            <span className="ms-1 small text-muted">ชิ้น</span>
                                        </div>
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th width="120px">บาร์โค้ด</th>
                                                    <th>ชื่อสินค้า</th>
                                                    <th width="150px">หมวดหมู่</th>
                                                    <th width="100px">ราคา</th>
                                                    <th width="120px">สถานะสต็อก</th>
                                                    <th width="150px">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterProducts(getLowStockProducts()).length > 0 ? 
                                                    filterProducts(getLowStockProducts()).map((product, index) => {
                                                        const totalStock = getTotalStock(product.id);
                                                        const isOutOfStock = totalStock === 0;
                                                        
                                                        return (
                                                            <tr key={product.id} className={isOutOfStock ? 'table-danger' : 'table-warning'}>
                                                                <td>
                                                                    <code className="bg-light p-1 rounded">
                                                                        {product.barcode || '-'}
                                                                    </code>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-bold">{product.name}</div>
                                                                    {product.description && (
                                                                        <small className="text-muted">{product.description}</small>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-secondary">
                                                                        {product.category || 'ไม่ระบุ'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-bold text-success">
                                                                        ฿{product.price?.toLocaleString() || '0'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {isOutOfStock ? (
                                                                        <span className="badge bg-danger fs-6">
                                                                            <i className="fas fa-times me-1"></i>
                                                                            หมดสต็อก
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge bg-warning text-dark fs-6">
                                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                                            เหลือ {Number(totalStock).toLocaleString()} ชิ้น
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        onClick={() => handleAddSingleProduct(product)}
                                                                        className={`btn btn-sm ${isOutOfStock ? 'btn-danger' : 'btn-warning'}`}
                                                                        title={isOutOfStock ? 'เติมสต็อกด่วน' : 'เพิ่มสต็อก'}
                                                                    >
                                                                        <i className="fas fa-plus me-1"></i>
                                                                        {isOutOfStock ? 'เติมด่วน!' : 'เติมสต็อก'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                                <i className="fas fa-check-circle fa-2x mb-2 d-block text-success"></i>
                                                                {searchQuery ? 
                                                                    `ไม่พบสินค้าเหลือน้อยที่ตรงกับ "${searchQuery}"` : 
                                                                    'ยินดีด้วย! ไม่มีสินค้าเหลือน้อยหรือหมดสต็อก'
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'addStock' && (
                                <div className="tab-content">
                                    <div className="alert alert-secondary border-0">
                                        <i className="fas fa-history me-2"></i>
                                        ประวัติการเพิ่มสต็อกทั้งหมด
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th width="120px">บาร์โค้ด</th>
                                                    <th>ชื่อสินค้า</th>
                                                    <th width="100px" className="text-end">จำนวน</th>
                                                    <th width="180px">วันที่เพิ่ม</th>
                                                    <th width="100px">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stocks.length > 0 ? stocks
                                                    .filter(stock => {
                                                        if (!searchQuery) return true;
                                                        const product = stock.product;
                                                        return product && (
                                                            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            product.barcode?.includes(searchQuery) ||
                                                            product.category?.toLowerCase().includes(searchQuery.toLowerCase())
                                                        );
                                                    })
                                                    .map((item, index) => (
                                                        <tr key={index}>
                                                            {item && item.product ? (
                                                                <>
                                                                    <td>
                                                                        <code className="bg-light p-1 rounded">
                                                                            {item.product.barcode || '-'}
                                                                        </code>
                                                                    </td>
                                                                    <td>
                                                                        <div className="fw-bold">{item.product.name}</div>
                                                                        <small className="text-muted">
                                                                            {item.product.category || 'ไม่ระบุหมวดหมู่'}
                                                                        </small>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <span className="badge bg-primary fs-6">
                                                                            {item.qty}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <div>{dayjs(item.createdAt).format('DD/MM/YYYY')}</div>
                                                                        <small className="text-muted">
                                                                            {dayjs(item.createdAt).format('HH:mm น.')}
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            onClick={() => handleDeleteStock(item)}
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            title="ลบรายการนี้"
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <td colSpan="5" className="text-center text-muted">
                                                                    ข้อมูลสินค้าไม่สมบูรณ์
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                                <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                                                                ยังไม่มีประวัติการเพิ่มสต็อก
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Template>

            {/* Modal สำหรับเพิ่มหลายรายการ */}
            <Modal
                show={showBulkAddModal}
                onHide={() => setShowBulkAddModal(false)}
                title={`เพิ่มสต็อกสินค้า ${selectedProducts.length} รายการ`}
                modalSize="modal-lg"
            >
                <div className="table-responsive">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>สินค้า</th>
                                <th width="120px">จำนวน</th>
                                <th width="80px">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProducts.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="fw-bold">{item.product.name}</div>
                                        <small className="text-muted">{item.product.barcode || '-'}</small>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={item.qty}
                                            min="1"
                                            onChange={(e) => updateSelectedProductQty(item.product.id, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleProductSelection(item.product)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button 
                        onClick={() => setShowBulkAddModal(false)}
                        className="btn btn-secondary"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={handleSaveBulkAdd}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-save me-2"></i>
                        บันทึกทั้งหมด
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default Stock;