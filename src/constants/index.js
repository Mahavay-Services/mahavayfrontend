export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SALES: "sales",
  ACCOUNTS: "accounts",
  LEGAL: "legal",
  OPS_MANAGER: "ops_manager",
  OPS_MEMBER: "ops_member",
  RM: "rm",
};

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  sales: "Sales",
  accounts: "Accounts",
  legal: "Legal",
  ops_manager: "Operations Manager",
  ops_member: "Operations Member",
  rm: "Relationship Manager",
};

export const BOOKING_STAGES = {
  SALES_CREATED: "sales_created",
  ACCOUNTS_VERIFICATION_PENDING: "accounts_verification_pending",
  ACCOUNTS_VERIFIED: "accounts_verified",
  LEGAL_PENDING: "legal_pending",
  LEGAL_VERIFIED: "legal_verified",
  OPERATIONS_STARTED: "operations_started",
  PARTIALLY_COMPLETED: "partially_completed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
};

export const STAGE_LABELS = {
  sales_created: "Sales Created",
  accounts_verification_pending: "Accounts Verification Pending",
  accounts_verified: "Accounts Verified",
  legal_pending: "Legal Pending",
  legal_verified: "Legal Verified",
  operations_started: "Operations Started",
  partially_completed: "Partially Completed",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On Hold",
};

export const STAGE_COLORS = {
  sales_created: "badge-primary",
  accounts_verification_pending: "badge-warning",
  accounts_verified: "badge-success",
  legal_pending: "badge-warning",
  legal_verified: "badge-success",
  operations_started: "badge-primary",
  partially_completed: "badge-warning",
  completed: "badge-success",
  cancelled: "badge-danger",
  on_hold: "badge-secondary",
};

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Call",
  "Social Media",
  "Advertisement",
  "WhatsApp",
  "Walk-in",
  "Other",
];

export const PAYMENT_TERMS = {
  ADVANCE: "advance",
  AGREEMENT: "agreement",
};

export const PAYMENT_MODES = {
  RAZORPAY: "razorpay",
  UPI: "upi",
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
};

export const PAYMENT_MODE_LABELS = {
  razorpay: "Razorpay",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
};

export const AGREEMENT_TYPES = {
  REFUNDABLE: "refundable",
  NON_REFUNDABLE: "non_refundable",
};

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export const VERIFICATION_STATUS_LABELS = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export const OPERATION_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  WAITING_CLIENT: "waiting_client",
  COMPLETED: "completed",
  REJECTED: "rejected",
  ON_HOLD: "on_hold",
};

export const OPERATION_STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  waiting_client: "Waiting for Client",
  completed: "Completed",
  rejected: "Rejected",
  on_hold: "On Hold",
};

export const OPERATION_STATUS_COLORS = {
  pending: "badge-secondary",
  in_progress: "badge-primary",
  waiting_client: "badge-warning",
  completed: "badge-success",
  rejected: "badge-danger",
  on_hold: "badge-secondary",
};

export const DOCUMENT_TYPES = [
  { value: "agreement", label: "Agreement" },
  { value: "nda", label: "NDA" },
  { value: "invoice", label: "Invoice" },
  { value: "pan_copy", label: "PAN Copy" },
  { value: "gst_copy", label: "GST Copy" },
  { value: "payment_receipt", label: "Payment Receipt" },
  { value: "service_document", label: "Service Document" },
  { value: "other", label: "Other" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const STATE_CODES = {
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  Assam: "18",
  Bihar: "10",
  Chhattisgarh: "22",
  Goa: "30",
  Gujarat: "24",
  Haryana: "06",
  "Himachal Pradesh": "02",
  Jharkhand: "20",
  Karnataka: "29",
  Kerala: "32",
  "Madhya Pradesh": "23",
  Maharashtra: "27",
  Manipur: "14",
  Meghalaya: "17",
  Mizoram: "15",
  Nagaland: "13",
  Odisha: "21",
  Punjab: "03",
  Rajasthan: "08",
  Sikkim: "11",
  "Tamil Nadu": "33",
  Telangana: "36",
  Tripura: "16",
  "Uttar Pradesh": "09",
  Uttarakhand: "05",
  "West Bengal": "19",
  "Andaman and Nicobar Islands": "35",
  Chandigarh: "04",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  Delhi: "07",
  "Jammu and Kashmir": "01",
  Ladakh: "38",
  Lakshadweep: "31",
  Puducherry: "34",
};
