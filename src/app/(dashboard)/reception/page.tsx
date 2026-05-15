'use client';
import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  patientNo: string;
  name: string;
  fatherName: string;
  mobile: string;
  age: string;
  gender: string;
  address: string;
  cardStatus: string;
  cardExpiry: string;
  totalVisits: number;
  lastVisit: string;
  regDate: string;
}

// Demo patients
const initialPatients: Patient[] = [
  { id: '1', patientNo: 'BAGA-0001', name: 'Muhammad Ali', fatherName: 'Abdul Rehman', mobile: '03001234567', age: '35', gender: 'Male', address: 'Street 5, Lahore', cardStatus: 'Active', cardExpiry: '2025-12-31', totalVisits: 5, lastVisit: '2025-05-10', regDate: '2025-01-15' },
  { id: '2', patientNo: 'BAGA-0002', name: 'Fatima Bibi', fatherName: 'Haji Rasool', mobile: '03119876543', age: '28', gender: 'Female', address: 'Block C, Karachi', cardStatus: 'Active', cardExpiry: '2025-11-30', totalVisits: 3, lastVisit: '2025-05-08', regDate: '2025-02-20' },
  { id: '3', patientNo: 'BAGA-0003', name: 'Ahmed Khan', fatherName: 'Ghulam Khan', mobile: '03234567890', age: '45', gender: 'Male', address: 'Mohalla Shah, Multan', cardStatus: 'Expired', cardExpiry: '2025-04-15', totalVisits: 8, lastVisit: '2025-04-10', regDate: '2024-12-05' },
];

let patientCounter = 4;

type TabType = 'register' | 'search' | 'card-renewal' | 'new-visit';

