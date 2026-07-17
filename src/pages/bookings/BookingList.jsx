import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  FileText,
  IndianRupee,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { STAGE_LABELS } from "../../constants";
import toast from "react-hot-toast";

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const stageBadgeVariant = (stage) => {
  const variants = {
    sales_created: "primary",
    accounts_verification_pending: "warning",
    accounts_verified: "success",
    legal_pending: "warning",
    legal_verified: "success",
    operations_started: "primary",
    partially_completed: "warning",
    completed: "success",
    cancelled: "danger",
    on_hold: "secondary",
  };
  return variants[stage] || "secondary";
};

const BookingList = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalValue: 0,
    collected: 0,
    pending: 0,
  });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    stage: "",
    status: "",
    month: "",
  });

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchBookings();
      },
      search ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [search, filters]);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await bookingService.getAll({
        page,
        limit: 20,
        search,
        ...filters,
      });
      console.log("Bookings API response:", response.data);
      const data = response.data.data || {};
      setBookings(data.bookings || []);
      setPagination(data.pagination || null);

      // Calculate stats from response or bookings
      if (data.stats) {
        setStats(data.stats);
      } else {
        // Calculate from current page data
        const bookingsList = data.bookings || [];
        const totalValue = bookingsList.reduce(
          (sum, b) => sum + (parseFloat(b.total_amount) || 0),
          0,
        );
        const collected = bookingsList.reduce(
          (sum, b) => sum + (parseFloat(b.received_amount) || 0),
          0,
        );
        setStats({
          totalBookings: data.pagination?.total || bookingsList.length,
          totalValue,
          collected,
          pending: totalValue - collected,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({ stage: "", status: "", month: "" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("₹", "₹");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Bookings</h1>
          <p className="text-secondary-500">Manage and track all bookings</p>
        </div>
        {hasRole("super_admin", "sales") && (
          <Link to="/bookings/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                {stats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Total Value
              </p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-accent-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Collected
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.collected)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(stats.pending)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-secondary-500 uppercase mb-1 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Client name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 uppercase mb-1 block">
              Stage
            </label>
            <select
              value={filters.stage}
              onChange={(e) =>
                setFilters({ ...filters, stage: e.target.value })
              }
              className="input"
            >
              <option value="">All Stages</option>
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 uppercase mb-1 block">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-500 uppercase mb-1 block">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="input"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="btn-outline w-full"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Balance
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Stage
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-secondary-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="font-semibold text-primary-600 hover:text-primary-700"
                      >
                        #
                        {booking.booking_number?.split("-").pop() || booking.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-secondary-900 uppercase text-sm">
                          {booking.company_name || booking.client_name}
                        </p>
                        <p className="text-secondary-600 text-sm">
                          {booking.client_name}
                        </p>
                        <p className="text-secondary-400 text-xs">
                          {booking.mobile}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(booking.received_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${booking.pending_amount > 0 ? "text-orange-600" : "text-green-600"}`}
                      >
                        {formatCurrency(booking.pending_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={stageBadgeVariant(booking.current_stage)}>
                        {STAGE_LABELS[booking.current_stage] ||
                          booking.current_stage}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          booking.current_stage === "cancelled"
                            ? "danger"
                            : booking.current_stage === "completed"
                              ? "success"
                              : "primary"
                        }
                      >
                        {booking.current_stage === "cancelled"
                          ? "cancelled"
                          : booking.current_stage === "completed"
                            ? "completed"
                            : "active"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-secondary-600 text-sm">
                        {formatDate(booking.booking_date || booking.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          View
                        </Link>
                        {hasRole("super_admin", "sales") && (
                          <>
                            <Link
                              to={`/bookings/${booking.id}/edit`}
                              className="px-3 py-1 text-xs font-medium text-accent-600 hover:bg-accent-50 rounded transition-colors"
                            >
                              Edit
                            </Link>
                            <button className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} bookings
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchBookings(pageNum)}
                    className={`px-3 py-1 rounded text-sm font-medium ${pagination.page === pageNum ? "bg-primary-600 text-white" : "hover:bg-secondary-100"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;
