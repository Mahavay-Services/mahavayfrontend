import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import StatCard from "../../components/ui/StatCard";
import {
  Plus,
  Edit,
  UserCheck,
  UserX,
  Search,
  Key,
  Trash2,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { ROLE_LABELS } from "../../constants";
import toast from "react-hot-toast";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", is_active: "" });
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await userService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await userService.getAll({
        page,
        limit: 20,
        search,
        ...filters,
      });
      setUsers(response.data.data?.users || []);
      setPagination(response.data.data?.pagination || null);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleStatus = async (id) => {
    try {
      await userService.toggleStatus(id);
      toast.success("User status updated");
      fetchUsers(pagination?.page);
      fetchStats();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await userService.resetPassword(selectedUser.id, { newPassword });
      toast.success("Password reset successfully");
      setResetPasswordModal(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await userService.delete(selectedUser.id);
      toast.success("User deleted successfully");
      setDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(pagination?.page);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {row.full_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-secondary-900">{row.full_name}</p>
            <p className="text-sm text-secondary-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Employee ID",
      accessor: "employee_id",
    },
    {
      header: "Role",
      render: (row) => (
        <Badge variant="primary">{ROLE_LABELS[row.role] || row.role}</Badge>
      ),
    },
    {
      header: "Department",
      accessor: "department",
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "success" : "danger"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/users/${row.id}/edit`}
            className="p-2 hover:bg-secondary-100 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-secondary-600" />
          </Link>
          <button
            onClick={() => {
              setSelectedUser(row);
              setResetPasswordModal(true);
            }}
            className="p-2 hover:bg-secondary-100 rounded-lg"
            title="Reset Password"
          >
            <Key className="w-4 h-4 text-yellow-600" />
          </button>
          <button
            onClick={() => toggleStatus(row.id)}
            className="p-2 hover:bg-secondary-100 rounded-lg"
            title={row.is_active ? "Deactivate" : "Activate"}
          >
            {row.is_active ? (
              <UserX className="w-4 h-4 text-red-600" />
            ) : (
              <UserCheck className="w-4 h-4 text-primary-600" />
            )}
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setDeleteModal(true);
            }}
            className="p-2 hover:bg-red-100 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage system users and their access"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users" },
        ]}
        actions={
          <Link to="/users/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        }
      />

      <div className="card mb-6">
        <div className="p-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="input w-full md:w-48"
            >
              <option value="">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
              className="input w-full md:w-40"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchUsers}
        emptyMessage="No users found"
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordModal}
        onClose={() => {
          setResetPasswordModal(false);
          setSelectedUser(null);
          setNewPassword("");
        }}
        title="Reset Password"
      >
        {selectedUser && (
          <div>
            <div className="p-4 bg-secondary-50 rounded-lg mb-4">
              <p className="font-semibold">{selectedUser.full_name}</p>
              <p className="text-sm text-secondary-500">{selectedUser.email}</p>
            </div>
            <div className="mb-4">
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResetPasswordModal(false);
                  setNewPassword("");
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Delete User"
      >
        {selectedUser && (
          <div>
            <div className="p-4 bg-red-50 rounded-lg mb-4 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-red-700">
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-red-600 mt-1">
                {selectedUser.full_name} ({selectedUser.email})
              </p>
            </div>
            <p className="text-sm text-secondary-500 mb-4">
              This will deactivate the user account. This action can be undone
              by reactivating the user.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="btn-danger"
              >
                {submitting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;
