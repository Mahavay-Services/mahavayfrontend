import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { serviceService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const schema = yup.object({
  service_name: yup.string().required("Service name is required"),
  service_code: yup.string(),
  category: yup.string(),
  description: yup.string(),
  default_price: yup
    .number()
    .required("Price is required")
    .min(0, "Price must be positive"),
  gst_percentage: yup.number().min(0).max(100).default(18),
  is_active: yup.boolean().default(true),
});

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gst_percentage: 18,
      is_active: true,
    },
  });

  const price = watch("default_price", 0);
  const gst = watch("gst_percentage", 18);
  const gstAmount = (parseFloat(price) * parseFloat(gst)) / 100 || 0;
  const totalAmount = parseFloat(price) + gstAmount || 0;

  useEffect(() => {
    if (isEdit) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await serviceService.getById(id);
      reset(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch service");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await serviceService.update(id, data);
        toast.success("Service updated successfully");
      } else {
        await serviceService.create(data);
        toast.success("Service created successfully");
      }
      navigate("/services");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Service" : "Add New Service"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Services", href: "/services" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <button onClick={() => navigate("/services")} className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Service Details</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Service Name *</label>
                <input
                  {...register("service_name")}
                  className={`input ${errors.service_name ? "input-error" : ""}`}
                />
                {errors.service_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.service_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Service Code</label>
                {isEdit ? (
                  <input
                    {...register("service_code")}
                    className="input bg-secondary-50"
                    disabled
                  />
                ) : (
                  <input
                    {...register("service_code")}
                    className="input"
                    placeholder="Auto-generated (e.g. SVC-0001)"
                  />
                )}
                <p className="text-xs text-secondary-400 mt-1">
                  {isEdit
                    ? "Code cannot be changed"
                    : "Leave blank for auto-generated code"}
                </p>
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  {...register("category")}
                  className="input"
                  placeholder="e.g., Company Registration"
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select {...register("is_active")} className="input">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  {...register("description")}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <div className="card-header">
            <h3 className="font-semibold">Pricing</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Default Price (â‚¹) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("default_price")}
                  className={`input ${errors.default_price ? "input-error" : ""}`}
                />
                {errors.default_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.default_price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">GST Percentage *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("gst_percentage")}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-3">
                Price Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Base Price</span>
                  <span className="font-medium">
                    â‚¹{parseFloat(price || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">GST ({gst}%)</span>
                  <span className="font-medium">
                    â‚¹{gstAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-secondary-200">
                  <span className="font-semibold text-secondary-900">
                    Total Amount
                  </span>
                  <span className="font-bold text-primary-600">
                    â‚¹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="btn-outline"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Service" : "Create Service"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
