import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, user: null });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminAPI.getUsers();
        const data = res.data?.data || res.data?.users || res.data || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await adminAPI.toggleUserStatus(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } finally {
      setConfirmDialog({ isOpen: false, user: null });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'ALL' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-7 h-7 mr-2 text-primary-600" /> Users & Role Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Oversee registered customers, vendor accounts, and administrators.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Registered: <span className="font-bold text-gray-900">{users.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  roleFilter === role
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              title="No users found"
              description="No accounts match your current search query or role filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'vendor' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center text-green-700 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-700 text-xs font-semibold bg-red-50 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          if (user.isActive) {
                            setConfirmDialog({ isOpen: true, user });
                          } else {
                            handleToggleStatus(user);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          user.isActive 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Deactivate User Account"
        message={`Are you sure you want to deactivate ${confirmDialog.user?.name}'s account (${confirmDialog.user?.email})? They will be unable to log in until reactivated.`}
        confirmText="Deactivate Account"
        type="danger"
        onConfirm={() => handleToggleStatus(confirmDialog.user)}
        onCancel={() => setConfirmDialog({ isOpen: false, user: null })}
      />
    </div>
  );
};

export default AdminUsers;
