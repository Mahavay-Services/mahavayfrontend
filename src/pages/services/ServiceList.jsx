import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { serviceService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import { Plus, Edit, ToggleLeft, ToggleRight, Search } from "lucide-react";
import toast from "react-hot-toast";

const ServiceList = () => {
  const { hasRole } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", is_active: "" });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [filters]);

  const fetchServices = async (page = 1) => {
    setLoading(true);
    try {
      const response = await serviceService.getAll({
        page,
        limit: 20,
        search,
        ...filters,
      });
      setServices(response.data.data?.services || []);
      setPagination(response.data.data?.pagination || null);
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await serviceService.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const toggleStatus = async (id) => {
    try {
      await serviceService.toggleStatus(id);
      toast.success("Service status updated");
      fetchServices(pagination?.page);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const columns = [
    {
      header: "Service",
      render: (row) => (
        <div>
          <p className="font-medium text-secondary-900">{row.service_name}</p>
          <p className="text-sm text-secondary-500">{row.service_code}</p>
        </div>
      ),
    },
    {
      header: "Category",
      render: (row) =>
        row.category ? <Badge variant="secondary">{row.category}</Badge> : "-",
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.default_price)}
        </span>
      ),
    },
    {
      header: "GST %",
      render: (row) => `${row.gst_percentage}%`,
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "success" : "danger"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(hasRole("super_admin")
      ? [
          {
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link
                  to={`/services/${row.id}/edit`}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-secondary-600" />
                </Link>
                <button
                  onClick={() => toggleStatus(row.id)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                >
                  {row.is_active ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-secondary-400" />
                  )}
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Manage your service catalog"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Services" },
        ]}
        actions={
          hasRole("super_admin") && (
            <Link to="/services/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Link>
          )
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
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="input w-full md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
        data={services}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchServices}
        emptyMessage="No services found"
      />
    </div>
  );
};

export default ServiceList;
