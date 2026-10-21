/**
 * User & Staff Management Page (Admin Only)
 * 
 * Allows administrators to:
 * - View all team members and their roles
 * - Create new staff/admin accounts directly
 * - Change user roles (Promote to Admin / Demote to Staff)
 * - Delete user accounts
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all users: GET /api/auth/users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user role: PUT /api/auth/users/:id/role
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'staff' : 'admin';
    if (!window.confirm(`Change ${targetUser.name}'s role to "${newRole}"?`)) {
      return;
    }

    try {
      setError('');
      const res = await api.put(`/auth/users/${targetUser._id}/role`, { role: newRole });
      if (res.data.success) {
        setSuccessMsg(`Updated ${targetUser.name}'s role to ${newRole}`);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Delete user: DELETE /api/auth/users/:id
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to delete account "${targetUser.name}"?`)) {
      return;
    }

    try {
      setError('');
      const res = await api.delete(`/auth/users/${targetUser._id}`);
      if (res.data.success) {
        setSuccessMsg(`Deleted account "${targetUser.name}" successfully`);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Create new team member: POST /api/auth/register
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');

    if (formData.password.length < 6) {
      setModalError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        setSuccessMsg(`New user "${formData.name}" added successfully!`);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'staff' });
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & User Management</h1>
          <p className="page-subtitle">
            Manage your team accounts, assign administrative roles, and add new members.
          </p>
        </div>
        <button
          onClick={() => {
            setModalError('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          + Add New Team Member
        </button>
      </div>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Users Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading team members...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>
                      {u.name} {isSelf && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(You)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-tag ${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {!isSelf ? (
                        <>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginRight: '0.5rem' }}
                          >
                            {u.role === 'admin' ? 'Demote to Staff' : 'Promote to Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Active Session
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add Team Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                ✕
              </button>
            </div>

            {modalError && <div className="alert alert-danger">{modalError}</div>}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. alex@inventory.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff (View products, manage orders)</option>
                  <option value="admin">Admin (Full administrative access)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Password (min. 6 characters)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
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
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
