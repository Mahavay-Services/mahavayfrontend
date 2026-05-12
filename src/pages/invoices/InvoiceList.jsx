import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoiceService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

const statusVariant = {
  draft: "secondary",
  sent: "primary",
  paid: "success",
  cancelled: "danger",
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInvoices(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll({
        page,
        limit: 20,
        search,
        status: statusFilter,
        invoice_type: typeFilter,
      });
      setInvoices(response.data?.data?.invoices || []);
      setPagination(response.data?.data?.pagination || null);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted");
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Invoices</h1>
          <p className="text-secondary-500">
            Proforma and Tax invoices management
          </p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            <option value="proforma">Proforma</option>
            <option value="tax">Tax Invoice</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Invoice #
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Buyer
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-secondary-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-secondary-500"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="font-semibold text-primary-600 hover:text-primary-700"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={inv.invoice_type === "tax" ? "primary" : "secondary"}
                      >
                        {inv.invoice_type === "tax" ? "Tax" : "Proforma"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-secondary-900">
                        {inv.buyer_name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {inv.buyer_company}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[inv.status] || "secondary"}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="p-2 hover:bg-secondary-100 rounded-lg"
                          title="View/PDF"
                        >
                          <Eye className="w-4 h-4 text-secondary-600" />
                        </Link>
                        <Link
                          to={`/invoices/${inv.id}/edit`}
                          className="p-2 hover:bg-secondary-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-secondary-600" />
                        </Link>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchInvoices(pagination.page + 1)}
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

export default InvoiceList;
