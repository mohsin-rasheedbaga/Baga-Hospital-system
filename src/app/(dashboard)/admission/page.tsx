'use client';
import { useState, useEffect } from 'react';
import {
  searchPatients, getPatientByNo, getPatients, addAdmission, getAdmissions,
  updateAdmission, getActiveAdmissions, genId, todayStr, timeStr,
} from '@/lib/store';
import type { Patient, Admission } from '@/lib/types';

/* ========== DOCTORS DATA ========== */
interface Doctor {
  id: string; name: string; dept: string; fee: number; timing: string;
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

const PURPOSES = ['Surgery', 'Checkup', 'Delivery', 'Emergency', 'Observation', 'Other'];

/* ========== MAIN COMPONENT ========== */
export default function AdmissionPage() {
  // Data from store
  const [activeAdmissions, setActiveAdmissions] = useState<Admission[]>([]);
  const [allAdmissions, setAllAdmissions] = useState<Admission[]>([]);

  // UI State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [printContent, setPrintContent] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Admission form
  const [form, setForm] = useState({
    department: '',
    doctor: '',
    date: todayStr(),
    purpose: '',
    room: '',
    notes: '',
  });

  // Load data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setActiveAdmissions(getActiveAdmissions());
    setAllAdmissions(getAdmissions());
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDoctors = (dept: string) => DOCTORS.filter(d => d.dept === dept);

  // ========= SEARCH PATIENT =========
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast('Enter card number or mobile number to search', 'error');
      return;
    }
    const results = searchPatients(searchQuery.trim());
    setSearchResults(results);
    setSearched(true);
    setSelectedPatient(null);
  };

  // ========= SELECT PATIENT =========
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setForm(prev => ({
      ...prev,
      department: '',
      doctor: '',
      purpose: '',
      room: '',
      notes: '',
    }));
  };

  // ========= ADMIT PATIENT =========
  const handleAdmit = () => {
    if (!selectedPatient) {
      showToast('Please search and select a patient first', 'error');
      return;
    }
    if (!form.department) {
      showToast('Please select Department', 'error');
      return;
    }
    if (!form.doctor) {
      showToast('Please select Doctor', 'error');
      return;
    }
    if (!form.date) {
      showToast('Please select Admission Date', 'error');
      return;
    }
    if (!form.purpose) {
      showToast('Please select Purpose', 'error');
      return;
    }

    addAdmission({
      id: genId(),
      patientId: selectedPatient.id,
      patientNo: selectedPatient.patientNo,
      patientName: selectedPatient.name,
      department: form.department,
      doctor: form.doctor,
      admissionDate: form.date,
      purpose: form.purpose,
      roomNo: form.room,
      status: 'Admitted',
      notes: form.notes,
      createdAt: todayStr(),
    });

    // Reset form
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    setSelectedPatient(null);
    setForm({
      department: '',
      doctor: '',
      date: todayStr(),
      purpose: '',
      room: '',
      notes: '',
    });

    refreshData();
    showToast('Patient admitted successfully!', 'success');
  };

  // ========= DISCHARGE PATIENT =========
  const handleDischarge = (admission: Admission) => {
    updateAdmission(admission.id, { status: 'Discharged' });
    refreshData();
    showToast(`${admission.patientName} has been discharged`, 'success');
  };

  // ========= PRINT ADMISSION SLIP =========
  const handlePrintSlip = (admission: Admission) => {
    const hospital = JSON.parse(localStorage.getItem('baga_hospital') || '{}');
    const docData = DOCTORS.find(d => d.name === admission.doctor);
    const slipHtml = `
      <html><head><title>Admission Slip - ${admission.patientNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .slip { border: 2px solid #1e293b; border-radius: 8px; padding: 24px; max-width: 500px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #1e293b; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { color: #1e293b; font-size: 22px; }
        .header p { color: #64748b; font-size: 11px; margin-top: 2px; }
        .slip-title { text-align: center; font-size: 16px; font-weight: 700; color: #2563eb; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
        .info-grid .label { color: #64748b; font-weight: 600; }
        .info-grid .value { color: #1e293b; font-weight: 500; }
        .detail-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
        .detail-section h3 { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #cbd5e1; }
        .detail-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .detail-row .dr-label { color: #64748b; }
        .detail-row .dr-value { color: #1e293b; font-weight: 600; }
        .notes-section { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
        .notes-section h3 { font-size: 12px; color: #92400e; margin-bottom: 6px; }
        .notes-section p { font-size: 12px; color: #78350f; }
        .footer { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 2px dashed #1e293b; }
        .footer p { font-size: 10px; color: #94a3b8; }
        .footer .print-date { font-size: 11px; color: #64748b; margin-top: 4px; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>
        <div class="slip">
          <div class="header">
            <h1>${hospital.name || 'BAGA Hospital'}</h1>
            <p>${hospital.address || 'Main Road, City'} | ${hospital.phone || ''}</p>
          </div>
          <div class="slip-title">Admission Slip</div>
          <div class="info-grid">
            <div><span class="label">Patient No:</span><br/><span class="value">${admission.patientNo}</span></div>
            <div><span class="label">Admission ID:</span><br/><span class="value">${admission.id.toUpperCase()}</span></div>
            <div><span class="label">Patient Name:</span><br/><span class="value">${admission.patientName}</span></div>
            <div><span class="label">Admission Date:</span><br/><span class="value">${admission.admissionDate}</span></div>
          </div>
          <div class="detail-section">
            <h3>Admission Details</h3>
            <div class="detail-row"><span class="dr-label">Department:</span><span class="dr-value">${admission.department}</span></div>
            <div class="detail-row"><span class="dr-label">Doctor:</span><span class="dr-value">${admission.doctor}</span></div>
            <div class="detail-row"><span class="dr-label">Purpose:</span><span class="dr-value">${admission.purpose}</span></div>
            <div class="detail-row"><span class="dr-label">Room No:</span><span class="dr-value">${admission.roomNo || 'N/A'}</span></div>
            <div class="detail-row"><span class="dr-label">Status:</span><span class="dr-value">${admission.status}</span></div>
            ${docData ? `<div class="detail-row"><span class="dr-label">Doctor Fee:</span><span class="dr-value">Rs. ${docData.fee.toLocaleString()}</span></div>` : ''}
            ${docData ? `<div class="detail-row"><span class="dr-label">Doctor Timing:</span><span class="dr-value">${docData.timing}</span></div>` : ''}
          </div>
          ${admission.notes ? `
          <div class="notes-section">
            <h3>Notes</h3>
            <p>${admission.notes}</p>
          </div>` : ''}
          <div class="footer">
            <p>${hospital.name || 'BAGA Hospital'} - Patient Admission Record</p>
            <p class="print-date">Printed on: ${todayStr()} ${timeStr()}</p>
          </div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;
    setPrintContent(slipHtml);
  };

  // ========= STATUS BADGE =========
  const statusBadge = (status: string) => {
    if (status === 'Admitted') return <span className="badge badge-green">{status}</span>;
    if (status === 'Discharged') return <span className="badge badge-blue">{status}</span>;
    return <span className="badge badge-amber">{status}</span>;
  };

  const purposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'Surgery': return <span className="badge badge-red">{purpose}</span>;
      case 'Emergency': return <span className="badge badge-red">{purpose}</span>;
      case 'Delivery': return <span className="badge badge-purple">{purpose}</span>;
      case 'Checkup': return <span className="badge badge-blue">{purpose}</span>;
      case 'Observation': return <span className="badge badge-amber">{purpose}</span>;
      default: return <span className="badge badge-green">{purpose}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Print Slip Modal */}
      {printContent && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Admission Slip</h3>
              <button onClick={() => setPrintContent(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <iframe
              srcDoc={printContent}
              style={{ width: '100%', height: '650px', border: 'none' }}
              title="Admission Slip"
            />
          </div>
        </div>
      )}

      {/* ===== NEW ADMISSION SECTION ===== */}
      <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            New Admission
          </span>
        </h2>

        {/* Search Patient */}
        <div className="mb-5">
          <label className="form-label">Search Patient (by Card Number or Mobile)</label>
          <div className="flex gap-3">
            <input
              className="form-input flex-1"
              placeholder="Enter card number (BAGA-0001) or mobile number..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearched(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>

          {/* Search Results */}
          {searched && searchResults.length > 0 && !selectedPatient && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-slate-600">{searchResults.length} patient(s) found</p>
              {searchResults.map(p => (
                <div
                  key={p.id}
                  className="border-2 border-slate-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => handleSelectPatient(p)}
                >
                  <div>
                    <span className="font-mono font-bold text-blue-600">{p.patientNo}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-sm text-slate-500">{p.age}/{p.gender}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-sm text-slate-500">{p.mobile}</span>
                  </div>
                  <button className="btn btn-sm btn-outline">Select</button>
                </div>
              ))}
            </div>
          )}

          {searched && searchResults.length === 0 && !selectedPatient && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              No patient found with this card number or mobile.
            </div>
          )}

          {/* Selected Patient Info */}
          {selectedPatient && (
            <div className="mt-3 bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">Selected Patient</h4>
                <button
                  onClick={() => { setSelectedPatient(null); setSearchResults([]); setSearched(false); }}
                  className="btn btn-outline btn-sm"
                >
                  Change
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-green-600 font-semibold">Card No:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.patientNo}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Name:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.name}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Age/Gender:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.age} / {selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Mobile:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.mobile}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Father Name:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.fatherName}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-green-600 font-semibold">Address:</span>
                  <p className="text-green-900 font-bold">{selectedPatient.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admission Form */}
        {selectedPatient && (
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-md font-bold text-slate-700 mb-4">Admission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Department */}
              <div>
                <label className="form-label">Department *</label>
                <select
                  className="form-input"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value, doctor: '' })}
                >
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="form-label">Doctor *</label>
                <select
                  className="form-input"
                  value={form.doctor}
                  onChange={e => setForm({ ...form, doctor: e.target.value })}
                  disabled={!form.department}
                >
                  <option value="">-- Select Doctor --</option>
                  {filteredDoctors(form.department).map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} (Fee: Rs. {d.fee.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission Date */}
              <div>
                <label className="form-label">Admission Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="form-label">Purpose *</label>
                <select
                  className="form-input"
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                >
                  <option value="">-- Select Purpose --</option>
                  {PURPOSES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Room Number */}
              <div>
                <label className="form-label">Room Number</label>
                <input
                  className="form-input"
                  placeholder="e.g. 101, ICU-2"
                  value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })}
                />
              </div>

              {/* Notes - Full Width */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Additional notes about admission..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-5 flex justify-end">
              <button onClick={handleAdmit} className="btn btn-primary btn-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Admit Patient
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CURRENTLY ADMITTED PATIENTS ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Currently Admitted Patients
            <span className="badge badge-green ml-2">{activeAdmissions.length}</span>
          </span>
        </h2>

        {activeAdmissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm">No patients currently admitted</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient No</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Purpose</th>
                  <th>Room</th>
                  <th>Admission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map((a, i) => (
                  <tr key={a.id}>
                    <td className="font-semibold">{i + 1}</td>
                    <td><span className="font-mono font-bold text-blue-600">{a.patientNo}</span></td>
                    <td className="font-semibold">{a.patientName}</td>
                    <td>{a.department}</td>
                    <td>{a.doctor}</td>
                    <td>{purposeBadge(a.purpose)}</td>
                    <td>{a.roomNo || <span className="text-slate-400">N/A</span>}</td>
                    <td>{a.admissionDate}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDischarge(a)}
                          className="btn btn-danger btn-sm whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Discharge
                        </button>
                        <button
                          onClick={() => handlePrintSlip(a)}
                          className="btn btn-outline btn-sm whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ALL ADMISSIONS HISTORY ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All Admissions History
            <span className="badge badge-blue ml-2">{allAdmissions.length}</span>
          </span>
        </h2>

        {allAdmissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No admission records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient No</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Purpose</th>
                  <th>Room</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...allAdmissions].reverse().map((a, i) => (
                  <tr key={a.id}>
                    <td className="font-semibold">{i + 1}</td>
                    <td><span className="font-mono font-bold text-blue-600">{a.patientNo}</span></td>
                    <td className="font-semibold">{a.patientName}</td>
                    <td>{a.department}</td>
                    <td>{a.doctor}</td>
                    <td>{purposeBadge(a.purpose)}</td>
                    <td>{a.roomNo || <span className="text-slate-400">N/A</span>}</td>
                    <td>{a.admissionDate}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="text-sm text-slate-500">{a.createdAt}</td>
                    <td>
                      <div className="flex gap-2">
                        {a.status === 'Admitted' && (
                          <button
                            onClick={() => handleDischarge(a)}
                            className="btn btn-danger btn-sm whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Discharge
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintSlip(a)}
                          className="btn btn-outline btn-sm whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
