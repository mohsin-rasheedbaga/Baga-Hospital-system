/* ========== DATA STORE - Offline / LocalStorage ========== */
import type { Hospital, User, Patient, Visit, LabOrder, Prescription, DispenseRecord, Bill, XRayOrder, UltrasoundOrder } from './types';

const KEYS = {
  hospital: 'baga_hospital',
  users: 'baga_users',
  patients: 'baga_patients',
  visits: 'baga_visits',
  labOrders: 'baga_lab_orders',
  prescriptions: 'baga_prescriptions',
  dispenses: 'baga_dispenses',
  bills: 'baga_bills',
  xrayOrders: 'baga_xray_orders',
  ultrasoundOrders: 'baga_ultrasound_orders',
  patientCounter: 'baga_patient_counter',
};

/* ========== Generic Helpers ========== */
function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
}
function set<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

/* ========== HOSPITAL ========== */
const defaultHospital: Hospital = {
  name: 'BAGA Hospital',
  address: 'Main Road, City',
  phone: '0300-1234567',
  email: 'info@bagahospital.com',
  licenseNo: 'BAGA-LIC-0001',
};

export function getHospital(): Hospital { return get(KEYS.hospital, defaultHospital); }
export function setHospital(h: Hospital): void { set(KEYS.hospital, h); }

/* ========== USERS ========== */
const defaultUsers: User[] = [
  { id: 'u1', email: 'admin', password: 'admin', name: 'Hospital Admin', role: 'super_admin', department: 'Management', active: true, permissions: ['all'] },
  { id: 'u2', email: 'reception', password: 'reception', name: 'Reception Staff', role: 'reception', department: 'Reception', active: true, permissions: ['register_patient', 'new_visit', 'search_patient', 'card_renewal', 'print_card'] },
  { id: 'u3', email: 'doctor', password: 'doctor', name: 'Dr. Ahmed Hassan', role: 'doctor', department: 'Emergency', active: true, permissions: ['search_patient', 'order_lab', 'prescribe', 'order_xray', 'order_ultrasound', 'write_notes', 'discharge', 'view_reports'] },
  { id: 'u4', email: 'lab', password: 'lab', name: 'Lab Technician', role: 'lab', department: 'Laboratory', active: true, permissions: ['view_lab_orders', 'enter_results', 'print_report'] },
  { id: 'u5', email: 'pharmacy', password: 'pharmacy', name: 'Pharmacist', role: 'pharmacy', department: 'Pharmacy', active: true, permissions: ['view_prescriptions', 'dispense_medicine'] },
  { id: 'u6', email: 'xray', password: 'xray', name: 'Radiologist', role: 'xray', department: 'X-Ray', active: true, permissions: ['view_xray_orders', 'enter_report'] },
  { id: 'u7', email: 'ultrasound', password: 'ultrasound', name: 'USG Technician', role: 'ultrasound', department: 'Ultrasound', active: true, permissions: ['view_usg_orders', 'enter_report'] },
  { id: 'u8', email: 'accounts', password: 'accounts', name: 'Accountant', role: 'accounts', department: 'Accounts', active: true, permissions: ['view_bills', 'collect_payment', 'daily_report'] },
];

export function getUsers(): User[] { return get(KEYS.users, defaultUsers); }
export function setUsers(u: User[]): void { set(KEYS.users, u); }
export function addUser(u: User): void { const all = getUsers(); all.push(u); setUsers(all); }
export function updateUser(id: string, data: Partial<User>): void {
  setUsers(getUsers().map(u => u.id === id ? { ...u, ...data } : u));
}
export function deleteUser(id: string): void { setUsers(getUsers().filter(u => u.id !== id)); }

/* ========== PATIENTS ========== */
const defaultPatients: Patient[] = [
  { id: 'p1', patientNo: 'BAGA-0001', name: 'Muhammad Ali', fatherName: 'Abdul Rehman', mobile: '03001234567', age: '35', gender: 'Male', address: 'Street 5, Lahore', cardStatus: 'Active', cardExpiry: '2026-05-15', totalVisits: 5, lastVisit: '2025-05-10', regDate: '2025-01-15' },
  { id: 'p2', patientNo: 'BAGA-0002', name: 'Fatima Bibi', fatherName: 'Haji Rasool', mobile: '03119876543', age: '28', gender: 'Female', address: 'Block C, Karachi', cardStatus: 'Active', cardExpiry: '2026-02-20', totalVisits: 3, lastVisit: '2025-05-08', regDate: '2025-02-20' },
  { id: 'p3', patientNo: 'BAGA-0003', name: 'Ahmed Khan', fatherName: 'Ghulam Khan', mobile: '03234567890', age: '45', gender: 'Male', address: 'Mohalla Shah, Multan', cardStatus: 'Active', cardExpiry: '2026-04-15', totalVisits: 8, lastVisit: '2025-05-12', regDate: '2024-12-05' },
];

export function getPatients(): Patient[] { return get(KEYS.patients, defaultPatients); }
export function setPatients(p: Patient[]): void { set(KEYS.patients, p); }
export function addPatient(p: Patient): void { const all = getPatients(); all.push(p); setPatients(all); }
export function updatePatient(id: string, data: Partial<Patient>): void {
  setPatients(getPatients().map(p => p.id === id ? { ...p, ...data } : p));
}
export function getPatientById(id: string): Patient | undefined { return getPatients().find(p => p.id === id); }
export function getPatientByNo(no: string): Patient | undefined { return getPatients().find(p => p.patientNo === no); }
export function getPatientByMobile(mobile: string): Patient[] { return getPatients().filter(p => p.mobile.includes(mobile)); }
export function searchPatients(q: string): Patient[] {
  const lq = q.toLowerCase();
  return getPatients().filter(p =>
    p.patientNo.toLowerCase().includes(lq) ||
    p.mobile.includes(q) ||
    p.name.toLowerCase().includes(lq)
  );
}
export function getPatientCounter(): number { return get(KEYS.patientCounter, 4); }
export function setPatientCounter(n: number): void { set(KEYS.patientCounter, n); }

