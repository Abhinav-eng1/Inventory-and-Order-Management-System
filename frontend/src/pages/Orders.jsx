/**
 * Orders Management Page
 * 
 * Features:
 * - Lists all customer orders with customer name, items, total amount, and status
 * - Search by Customer Name or Order ID
 * - Filter orders by Status (All, Pending, Completed, Cancelled)
 * - Export Orders report to CSV
 * - Printable Official Invoice & Receipt View with PDF print option
 * - Interactive Create Order modal:
 *   - Allows adding multiple products with quantity
 *   - Checks stock availability and shows warnings
 *   - Calculates total price live
 * - Order status updater:
 *   - Allows changing status between Pending, Completed, and Cancelled
 *   - Cancelling an order restores the inventory stock!
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { exportToCsv } from '../utils/exportCsv';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Status Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Order Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 }
  ]);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Invoice / Receipt Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Fetch orders from GET /api/orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active products list for the create order dropdown
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Update order status: PUT /api/orders/:id/status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError('');
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(`Order updated to "${newStatus}". Inventory stock synchronized.`);
        fetchOrders();
        fetchProducts(); // Refresh stock counts in background
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Create order modal item helpers
  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (orderItems.length === 1) return;
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  // Calculate live total amount in modal
  const calculateModalTotal = () => {
    return orderItems.reduce((sum, item) => {
      const prod = products.find((p) => p._id === item.productId);
      if (prod && item.quantity > 0) {
        return sum + prod.price * Number(item.quantity);
      }
      return sum;
    }, 0);
  };

  // Submit new order: POST /api/orders
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!customerName.trim()) {
      setModalError('Customer name is required');
      return;
    }

    // Verify all selected products are valid
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.productId) {
        setModalError(`Please select a product for item #${i + 1}`);
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        setModalError(`Quantity for item #${i + 1} must be at least 1`);
        return;
      }
      const prod = products.find((p) => p._id === item.productId);
      if (prod && Number(item.quantity) > prod.quantity) {
        setModalError(
          `Insufficient stock for "${prod.name}". Only ${prod.quantity} available in inventory.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.post('/orders', {
        customerName,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity)
        }))
      });

      if (res.data.success) {
        setSuccessMsg('Order created successfully and product stock reduced!');
        setIsModalOpen(false);
        setCustomerName('');
        setOrderItems([{ productId: '', quantity: 1 }]);
        fetchOrders();
        fetchProducts();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter orders by search & status
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export orders to CSV
  const handleExportCSV = () => {
    const exportData = filteredOrders.map((o) => ({
      orderId: o._id,
      customerName: o.customerName,
      date: new Date(o.createdAt).toLocaleDateString(),
      itemsCount: o.items.reduce((acc, it) => acc + it.quantity, 0),
      totalAmount: `$${Number(o.totalAmount).toFixed(2)}`,
      status: o.status
    }));

    const columns = [
      { key: 'orderId', label: 'Order ID' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'date', label: 'Order Date' },
      { key: 'itemsCount', label: 'Total Units' },
      { key: 'totalAmount', label: 'Total Amount' },
      { key: 'status', label: 'Status' }
    ];

    exportToCsv(exportData, columns, `orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">
            Create customer orders, process fulfillment, track statuses, and print invoices.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              setModalError('');
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Create New Order
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search and Status Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search orders by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items Ordered</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Change Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders matched your search / filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <code title={o._id}>#{o._id.substring(o._id.length - 6)}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{o.customerName}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem' }}>
                      {o.items.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-muted)' }}>
                          • <strong>{item.name}</strong> × {item.quantity} (${Number(item.price).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ${Number(o.totalAmount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge badge-status-${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedInvoiceOrder(o)}
                      className="btn btn-secondary btn-sm"
                      title="View & Print Official Invoice"
                    >
                      📄 Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', padding: 0 }}>
            {/* Modal action bar (hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
              <span style={{ fontWeight: 600 }}>Order Receipt & Invoice</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                >
                  🖨️ Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Actual Printable Invoice Document */}
            <div className="invoice-container">
              <div className="invoice-header">
                <div>
                  <div className="invoice-brand">InventoryHub</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Inventory & Order Management System
                  </div>
                </div>
                <div className="invoice-meta">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>INVOICE</h3>
                  <div><strong>Invoice #:</strong> INV-{selectedInvoiceOrder._id.substring(selectedInvoiceOrder._id.length - 8).toUpperCase()}</div>
                  <div><strong>Date:</strong> {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> <span className={`badge badge-status-${selectedInvoiceOrder.status.toLowerCase()}`}>{selectedInvoiceOrder.status}</span></div>
                </div>
              </div>

              <div className="invoice-details-grid">
                <div>
                  <strong style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Billed To:</strong>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>
                    {selectedInvoiceOrder.customerName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Issued By:</strong>
                  <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>InventoryHub Operations</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>support@inventoryhub.local</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>${Number(item.price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation Section */}
              <div className="invoice-total-section">
                <div className="invoice-total-box">
                  <div className="invoice-total-row">
                    <span>Subtotal:</span>
                    <span>${Number(selectedInvoiceOrder.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="invoice-total-row">
                    <span>Tax (0%):</span>
                    <span>$0.00</span>
                  </div>
                  <div className="invoice-total-row grand-total">
                    <span>Total Due:</span>
                    <span>${Number(selectedInvoiceOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                Thank you for your business! This is an official invoice generated by InventoryHub.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Customer Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                ✕
              </button>
            </div>

            {modalError && <div className="alert alert-danger">{modalError}</div>}

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Acme Corp / Jane Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Another Item
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: 'var(--radius)'
                    }}
                  >
                    <div>
                      <select
                        className="form-control"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        required
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option
                            key={p._id}
                            value={p._id}
                            disabled={p.quantity === 0}
                          >
                            {p.name} - ${p.price.toFixed(2)} ({p.quantity === 0 ? 'OUT OF STOCK' : `${p.quantity} in stock`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={orderItems.length === 1}
                        className="btn btn-danger btn-sm"
                        title="Remove item row"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary box */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius)',
                  marginTop: '1.25rem'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Calculated Total:</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                  ${calculateModalTotal().toFixed(2)}
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
