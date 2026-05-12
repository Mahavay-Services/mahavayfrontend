import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
  bookingService,
  serviceService,
  userService,
} from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Save, ArrowLeft, Plus, Trash2, Upload, X, Image } from "lucide-react";
import SearchableSelect from "../../components/ui/SearchableSelect";
import {
  LEAD_SOURCES,
  PAYMENT_MODES,
  PAYMENT_TERMS,
  AGREEMENT_TYPES,
  INDIAN_STATES,
} from "../../constants";
import toast from "react-hot-toast";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [bdmUsers, setBdmUsers] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bdm_id: "",
      bdm2_id: "",
      services: [{ service_id: "", custom_price: "", gst_percentage: 18 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });
  const watchedServices = watch("services");

  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;
    watchedServices?.forEach((s) => {
      const service = services.find((svc) => svc.id === parseInt(s.service_id));
      const price = parseFloat(s.custom_price) || service?.default_price || 0;
      const gstPercent = parseFloat(s.gst_percentage) || 18;
      subtotal += price;
      gstTotal += (price * gstPercent) / 100;
    });
    return { subtotal, gstTotal, total: subtotal + gstTotal };
  };

  const totals = calculateTotals();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [servicesRes, bdmRes] = await Promise.all([
        serviceService.getActive(),
        userService.getBDMList(),
      ]);
      setServices(servicesRes.data.data);
      setBdmUsers(bdmRes.data.data);

      if (isEdit) {
        const bookingRes = await bookingService.getById(id);
        const booking = bookingRes.data.data;
        reset({
          ...booking,
          services:
            booking.bookingServices?.map((bs) => ({
              service_id: bs.service_id,
              custom_price: bs.custom_price,
              gst_percentage: bs.gst_percentage,
            })) || [],
        });
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} - Invalid file type`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} - File too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setScreenshots((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeScreenshot = (index) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (!data.bdm_id) {
      toast.error("Please select BDM 1");
      return;
    }
    if (!data.services || data.services.length === 0) {
      toast.error("Please add at least one service");
      return;
    }

    const receivedAmount = parseFloat(data.received_amount) || 0;
    if (receivedAmount > 0 && screenshots.length === 0) {
      toast.error("Please upload payment screenshot for the received amount");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await bookingService.update(id, data);
        await bookingService.updateServices(id, { services: data.services });
        toast.success("Booking updated successfully");
      } else {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (key === "services") {
            formData.append("services", JSON.stringify(data.services));
          } else if (data[key] !== undefined && data[key] !== "") {
            formData.append(key, data[key]);
          }
        });
        screenshots.forEach((file) => formData.append("screenshots", file));

        await bookingService.createWithScreenshots(formData);
        toast.success("Booking created successfully");
      }
      navigate("/bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleServiceChange = (index, serviceId) => {
    const service = services.find((s) => s.id === parseInt(serviceId));
    if (service) {
      setValue(`services.${index}.custom_price`, service.default_price);
      setValue(`services.${index}.gst_percentage`, service.gst_percentage);
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
        title={isEdit ? "Edit Booking" : "Create New Booking"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bookings", href: "/bookings" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <button onClick={() => navigate("/bookings")} className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Client Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Client Name *</label>
                  <input
                    {...register("client_name", { required: true })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input {...register("company_name")} className="input" />
                </div>
                <div>
                  <label className="label">Mobile *</label>
                  <input
                    {...register("mobile", { required: true })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">PAN Number</label>
                  <input
                    {...register("pan_number")}
                    className="input"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="label">GST Number</label>
                  <input {...register("gst_number")} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    {...register("address")}
                    className="input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input {...register("city")} className="input" />
                </div>
                <div>
                  <label className="label">State</label>
                  <select {...register("state")} className="input">
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

            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Sales Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">BDM 1 *</label>
                  <SearchableSelect
                    options={bdmUsers.map((u) => ({
                      value: u.id,
                      label: u.full_name,
                    }))}
                    value={watch("bdm_id") || ""}
                    onChange={(val) =>
                      setValue("bdm_id", val, { shouldValidate: true })
                    }
                    placeholder="Select BDM"
                  />
                  {errors.bdm_id && (
                    <p className="text-xs text-red-500 mt-1">BDM is required</p>
                  )}
                </div>
                <div>
                  <label className="label">BDM 2 (Optional)</label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...bdmUsers.map((u) => ({
                        value: u.id,
                        label: u.full_name,
                      })),
                    ]}
                    value={watch("bdm2_id") || ""}
                    onChange={(val) => setValue("bdm2_id", val)}
                    placeholder="None"
                  />
                </div>
                <div>
                  <label className="label">Lead Source</label>
                  <select {...register("lead_source")} className="input">
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Booking Date</label>
                  <input
                    type="date"
                    {...register("booking_date")}
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold">Services</h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      service_id: "",
                      custom_price: "",
                      gst_percentage: 18,
                    })
                  }
                  className="btn-outline btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Service
                </button>
              </div>
              <div className="card-body space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <label className="label">Service *</label>
                      <SearchableSelect
                        options={services.map((s) => ({
                          value: s.id,
                          label: `${s.service_name} - ₹${s.default_price}`,
                        }))}
                        value={watch(`services.${index}.service_id`) || ""}
                        onChange={(val) => {
                          setValue(`services.${index}.service_id`, val);
                          handleServiceChange(index, val);
                        }}
                        placeholder="Select Service"
                      />
                    </div>
                    <div className="w-32">
                      <label className="label">Price</label>
                      <input
                        type="number"
                        {...register(`services.${index}.custom_price`)}
                        className="input"
                      />
                    </div>
                    <div className="w-24">
                      <label className="label">GST %</label>
                      <input
                        type="number"
                        {...register(`services.${index}.gst_percentage`)}
                        className="input"
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Payment Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Payment Terms</label>
                  <select {...register("payment_terms")} className="input">
                    <option value={PAYMENT_TERMS.ADVANCE}>Advance</option>
                    <option value={PAYMENT_TERMS.AGREEMENT}>Agreement</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Mode</label>
                  <select {...register("payment_mode")} className="input">
                    <option value="">Select Mode</option>
                    <option value={PAYMENT_MODES.RAZORPAY}>Razorpay</option>
                    <option value={PAYMENT_MODES.UPI}>UPI</option>
                    <option value={PAYMENT_MODES.BANK_TRANSFER}>
                      Bank Transfer
                    </option>
                    <option value={PAYMENT_MODES.CASH}>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="label">Agreement Type</label>
                  <select {...register("agreement_type")} className="input">
                    <option value="">Select Type</option>
                    <option value={AGREEMENT_TYPES.REFUNDABLE}>
                      Refundable
                    </option>
                    <option value={AGREEMENT_TYPES.NON_REFUNDABLE}>
                      Non-Refundable
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">Received Amount</label>
                  <input
                    type="number"
                    {...register("received_amount")}
                    className="input"
                    placeholder="0"
                  />
                </div>
                {!isEdit && (
                  <div className="md:col-span-3">
                    <label className="label">Payment Screenshots</label>
                    <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-secondary-400 mb-2" />
                        <span className="text-sm text-secondary-600">
                          Click to upload payment screenshots
                        </span>
                        <span className="text-xs text-secondary-400 mt-1">
                          JPG, PNG, PDF up to 5MB each
                        </span>
                      </label>
                    </div>
                    {screenshots.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {screenshots.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Image className="w-4 h-4 text-secondary-500" />
                              <span className="text-sm truncate max-w-[200px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-secondary-400">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card sticky top-6">
              <div className="card-header">
                <h3 className="font-semibold">Booking Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{totals.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">GST</span>
                    <span className="font-medium">
                      ₹{totals.gstTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-secondary-200">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-lg text-green-600">
                      ₹{totals.total.toLocaleString("en-IN")}
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
                        {isEdit ? "Update" : "Create"} Booking
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/bookings")}
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

export default BookingForm;
