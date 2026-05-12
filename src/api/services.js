import api from "./axios";

export const authService = {
  login: (data) => api.post("/auth/login", data),
  logout: (data) => api.post("/auth/logout", data),
  refreshToken: (data) => api.post("/auth/refresh-token", data),
  getProfile: () => api.get("/auth/profile"),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  getBDMList: () => api.get("/users/bdm-list"),
  getOpsList: () => api.get("/users/ops-list"),
  getStats: () => api.get("/users/stats"),
};

export const serviceService = {
  getAll: (params) => api.get("/services", { params }),
  getActive: () => api.get("/services/active"),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  toggleStatus: (id) => api.patch(`/services/${id}/toggle-status`),
  getCategories: () => api.get("/services/categories"),
};

export const bookingService = {
  getAll: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  createWithScreenshots: (formData) =>
    api.post("/bookings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  updateServices: (id, data) => api.put(`/bookings/${id}/services`, data),
  changeStage: (id, data) => api.post(`/bookings/${id}/stage`, data),
  addRemark: (id, data) => api.post(`/bookings/${id}/remarks`, data),
  getActivity: (id) => api.get(`/bookings/${id}/activity`),
  getStats: () => api.get("/bookings/stats"),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const paymentService = {
  getAll: (params) => api.get("/payments", { params }),
  getById: (id) => api.get(`/payments/${id}`),
  getPending: () => api.get("/payments/pending"),
  create: (data, screenshots = []) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    screenshots.forEach((file) => {
      formData.append("screenshots", file);
    });
    return api.post("/payments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  addRemainingPayment: (data, screenshots = []) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    screenshots.forEach((file) => {
      formData.append("screenshots", file);
    });
    return api.post("/payments/remaining", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  verify: (id, data) => api.post(`/payments/${id}/verify`, data),
  uploadScreenshots: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("screenshots", file);
    });
    return api.post(`/payments/${id}/screenshots`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getScreenshot: (screenshotId) =>
    api.get(`/payments/screenshot/${screenshotId}`, { responseType: "blob" }),
  deleteScreenshot: (screenshotId) =>
    api.delete(`/payments/screenshot/${screenshotId}`),
};

export const documentService = {
  getAll: (params) => api.get("/documents", { params }),
  getTypes: () => api.get("/documents/types"),
  upload: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/documents/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  download: (id) =>
    api.get(`/documents/${id}/download`, { responseType: "blob" }),
  delete: (id) => api.delete(`/documents/${id}`),
  getApprovalHistory: (bookingId) =>
    api.get(`/documents/${bookingId}/approvals`),
  getLegalStats: () => api.get("/documents/legal/stats"),
  getLegalBookings: (params) =>
    api.get("/documents/legal/bookings", { params }),
  getPendingLegal: () => api.get("/documents/pending-legal"),
  approveLegal: (bookingId, data) =>
    api.post(`/documents/${bookingId}/legal/approve`, data),
  rejectLegal: (bookingId, data) =>
    api.post(`/documents/${bookingId}/legal/reject`, data),
  sendBackForCorrections: (bookingId, data) =>
    api.post(`/documents/${bookingId}/legal/corrections`, data),
};

export const operationService = {
  getAll: (params) => api.get("/operations", { params }),
  getById: (id) => api.get(`/operations/${id}`),
  start: (bookingId) => api.post(`/operations/start/${bookingId}`),
  assign: (id, data) => api.post(`/operations/${id}/assign`, data),
  updateStatus: (id, data) => api.patch(`/operations/${id}/status`, data),
  getStats: () => api.get("/operations/stats"),
};

export const dashboardService = {
  getSuperAdmin: () => api.get("/dashboard/super-admin"),
  getSales: () => api.get("/dashboard/sales"),
  getAccounts: () => api.get("/dashboard/accounts"),
  getLegal: () => api.get("/dashboard/legal"),
  getOperations: () => api.get("/dashboard/operations"),
};

export const quotationService = {
  getAll: (params) => api.get("/quotations", { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post("/quotations", data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  updateStatus: (id, data) => api.patch(`/quotations/${id}/status`, data),
  delete: (id) => api.delete(`/quotations/${id}`),
  getServices: () => api.get("/quotations/services"),
};

export const invoiceService = {
  getAll: (params) => api.get("/invoices", { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  updateStatus: (id, data) => api.patch(`/invoices/${id}/status`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getServices: () => api.get("/invoices/services"),
};

export const reportService = {
  getDailyCollections: (params) =>
    api.get("/reports/collections/daily", { params }),
  getMonthlyCollections: (params) =>
    api.get("/reports/collections/monthly", { params }),
  getGSTReport: (params) => api.get("/reports/gst", { params }),
  getBDMRevenue: (params) => api.get("/reports/bdm-revenue", { params }),
  getSplitCommission: (params) =>
    api.get("/reports/split-commission", { params }),
  getPendingPayments: () => api.get("/reports/pending-payments"),
  getOperationsWorkload: () => api.get("/reports/operations-workload"),
  getBookingConversion: (params) =>
    api.get("/reports/booking-conversion", { params }),
  getQuotationReport: (params) =>
    api.get("/reports/quotation-report", { params }),
  getBDMScorecard: (params) => api.get("/reports/bdm-scorecard", { params }),
};

export const settingService = {
  getAll: () => api.get("/settings"),
  getPublic: () => api.get("/settings/public"),
  update: (data) => api.put("/settings", data),
};
