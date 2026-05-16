'use client';
import { useState } from 'react';

/* ========== DATA ========== */
interface Doctor {
  id: string; name: string; dept: string; fee: number; timing: string;
}

interface Patient {
  id: string;
  patientNo: string;
  name: string;
  fatherName: string;
  mobile: string;
  age: string;
  gender: string;
  address: string;
  department: string;
  doctor: string;
  cardStatus: string;
  cardExpiry: string;
  totalVisits: number;
  lastVisit: string;
  lastDept: string;
  lastDoctor: string;
  visitUsed: boolean;
  regDate: string;
}

interface VisitRecord {
  id: string;
  patientNo: string;
  patientName: string;
  department: string;
  doctor: string;
  doctorFee: number;
  date: string;
  time: string;
}

const DEPARTMENTS = [
  'Emergency', 'General Medicine', 'Cardiology', 'Orthopedic',
  'Gynecology', 'Pediatrician', 'ENT', 'Skin Specialist',
  'Eye Specialist', 'Dental', 'Physiotherapy', 'Surgery'
];

const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Ahmed Hassan', dept: 'Emergency', fee: 1500, timing: '9AM - 1PM' },
  { id: 'd2', name: 'Dr. Muhammad Ali', dept: 'Cardiology', fee: 2500, timing: '2PM - 6PM' },
  { id: 'd3', name: 'Dr. Sara Khan', dept: 'Gynecology', fee: 2000, timing: '10AM - 2PM' },
  { id: 'd4', name: 'Dr. Bilal Siddiqui', dept: 'Orthopedic', fee: 1800, timing: '4PM - 8PM' },
  { id: 'd5', name: 'Dr. Zainab Malik', dept: 'Pediatrician', fee: 1500, timing: '9AM - 1PM' },
  { id: 'd6', name: 'Dr. Usman Tariq', dept: 'ENT', fee: 2000, timing: '3PM - 7PM' },
  { id: 'd7', name: 'Dr. Imran Raza', dept: 'General Medicine', fee: 1200, timing: '9AM - 5PM' },
  { id: 'd8', name: 'Dr. Nadia Ashraf', dept: 'Skin Specialist', fee: 2000, timing: '11AM - 3PM' },
  { id: 'd9', name: 'Dr. Kamran Hyder', dept: 'Eye Specialist', fee: 2200, timing: '10AM - 4PM' },
  { id: 'd10', name: 'Dr. Farhan Ali', dept: 'Dental', fee: 1500, timing: '9AM - 2PM' },
  { id: 'd11', name: 'Dr. Saima Noor', dept: 'Physiotherapy', fee: 1000, timing: '8AM - 12PM' },
  { id: 'd12', name: 'Dr. Rizwan Ahmad', dept: 'Surgery', fee: 5000, timing: 'By Appointment' },
];

const initialPatients: Patient[] = [
  { id: 'p1', patientNo: 'BAGA-0001', name: 'Muhammad Ali', fatherName: 'Abdul Rehman', mobile: '03001234567', age: '35', gender: 'Male', address: 'Street 5, Lahore', department: 'Cardiology', doctor: 'Dr. Muhammad Ali', cardStatus: 'Active', cardExpiry: '2026-05-15', totalVisits: 5, lastVisit: '2025-05-10', lastDept: 'Cardiology', lastDoctor: 'Dr. Muhammad Ali', visitUsed: true, regDate: '2025-01-15' },
  { id: 'p2', patientNo: 'BAGA-0002', name: 'Fatima Bibi', fatherName: 'Haji Rasool', mobile: '03119876543', age: '28', gender: 'Female', address: 'Block C, Karachi', department: 'Gynecology', doctor: 'Dr. Sara Khan', cardStatus: 'Active', cardExpiry: '2026-02-20', totalVisits: 3, lastVisit: '2025-05-08', lastDept: 'Gynecology', lastDoctor: 'Dr. Sara Khan', visitUsed: false, regDate: '2025-02-20' },
  { id: 'p3', patientNo: 'BAGA-0003', name: 'Ahmed Khan', fatherName: 'Ghulam Khan', mobile: '03234567890', age: '45', gender: 'Male', address: 'Mohalla Shah, Multan', department: 'Orthopedic', doctor: 'Dr. Bilal Siddiqui', cardStatus: 'Expired', cardExpiry: '2025-04-15', totalVisits: 8, lastVisit: '2025-04-10', lastDept: 'Orthopedic', lastDoctor: 'Dr. Bilal Siddiqui', visitUsed: true, regDate: '2024-12-05' },
];

