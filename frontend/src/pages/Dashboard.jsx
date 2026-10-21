/**
 * Dashboard Page
 * 
 * Displays core metrics:
 * 1. Total Products
 * 2. Total Orders
 * 3. Low Stock Items count
 * 4. Total Sales Value
 * 
 * Also presents a list of low-stock items requiring attention and recent orders.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockCount: 0,
    totalSalesValue: 0,
    lowStockProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard metrics from GET /api/dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load dashboard metrics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
        <p>Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong>. Here is what is happening in your inventory today.
          </p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
          Refresh Stats
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        {/* Total Products */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Products</p>
            <h3>{stats.totalProducts}</h3>
          </div>
          <div className="stat-icon blue">📦</div>
        </div>

        {/* Total Orders */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{stats.totalOrders}</h3>
          </div>
          <div className="stat-icon purple">📑</div>
        </div>

        {/* Low Stock Items */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Low Stock Items</p>
            <h3 style={{ color: stats.lowStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {stats.lowStockCount}
            </h3>
          </div>
          <div className="stat-icon amber">⚠️</div>
        </div>

        {/* Total Sales Value */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Sales Value</p>
            <h3>${Number(stats.totalSalesValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="stat-icon green">💰</div>
        </div>
      </div>

      {/* Grid of Two Informational Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Low Stock Watchlist */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Low Stock Alert</h2>
            <Link to="/products" className="btn btn-secondary btn-sm">View All Products</Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              All inventory levels are currently healthy! No low stock alerts.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Remaining</th>
                    <th>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>
                        <span className="badge badge-low-stock">{p.quantity} left</span>
                      </td>
                      <td>{p.lowStockLimit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
            <Link to="/orders" className="btn btn-secondary btn-sm">View All Orders</Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No orders created yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                      <td>{o.items?.length || 0}</td>
                      <td>${Number(o.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-status-${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
