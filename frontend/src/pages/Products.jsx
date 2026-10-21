/**
 * Products Management Page
 * 
 * Features:
 * - List all products with search & category filtering
 * - Displays "Low stock" badge when quantity <= lowStockLimit
 * - Role-based permissions:
 *   - Admin: Can Add, Edit, and Delete products
 *   - Staff: Read-only view (all management buttons are strictly hidden)
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../utils/exportCsv';

const Products = () => {
  const { isAdmin } = useAuth();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    lowStockLimit: '5'
  });

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal in "Add" mode
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      quantity: '',
      lowStockLimit: '5'
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setIsModalOpen(true);
  };

  // Open modal in "Edit" mode with prefilled values
  const handleOpenEditModal = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      lowStockLimit: product.lowStockLimit
    });
    setIsEditing(true);
    setCurrentProductId(product._id);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  // Handle Add/Edit form submission (Admin Only)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        lowStockLimit: Number(formData.lowStockLimit)
      };

      if (isEditing) {
        // PUT /api/products/:id
        await api.put(`/products/${currentProductId}`, payload);
        setSuccessMsg('Product updated successfully!');
      } else {
        // POST /api/products
        await api.post('/products', payload);
        setSuccessMsg('Product added successfully!');
      }

      handleCloseModal();
      fetchProducts();

      // Clear success notification after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    }
  };

  // Handle Delete (Admin Only)
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setSuccessMsg(`Deleted "${name}" successfully.`);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Derive unique categories for dropdown filter
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Filter products by search term and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Export products to CSV file
  const handleExportCSV = () => {
    const columns = [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price ($)' },
      { key: 'quantity', label: 'Stock Quantity' },
      { key: 'lowStockLimit', label: 'Low Stock Limit' }
    ];
    exportToCsv(filteredProducts, columns, `inventory_products_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products Inventory</h1>
          <p className="page-subtitle">
            Manage your stock items, track quantities, and monitor low-stock thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            📥 Export CSV
          </button>
          {/* Admin-only "Add Product" button */}
          {isAdmin && (
            <button onClick={handleOpenAddModal} className="btn btn-primary">
              + Add New Product
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && !isModalOpen && <div className="alert alert-danger">{error}</div>}

      {/* Search and Category Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search product by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Category:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Qty</th>
              <th>Status</th>
              {/* Only show Actions column header to Admin */}
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading inventory products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>
                  No products matched your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.quantity <= p.lowStockLimit;
                return (
                  <tr key={p._id}>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <strong>{p.quantity}</strong>{' '}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (limit: {p.lowStockLimit})
                      </span>
                    </td>
                    <td>
                      {isLowStock ? (
                        <span className="badge badge-low-stock">⚠️ Low stock</span>
                      ) : (
                        <span className="badge badge-in-stock">In stock</span>
                      )}
                    </td>

                    {/* Admin-only Edit & Delete buttons */}
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={handleCloseModal} className="modal-close">
                ✕
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmitProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MOU-WIR-01"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Peripherals"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="49.99"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity on Hand</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="20"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Low Stock Limit (Threshold for warning badge)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="5"
                  value={formData.lowStockLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockLimit: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