let patientCounter = 4;

/* ========== COMPONENT ========== */
export default function ReceptionPage() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [printContent, setPrintContent] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searched, setSearched] = useState(false);

  // Registration form
  const [form, setForm] = useState({
    name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: '',
    department: '', doctor: ''
  });

  // New visit modal
  const [visitPatient, setVisitPatient] = useState<Patient | null>(null);
  const [visitDept, setVisitDept] = useState('');
  const [visitDoctor, setVisitDoctor] = useState('');

  // Edit modal
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // View patient details
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDoctors = (dept: string) => DOCTORS.filter(d => d.dept === dept);
  const selectedDoctorData = (docName: string) => DOCTORS.find(d => d.name === docName);

  // ========= SEARCH =========
  const handleSearch = () => {
    if (!searchQuery.trim()) { showToast('Enter mobile number or card number', 'error'); return; }
    const q = searchQuery.trim().toLowerCase();
    const results = patients.filter(p =>
      p.mobile.includes(q) || p.patientNo.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setSearched(true);
  };

  // ========= REGISTER =========
  const handleRegister = () => {
    if (!form.name.trim() || !form.fatherName.trim() || !form.mobile.trim() || !form.age.trim() || !form.address.trim()) {
      showToast('All 5 fields are compulsory (Name, Father Name, Mobile, Age, Address)', 'error'); return;
    }
    if (!form.department) { showToast('Please select Department', 'error'); return; }
    if (!form.doctor) { showToast('Please select Doctor', 'error'); return; }

    const patientNo = `BAGA-${String(patientCounter).padStart(4, '0')}`;
    patientCounter++;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const doc = selectedDoctorData(form.doctor);

    const newPatient: Patient = {
      id: 'p' + Date.now(),
      patientNo, name: form.name.trim(), fatherName: form.fatherName.trim(),
      mobile: form.mobile.trim(), age: form.age.trim(), gender: form.gender,
      address: form.address.trim(), department: form.department, doctor: form.doctor,
      cardStatus: 'Active', cardExpiry: expiry.toISOString().split('T')[0],
      totalVisits: 0, lastVisit: today, lastDept: form.department, lastDoctor: form.doctor,
      visitUsed: false, regDate: today
    };
    setPatients([...patients, newPatient]);

    // Create visit
    const newVisit: VisitRecord = {
      id: 'v' + Date.now(), patientNo: newPatient.patientNo, patientName: newPatient.name,
      department: form.department, doctor: form.doctor, doctorFee: doc?.fee || 0,
      date: today, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setVisits([...visits, newVisit]);

    setForm({ name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: '', department: '', doctor: '' });

    // Show print card
    handlePrintCard(newPatient, form.department, form.doctor);
    showToast(`Patient registered: ${patientNo}`, 'success');
  };

  // ========= NEW VISIT =========
  const handleNewVisit = () => {
    if (!visitPatient) return;
    if (!visitDept) { showToast('Please select Department', 'error'); return; }
    if (!visitDoctor) { showToast('Please select Doctor', 'error'); return; }

    const today = new Date().toISOString().split('T')[0];
    const doc = selectedDoctorData(visitDoctor);

    const newVisit: VisitRecord = {
      id: 'v' + Date.now(), patientNo: visitPatient.patientNo, patientName: visitPatient.name,
      department: visitDept, doctor: visitDoctor, doctorFee: doc?.fee || 0,
      date: today, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setPatients(patients.map(p => {
      if (p.id === visitPatient.id) {
        return {
          ...p, totalVisits: p.totalVisits + 1, lastVisit: today,
          lastDept: visitDept, lastDoctor: visitDoctor, visitUsed: true,
          department: visitDept, doctor: visitDoctor
        };
      }
      return p;
    }));
    setVisits([...visits, newVisit]);

    // Show print
    handlePrintCard(
      { ...visitPatient, department: visitDept, doctor: visitDoctor },
      visitDept, visitDoctor
    );

    setVisitPatient(null);
    setVisitDept('');
    setVisitDoctor('');
    showToast('New visit created successfully!', 'success');
  };

  // ========= CARD RENEWAL =========
  const handleRenewal = (patientId: string) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        return { ...p, cardStatus: 'Active', cardExpiry: expiry.toISOString().split('T')[0], visitUsed: false };
      }
      return p;
    }));
    setViewPatient(null);
    showToast('Card renewed! Patient can now create new visit.', 'success');
  };

  // ========= PRINT CARD =========
  const handlePrintCard = (patient: Patient, dept: string, doc: string) => {
    const docData = selectedDoctorData(doc);
    const cardHtml = `
      <html><head><title>Patient Card - ${patient.patientNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .card { border: 3px solid #2563eb; border-radius: 12px; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 12px; }
        .header h1 { color: #2563eb; font-size: 22px; }
        .header p { color: #64748b; font-size: 12px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .row .label { color: #64748b; font-weight: 600; }
        .row .value { color: #1e293b; font-weight: 500; }
        .highlight { background: #dbeafe; padding: 8px 12px; border-radius: 6px; margin-top: 10px; text-align: center; }
        .highlight p { font-size: 13px; color: #1d4ed8; font-weight: 600; }
        .footer { text-align: center; margin-top: 10px; font-size: 10px; color: #94a3b8; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>
        <div class="card">
          <div class="header">
            <h1>BAGA Hospital</h1>
            <p>Hospital Management System - Patient Card</p>
          </div>
          <div class="row"><span class="label">Patient No:</span><span class="value">${patient.patientNo}</span></div>
          <div class="row"><span class="label">Name:</span><span class="value">${patient.name}</span></div>
          <div class="row"><span class="label">Father/Husband:</span><span class="value">${patient.fatherName}</span></div>
          <div class="row"><span class="label">Mobile:</span><span class="value">${patient.mobile}</span></div>
          <div class="row"><span class="label">Age/Gender:</span><span class="value">${patient.age} / ${patient.gender}</span></div>
          <div class="row"><span class="label">Address:</span><span class="value">${patient.address}</span></div>
          <div class="row"><span class="label">Card Expiry:</span><span class="value">${patient.cardExpiry}</span></div>
          <div class="highlight">
            <p>Department: ${dept}</p>
            <p>Doctor: ${doc}</p>
            ${docData ? `<p>Fee: Rs. ${docData.fee.toLocaleString()}</p>` : ''}
          </div>
          <div class="footer">Registered: ${patient.regDate} | This visit allows consultation with one doctor only</div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;
    setPrintContent(cardHtml);
  };

  // ========= EDIT PATIENT =========
  const handleEditSave = () => {
    if (!editingPatient) return;
    setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
    setEditingPatient(null);
    showToast('Patient updated!', 'success');
  };

  const todayVisits = visits.filter(v => v.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>}

      {/* Print Card Window */}
      {printContent && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Patient Card</h3>
              <button onClick={() => setPrintContent(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <iframe srcDoc={printContent} style={{ width: '100%', height: '500px', border: 'none' }} title="Patient Card" />
          </div>
        </div>
      )}

      {/* ===== SEARCH BAR - TOP ===== */}
      <div className="bg-white rounded-xl border-2 border-blue-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Search Patient</h2>
        <div className="flex gap-3">
          <input
            className="form-input flex-1 text-lg"
            placeholder="Enter mobile number or card number (BAGA-0001)..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearched(false); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn btn-primary btn-lg">Search</button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Search by mobile number, card number (BAGA-XXXX), or patient name</p>

        {/* Search Results */}
        {searched && searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold text-slate-600">{searchResults.length} patient(s) found</p>
            {searchResults.map(p => (
              <div key={p.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-blue-600 text-lg">{p.patientNo}</span>
                      <span className={`badge ${p.cardStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{p.cardStatus}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{p.name} <span className="text-slate-500 font-normal">({p.gender}, {p.age})</span></p>
                    <p className="text-sm text-slate-500">Father/Husband: {p.fatherName} | Mobile: {p.mobile}</p>
                    <p className="text-sm text-slate-500">Address: {p.address}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Total Visits: <strong className="text-slate-700">{p.totalVisits}</strong></span>
                      <span>Last Visit: <strong className="text-slate-700">{p.lastVisit}</strong></span>
                      <span>Last Dept: <strong className="text-slate-700">{p.lastDept}</strong></span>
                      <span>Last Doctor: <strong className="text-slate-700">{p.lastDoctor}</strong></span>
                    </div>
                    {p.visitUsed && p.cardStatus === 'Active' && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
                        This visit is already used. Card renewal required for new visit.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {!p.visitUsed && p.cardStatus === 'Active' && (
                      <button onClick={() => { setVisitPatient(p); setVisitDept(''); setVisitDoctor(''); }} className="btn btn-success btn-sm whitespace-nowrap">New Visit</button>
                    )}
                    {p.cardStatus === 'Expired' && (
                      <button onClick={() => handleRenewal(p.id)} className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Renew Card</button>
                    )}
                    {p.visitUsed && p.cardStatus === 'Active' && (
                      <button onClick={() => handleRenewal(p.id)} className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Renew Card</button>
                    )}
                    <button onClick={() => handlePrintCard(p, p.lastDept || p.department, p.lastDoctor || p.doctor)} className="btn btn-outline btn-sm whitespace-nowrap">Print Card</button>
                    <button onClick={() => setViewPatient(p)} className="btn btn-outline btn-sm whitespace-nowrap">View Details</button>
                    <button onClick={() => setEditingPatient({ ...p })} className="btn btn-outline btn-sm whitespace-nowrap">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {searched && searchResults.length === 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            No patient found. Please register as new patient below.
          </div>
        )}
      </div>

      {/* ===== NEW PATIENT REGISTRATION ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-slate-800">New Patient Registration</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
            <span className="text-sm text-blue-700 font-semibold">Next No: BAGA-{String(patientCounter).padStart(4, '0')}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-5">Fields with * are compulsory. After registration, card will be printed automatically.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Patient Name *</label>
            <input className="form-input" placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Father / Husband Name *</label>
            <input className="form-input" placeholder="Father or husband name" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Mobile Number *</label>
            <input className="form-input" placeholder="03001234567" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Age *</label>
            <input className="form-input" placeholder="Age in years" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Gender</label>
            <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label className="form-label">Address *</label>
            <input className="form-input" placeholder="Full address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>

          {/* Department & Doctor Selection */}
          <div>
            <label className="form-label">Department *</label>
            <select className="form-input" value={form.department} onChange={e => { setForm({...form, department: e.target.value, doctor: ''}); }}>
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Doctor *</label>
            <select className="form-input" value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} disabled={!form.department}>
              <option value="">-- Select Doctor --</option>
              {form.department && filteredDoctors(form.department).map(d => (
                <option key={d.id} value={d.name}>{d.name} (Rs. {d.fee.toLocaleString()})</option>
              ))}
            </select>
          </div>
          {form.doctor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm text-blue-700">Doctor Fee: <strong>Rs. {selectedDoctorData(form.doctor)?.fee.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleRegister} className="btn btn-success btn-lg">Register Patient & Print Card</button>
          <button onClick={() => setForm({ name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: '', department: '', doctor: '' })} className="btn btn-outline btn-lg">Clear</button>
        </div>
      </div>

      {/* ===== TODAY'S VISITS ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Today&apos;s Visits ({todayVisits.length})</h2>
        <p className="text-sm text-slate-500 mb-4">All visits created today</p>
        {todayVisits.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-2">📋</p>
            <p>No visits created today yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Patient No</th><th>Name</th><th>Department</th><th>Doctor</th><th>Fee</th><th>Time</th></tr>
              </thead>
              <tbody>
                {todayVisits.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono font-bold text-blue-600">{v.patientNo}</td>
                    <td className="font-medium">{v.patientName}</td>
                    <td><span className="badge badge-purple">{v.department}</span></td>
                    <td>{v.doctor}</td>
                    <td className="font-semibold">Rs. {v.doctorFee.toLocaleString()}</td>
                    <td>{v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ALL PATIENTS TABLE ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-1">All Registered Patients ({patients.length})</h2>
        <p className="text-sm text-slate-500 mb-4">Complete patient records</p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient No</th><th>Name</th><th>Father Name</th><th>Mobile</th><th>Age/Gender</th>
                <th>Department</th><th>Doctor</th><th>Visits</th><th>Card</th><th>Visit Used</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td className="font-mono font-bold text-blue-600">{p.patientNo}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.fatherName}</td>
                  <td className="font-mono text-sm">{p.mobile}</td>
                  <td>{p.age}/{p.gender}</td>
                  <td><span className="badge badge-purple">{p.department}</span></td>
                  <td className="text-sm">{p.doctor}</td>
                  <td className="text-center">{p.totalVisits}</td>
                  <td><span className={`badge ${p.cardStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{p.cardStatus}</span></td>
                  <td>
                    {p.visitUsed ? (
                      <span className="badge badge-amber">Used</span>
                    ) : (
                      <span className="badge badge-green">Available</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {!p.visitUsed && p.cardStatus === 'Active' && (
                        <button onClick={() => { setVisitPatient(p); setVisitDept(''); setVisitDoctor(''); }} className="btn btn-success btn-sm">Visit</button>
                      )}
                      <button onClick={() => handlePrintCard(p, p.lastDept || p.department, p.lastDoctor || p.doctor)} className="btn btn-outline btn-sm">Print</button>
                      <button onClick={() => setEditingPatient({ ...p })} className="btn btn-outline btn-sm">Edit</button>
                      {(p.cardStatus === 'Expired' || p.visitUsed) && (
                        <button onClick={() => handleRenewal(p.id)} className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Renew</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== NEW VISIT MODAL ===== */}
      {visitPatient && (
        <div className="modal-overlay" onClick={() => setVisitPatient(null)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">New Visit</h3>
                <p className="text-sm text-blue-600 font-mono">{visitPatient.patientNo} - {visitPatient.name}</p>
              </div>
              <button onClick={() => setVisitPatient(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm space-y-1">
              <p><span className="text-slate-500">Father/Husband:</span> <strong>{visitPatient.fatherName}</strong></p>
              <p><span className="text-slate-500">Mobile:</span> <strong>{visitPatient.mobile}</strong></p>
              <p><span className="text-slate-500">Total Previous Visits:</span> <strong>{visitPatient.totalVisits}</strong></p>
              <p><span className="text-slate-500">Last Visit:</span> <strong>{visitPatient.lastVisit} ({visitPatient.lastDept} - {visitPatient.lastDoctor})</strong></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Select Department *</label>
                <select className="form-input" value={visitDept} onChange={e => { setVisitDept(e.target.value); setVisitDoctor(''); }}>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Select Doctor *</label>
                <select className="form-input" value={visitDoctor} onChange={e => setVisitDoctor(e.target.value)} disabled={!visitDept}>
                  <option value="">-- Select Doctor --</option>
                  {visitDept && filteredDoctors(visitDept).map(d => (
                    <option key={d.id} value={d.name}>{d.name} - Rs. {d.fee.toLocaleString()} ({d.timing})</option>
                  ))}
                </select>
              </div>
              {visitDoctor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-blue-700">Doctor Fee:</span>
                  <span className="font-bold text-blue-700 text-lg">Rs. {selectedDoctorData(visitDoctor)?.fee.toLocaleString()}</span>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                <strong>Note:</strong> After creating this visit, the patient will need to renew their card before visiting any other doctor.
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleNewVisit} className="btn btn-success btn-lg flex-1">Create Visit & Print Card</button>
              <button onClick={() => setVisitPatient(null)} className="btn btn-outline btn-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT PATIENT MODAL ===== */}
      {editingPatient && (
        <div className="modal-overlay" onClick={() => setEditingPatient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Patient - {editingPatient.patientNo}</h3>
              <button onClick={() => setEditingPatient(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Patient Name *</label>
                <input className="form-input" value={editingPatient.name} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Father / Husband Name *</label>
                <input className="form-input" value={editingPatient.fatherName} onChange={e => setEditingPatient({...editingPatient, fatherName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Mobile *</label>
                  <input className="form-input" value={editingPatient.mobile} onChange={e => setEditingPatient({...editingPatient, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Age *</label>
                  <input className="form-input" value={editingPatient.age} onChange={e => setEditingPatient({...editingPatient, age: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select className="form-input" value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className="form-label">Address *</label>
                <input className="form-input" value={editingPatient.address} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditSave} className="btn btn-primary btn-lg">Save Changes</button>
                <button onClick={() => setEditingPatient(null)} className="btn btn-outline btn-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW PATIENT DETAILS MODAL ===== */}
      {viewPatient && (
        <div className="modal-overlay" onClick={() => setViewPatient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Patient Details</h3>
                <p className="text-sm text-blue-600 font-mono">{viewPatient.patientNo}</p>
              </div>
              <button onClick={() => setViewPatient(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-semibold text-slate-800">{viewPatient.name}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Father/Husband</p>
                  <p className="font-semibold text-slate-800">{viewPatient.fatherName}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="font-semibold text-slate-800 font-mono">{viewPatient.mobile}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Age / Gender</p>
                  <p className="font-semibold text-slate-800">{viewPatient.age} / {viewPatient.gender}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="font-semibold text-slate-800">{viewPatient.address}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Card Status</p>
                  <p><span className={`badge ${viewPatient.cardStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{viewPatient.cardStatus}</span></p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Card Expiry</p>
                  <p className="font-semibold text-slate-800">{viewPatient.cardExpiry}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Total Visits</p>
                  <p className="font-semibold text-slate-800">{viewPatient.totalVisits}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Visit Available</p>
                  <p><span className={`badge ${viewPatient.visitUsed ? 'badge-amber' : 'badge-green'}`}>{viewPatient.visitUsed ? 'Used' : 'Available'}</span></p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-blue-500">Last Visit</p>
                  <p className="font-semibold text-blue-800">{viewPatient.lastVisit} - {viewPatient.lastDept} - {viewPatient.lastDoctor}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handlePrintCard(viewPatient, viewPatient.lastDept, viewPatient.lastDoctor)} className="btn btn-primary">Print Card</button>
                {(viewPatient.cardStatus === 'Expired' || viewPatient.visitUsed) && (
                  <button onClick={() => handleRenewal(viewPatient.id)} className="btn btn-sm" style={{ background: '#d97706', color: 'white' }}>Renew Card</button>
                )}
                <button onClick={() => setViewPatient(null)} className="btn btn-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