/* ========== VISITS ========== */
export function getVisits(): Visit[] { return get(KEYS.visits, []); }
export function setVisits(v: Visit[]): void { set(KEYS.visits, v); }
export function addVisit(v: Visit): void { const all = getVisits(); all.push(v); setVisits(all); }
export function updateVisit(id: string, data: Partial<Visit>): void {
  setVisits(getVisits().map(v => v.id === id ? { ...v, ...data } : v));
}
export function getVisitsByPatient(patientId: string): Visit[] { return getVisits().filter(v => v.patientId === patientId); }
export function getActiveVisitByPatient(patientId: string): Visit | undefined { return getVisits().find(v => v.patientId === patientId && v.status === 'Active'); }
export function getVisitsByDate(date: string): Visit[] { return getVisits().filter(v => v.date === date); }

/* ========== LAB ORDERS (Doctor creates, Lab sees) ========== */
export function getLabOrders(): LabOrder[] { return get(KEYS.labOrders, []); }
export function setLabOrders(o: LabOrder[]): void { set(KEYS.labOrders, o); }
export function addLabOrder(o: LabOrder): void { const all = getLabOrders(); all.push(o); setLabOrders(all); }
export function updateLabOrder(id: string, data: Partial<LabOrder>): void {
  setLabOrders(getLabOrders().map(o => o.id === id ? { ...o, ...data } : o));
}
export function getLabOrdersByPatient(patientId: string): LabOrder[] { return getLabOrders().filter(o => o.patientId === patientId); }
export function getPendingLabOrders(): LabOrder[] { return getLabOrders().filter(o => o.status !== 'Completed'); }

/* ========== PRESCRIPTIONS (Doctor creates, Pharmacy sees) ========== */
export function getPrescriptions(): Prescription[] { return get(KEYS.prescriptions, []); }
export function setPrescriptions(p: Prescription[]): void { set(KEYS.prescriptions, p); }
export function addPrescription(p: Prescription): void { const all = getPrescriptions(); all.push(p); setPrescriptions(all); }
export function addPrescriptionItem(p: Prescription): void { const all = getPrescriptions(); all.push(p); setPrescriptions(all); }
export function updatePrescription(id: string, data: Partial<Prescription>): void {
  setPrescriptions(getPrescriptions().map(p => p.id === id ? { ...p, ...data } : p));
}
export function getPrescriptionsByPatient(patientId: string): Prescription[] { return getPrescriptions().filter(p => p.patientId === patientId); }
export function getActivePrescriptions(): Prescription[] { return getPrescriptions().filter(p => p.status === 'Active'); }

/* ========== DISPENSE RECORDS (Pharmacy creates) ========== */
export function getDispenses(): DispenseRecord[] { return get(KEYS.dispenses, []); }
export function setDispenses(d: DispenseRecord[]): void { set(KEYS.dispenses, d); }
export function addDispense(d: DispenseRecord): void { const all = getDispenses(); all.push(d); setDispenses(all); }

/* ========== BILLS ========== */
export function getBills(): Bill[] { return get(KEYS.bills, []); }
export function setBills(b: Bill[]): void { set(KEYS.bills, b); }
export function addBill(b: Bill): void { const all = getBills(); all.push(b); setBills(all); }
export function updateBill(id: string, data: Partial<Bill>): void {
  setBills(getBills().map(b => b.id === id ? { ...b, ...data } : b));
}
export function getBillsByPatient(patientId: string): Bill[] { return getBills().filter(b => b.patientId === patientId); }

/* ========== X-RAY ORDERS ========== */
export function getXRayOrders(): XRayOrder[] { return get(KEYS.xrayOrders, []); }
export function setXRayOrders(o: XRayOrder[]): void { set(KEYS.xrayOrders, o); }
export function addXRayOrder(o: XRayOrder): void { const all = getXRayOrders(); all.push(o); setXRayOrders(all); }
export function updateXRayOrder(id: string, data: Partial<XRayOrder>): void {
  setXRayOrders(getXRayOrders().map(o => o.id === id ? { ...o, ...data } : o));
}
export function getPendingXRayOrders(): XRayOrder[] { return getXRayOrders().filter(o => o.status !== 'Completed'); }

/* ========== ULTRASOUND ORDERS ========== */
export function getUltrasoundOrders(): UltrasoundOrder[] { return get(KEYS.ultrasoundOrders, []); }
export function setUltrasoundOrders(o: UltrasoundOrder[]): void { set(KEYS.ultrasoundOrders, o); }
export function addUltrasoundOrder(o: UltrasoundOrder): void { const all = getUltrasoundOrders(); all.push(o); setUltrasoundOrders(all); }
export function updateUltrasoundOrder(id: string, data: Partial<UltrasoundOrder>): void {
  setUltrasoundOrders(getUltrasoundOrders().map(o => o.id === id ? { ...o, ...data } : o));
}
export function getPendingUltrasoundOrders(): UltrasoundOrder[] { return getUltrasoundOrders().filter(o => o.status !== 'Completed'); }

/* ========== UTILITY ========== */
export function todayStr(): string { return new Date().toISOString().split('T')[0]; }
export function timeStr(): string { return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
export function genId(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
