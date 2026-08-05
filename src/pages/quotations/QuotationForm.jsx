import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quotationService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { INDIAN_STATES } from "../../constants";
import toast from "react-hot-toast";

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    client_name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    quotation_date: new Date().toISOString().split("T")[0],
    valid_until: "",
    include_gst: true,
    notes: "",
    terms_conditions:
      "1. This quotation is valid for 15 days from the date of issue.\n2. Payment terms: 50% advance, 50% on completion.\n3. GST as applicable.\n4. Delivery timelines will be shared post confirmation.",
  });

  const [items, setItems] = useState([
    {
      service_id: "",
      service_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      gst_percentage: 18,
      gst_amount: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const servicesRes = await quotationService.getServices();
      setServices(servicesRes.data?.data || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }

    if (isEdit) {
      try {
        const res = await quotationService.getById(id);
        const q = res.data.data;
        setForm({
          client_name: q.client_name || "",
          company_name: q.company_name || "",
          email: q.email || "",
          phone: q.phone || "",
          address: q.address || "",
          city: q.city || "",
          state: q.state || "",
          quotation_date: q.quotation_date || "",
          valid_until: q.valid_until || "",
          include_gst: q.include_gst !== false,
          notes: q.notes || "",
          terms_conditions: q.terms_conditions || "",
        });
        // Ensure items is always a proper array
        let parsedItems = q.items;
        if (typeof parsedItems === "string") {
          try {
            parsedItems = JSON.parse(parsedItems);
          } catch (e) {
            parsedItems = [];
          }
        }
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setItems(parsedItems);
        }
      } catch (error) {
        console.error("Failed to load quotation:", error);
        toast.error("Failed to load quotation data");
      }
    }

    setLoading(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        service_id: "",
        service_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        discount_amount: 0,
        gst_percentage: 18,
        gst_amount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill from service
      if (field === "service_id" && value) {
        const service = services.find((s) => s.id === parseInt(value));
        if (service) {
          updated[index].service_name = service.service_name;
          updated[index].unit_price = parseFloat(service.default_price);
          updated[index].gst_percentage = parseFloat(service.gst_percentage);
          updated[index].description = service.service_code;
        }
      }

      // Recalculate line item
      const item = updated[index];
      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const lineTotal = qty * unitPrice;
      const discPercent = parseFloat(item.discount_percent) || 0;
      const discAmount = (lineTotal * discPercent) / 100;
      updated[index].discount_amount = discAmount;
      const afterDiscount = lineTotal - discAmount;
      const gstPercent = form.include_gst
        ? parseFloat(item.gst_percentage) || 0
        : 0;
      const gstAmount = (afterDiscount * gstPercent) / 100;
      updated[index].gst_amount = gstAmount;
      updated[index].total = afterDiscount + gstAmount;

      return updated;
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const lineTotal = qty * unitPrice;
      subtotal += lineTotal;

      const discPercent = parseFloat(item.discount_percent) || 0;
      const discAmount = (lineTotal * discPercent) / 100;
      totalDiscount += discAmount;

      const afterDiscount = lineTotal - discAmount;
      const gstPercent = form.include_gst
        ? parseFloat(item.gst_percentage) || 0
        : 0;
      totalGst += (afterDiscount * gstPercent) / 100;
    });

    const taxableAmount = subtotal - totalDiscount;
    const grandTotal = taxableAmount + totalGst;

    return { subtotal, totalDiscount, taxableAmount, totalGst, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].service_name) {
      toast.error("Please add at least one item");
      return;
    }
    if (!form.client_name) {
      toast.error("Client name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items,
        subtotal: totals.subtotal,
        total_discount: totals.totalDiscount,
        taxable_amount: totals.taxableAmount,
        total_gst: totals.totalGst,
        grand_total: totals.grandTotal,
      };

      if (isEdit) {
        await quotationService.update(id, payload);
        toast.success("Quotation updated");
      } else {
        await quotationService.create(payload);
        toast.success("Quotation created");
      }
      navigate("/quotations");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save quotation");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

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
        title={isEdit ? "Edit Quotation" : "Create Quotation"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Quotations", href: "/quotations" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <button
            onClick={() => navigate("/quotations")}
            className="btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Client Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Client Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Client Name *</label>
                  <input
                    value={form.client_name}
                    onChange={(e) =>
                      handleFormChange("client_name", e.target.value)
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input
                    value={form.company_name}
                    onChange={(e) =>
                      handleFormChange("company_name", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      handleFormChange("address", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => handleFormChange("city", e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => handleFormChange("state", e.target.value)}
                    className="input"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quotation Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Quotation Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Quotation Date *</label>
                  <input
                    type="date"
                    value={form.quotation_date}
                    onChange={(e) =>
                      handleFormChange("quotation_date", e.target.value)
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Valid Until</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) =>
                      handleFormChange("valid_until", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.include_gst}
                      onChange={(e) =>
                        handleFormChange("include_gst", e.target.checked)
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-medium text-secondary-700">
                      Include GST
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold">Items / Services</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-outline btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              <div className="card-body space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary-50 rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <label className="label">Service</label>
                        <SearchableSelect
                          options={services.map((s) => ({
                            value: s.id,
                            label: `${s.service_name} - â‚¹${s.default_price}`,
                          }))}
                          value={item.service_id}
                          onChange={(val) =>
                            updateItem(index, "service_id", val)
                          }
                          placeholder="Select or type custom"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="label">Description</label>
                        <input
                          value={item.service_name}
                          onChange={(e) =>
                            updateItem(index, "service_name", e.target.value)
                          }
                          className="input"
                          placeholder="Service/Item name"
                        />
                      </div>
                      <div className="col-span-2 flex items-end">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="label">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Unit Price (â‚¹)</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, "unit_price", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Discount %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount_percent}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "discount_percent",
                              e.target.value,
                            )
                          }
                          className="input"
                        />
                      </div>
                      {form.include_gst && (
                        <div>
                          <label className="label">GST %</label>
                          <input
                            type="number"
                            value={item.gst_percentage}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "gst_percentage",
                                e.target.value,
                              )
                            }
                            className="input"
                          />
                        </div>
                      )}
                      <div className="col-span-2 flex items-end">
                        <div className="w-full text-right">
                          <label className="label">Line Total</label>
                          <p className="font-bold text-secondary-900 py-2">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Notes & Terms</h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">Notes (visible on quotation)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Special offers, additional info..."
                  />
                </div>
                <div>
                  <label className="label">Terms & Conditions</label>
                  <textarea
                    value={form.terms_conditions}
                    onChange={(e) =>
                      handleFormChange("terms_conditions", e.target.value)
                    }
                    className="input"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="card sticky top-6">
              <div className="card-header">
                <h3 className="font-semibold">Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(totals.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Taxable Amount</span>
                    <span className="font-medium">
                      {formatCurrency(totals.taxableAmount)}
                    </span>
                  </div>
                  {form.include_gst && (
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">GST</span>
                      <span className="font-medium">
                        {formatCurrency(totals.totalGst)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-secondary-200">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-lg text-primary-600">
                      {formatCurrency(totals.grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? "Update" : "Create"} Quotation
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/quotations")}
                    className="btn-outline w-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
