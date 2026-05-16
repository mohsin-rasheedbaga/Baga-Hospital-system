/* ========== TYPES ========== */

export interface Hospital {
  name: string;
  address: string;
  phone: string;
  email: string;
  licenseNo: string;
}

export interface HospitalSettings {
  receptionCanCollectPharmacy: boolean;
  receptionCanCollectLab: boolean;
  receptionCanCollectXray: boolean;
  receptionCanCollectUltrasound: boolean;
  currency: string;
  receiptFooter: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'reception' | 'doctor' | 'lab' | 'pharmacy' | 'xray' | 'ultrasound' | 'accounts';
  department: string;
  active: boolean;
  permissions: string[];
}

export interface Patient {
  id: string;
  patientNo: string;
  name: string;
  fatherName: string;
  mobile: string;
  age: string;
  gender: string;
  address: string;
  cardStatus: 'Active' | 'Expired';
  cardExpiry: string;
  totalVisits: number;
  lastVisit: string;
  regDate: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  department: string;
  doctor: string;
  doctorFee: number;
  tokenNo: number;
  date: string;
  time: string;
  status: 'Active' | 'Completed' | 'Discharged';
  diagnosis: string;
  notes: string;
  vitals: { bp: string; pulse: string; temp: string; weight: string; };
}

export interface LabOrder {
  id: string;
  visitId: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  tests: LabTest[];
  orderedBy: string;
  date: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  results: LabResult[];
}

export interface LabTest {
  testName: string;
  price: number;
  selected: boolean;
}

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'Normal' | 'Low' | 'High';
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  medicines: PrescriptionMedicine[];
  prescribedBy: string;
  date: string;
  time: string;
  status: 'Active' | 'Dispensed';
  notes: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
  frequency: string;
  instructions: string;
  price: number;
  selected: boolean;
}

export interface DispenseRecord {
  id: string;
  prescriptionId: string;
  patientNo: string;
  patientName: string;
  medicines: string[];
  dispensedBy: string;
  date: string;
  time: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  visitId: string;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod: 'Cash' | 'Card' | 'Pending';
  date: string;
  time: string;
  receivedBy: string;
}

export interface BillItem {
  description: string;
  amount: number;
  type: 'Consultation' | 'Lab' | 'X-Ray' | 'Ultrasound' | 'Pharmacy' | 'Card' | 'Renewal' | 'Admission';
  selected: boolean;
  quantity: number;
}

export interface XRayOrder {
  id: string;
  visitId: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  xrayType: string;
  price: number;
  selected: boolean;
  orderedBy: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  report?: string;
}

export interface UltrasoundOrder {
  id: string;
  visitId: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  usgType: string;
  price: number;
  selected: boolean;
  orderedBy: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  report?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  department: string;
  doctor: string;
  admissionDate: string;
  purpose: string;
  roomNo: string;
  status: 'Approved' | 'Admitted' | 'Discharged';
  notes: string;
  createdAt: string;
  approvedBy: string;
}