export default function ReceptionPage() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [searchMobile, setSearchMobile] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [visitPatient, setVisitPatient] = useState<Patient | null>(null);

  // Registration form
  const [form, setForm] = useState({
    name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: ''
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Register new patient
  const handleRegister = () => {
    if (!form.name.trim() || !form.fatherName.trim() || !form.mobile.trim() || !form.age.trim() || !form.address.trim()) {
      showToast('All 5 fields are compulsory (Name, Father Name, Mobile, Age, Address)', 'error');
      return;
    }
    const patientNo = `BAGA-${String(patientCounter).padStart(4, '0')}`;
    patientCounter++;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newPatient: Patient = {
      id: String(Date.now()),
      patientNo, name: form.name.trim(), fatherName: form.fatherName.trim(),
      mobile: form.mobile.trim(), age: form.age.trim(), gender: form.gender,
      address: form.address.trim(), cardStatus: 'Active',
      cardExpiry: expiry.toISOString().split('T')[0],
      totalVisits: 0, lastVisit: today, regDate: today
    };
    setPatients([...patients, newPatient]);
    setForm({ name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: '' });
    showToast(`Patient registered: ${patientNo}`, 'success');
  };

  // Search by mobile
  const handleSearch = () => {
    if (!searchMobile.trim()) { showToast('Enter mobile number', 'error'); return; }
    const results = patients.filter(p => p.mobile.includes(searchMobile.trim()));
    setSearchResults(results);
    if (results.length === 0) showToast('No patient found with this number', 'error');
  };

  // Card renewal
  const handleRenewal = (patientId: string) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        return { ...p, cardStatus: 'Active', cardExpiry: expiry.toISOString().split('T')[0] };
      }
      return p;
    }));
    showToast('Card renewed successfully!', 'success');
  };

  // New visit
  const handleNewVisit = (patientId: string) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p, totalVisits: p.totalVisits + 1,
          lastVisit: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
    setVisitPatient(null);
    showToast('New visit created successfully!', 'success');
  };

  // Edit patient
  const handleEditSave = () => {
    if (!editingPatient) return;
    setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
    setEditingPatient(null);
    showToast('Patient updated successfully!', 'success');
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'register', label: 'New Registration', icon: '+' },
    { key: 'search', label: 'Search Patient', icon: '?' },
    { key: 'card-renewal', label: 'Card Renewal', icon: 'R' },
    { key: 'new-visit', label: 'New Visit', icon: 'V' },
  ];

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
          >
            <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-xs font-bold">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* New Registration Tab */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">New Patient Registration</h2>
          <p className="text-sm text-slate-500 mb-5">Fields marked with * are compulsory</p>

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
              <input className="form-input" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
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
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={handleRegister} className="btn btn-success btn-lg">
              Register Patient
            </button>
            <button onClick={() => setForm({ name: '', fatherName: '', mobile: '', age: '', gender: 'Male', address: '' })} className="btn btn-outline btn-lg">
              Clear Form
            </button>
          </div>

          {/* Patient counter display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Next Patient Number: <strong>BAGA-{String(patientCounter).padStart(4, '0')}</strong></p>
          </div>
        </div>
      )}

      {/* Search Patient Tab */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Search Patient by Mobile</h2>
          <div className="flex gap-3">
            <input className="form-input flex-1" placeholder="Enter mobile number..." value={searchMobile} onChange={e => setSearchMobile(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} className="btn btn-primary">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient No</th><th>Name</th><th>Father Name</th><th>Mobile</th><th>Age</th><th>Visits</th><th>Card</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono font-bold text-blue-600">{p.patientNo}</td>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.fatherName}</td>
                      <td className="font-mono">{p.mobile}</td>
                      <td>{p.age}</td>
                      <td>{p.totalVisits}</td>
                      <td><span className={`badge ${p.cardStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{p.cardStatus}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingPatient({...p})} className="btn btn-outline btn-sm">Edit</button>
                          <button onClick={() => handleNewVisit(p.id)} className="btn btn-success btn-sm">Visit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Card Renewal Tab */}
      {activeTab === 'card-renewal' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Card Renewal</h2>
          <div className="flex gap-3 mb-4">
            <input className="form-input flex-1" placeholder="Enter mobile number to find patient..." value={searchMobile} onChange={e => { setSearchMobile(e.target.value); setSearchResults([]); }} onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
            <button onClick={handleSearch} className="btn btn-primary">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-3">
              {searchResults.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{p.name} <span className="font-mono text-sm text-slate-500">({p.patientNo})</span></p>
                    <p className="text-sm text-slate-500">{p.mobile} | Card: <span className={p.cardStatus === 'Active' ? 'text-green-600' : 'text-red-600'}>{p.cardStatus}</span> | Expiry: {p.cardExpiry}</p>
                  </div>
                  <button onClick={() => handleRenewal(p.id)} className="btn btn-success btn-sm">Renew Card</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Visit Tab */}
      {activeTab === 'new-visit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Visit</h2>
          <div className="flex gap-3 mb-4">
            <input className="form-input flex-1" placeholder="Enter mobile number to find patient..." value={searchMobile} onChange={e => { setSearchMobile(e.target.value); setSearchResults([]); }} onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
            <button onClick={handleSearch} className="btn btn-primary">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-3">
              {searchResults.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{p.name} <span className="font-mono text-sm text-slate-500">({p.patientNo})</span></p>
                    <p className="text-sm text-slate-500">{p.fatherName} | {p.mobile} | Total Visits: {p.totalVisits} | Last Visit: {p.lastVisit}</p>
                  </div>
                  <button onClick={() => handleNewVisit(p.id)} className="btn btn-success btn-sm">Create Visit</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">All Registered Patients ({patients.length})</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient No</th><th>Name</th><th>Father Name</th><th>Mobile</th><th>Age/Gender</th><th>Card Status</th><th>Visits</th><th>Last Visit</th><th>Actions</th>
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
                  <td><span className={`badge ${p.cardStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{p.cardStatus}</span></td>
                  <td>{p.totalVisits}</td>
                  <td className="text-sm">{p.lastVisit}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingPatient({...p})} className="btn btn-outline btn-sm">Edit</button>
                      <button onClick={() => handleRenewal(p.id)} className="btn btn-sm" style={{background:'#d97706',color:'white'}}>Renew</button>
                      <button onClick={() => handleNewVisit(p.id)} className="btn btn-success btn-sm">Visit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="modal-overlay" onClick={() => setEditingPatient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Patient - {editingPatient.patientNo}</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Address *</label>
                <input className="form-input" value={editingPatient.address} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditSave} className="btn btn-primary">Save Changes</button>
                <button onClick={() => setEditingPatient(null)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
