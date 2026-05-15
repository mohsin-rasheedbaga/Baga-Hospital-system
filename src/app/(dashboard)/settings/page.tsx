'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [hospitalName, setHospitalName] = useState('BAGA Hospital');
  const [hospitalPhone, setHospitalPhone] = useState('0300-1234567');
  const [hospitalAddress, setHospitalAddress] = useState('Main Road, City');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">System Settings</h2>

      {/* Hospital Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Hospital Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Hospital Name</label>
            <input className="form-input" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={hospitalPhone} onChange={e => setHospitalPhone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <input className="form-input" value={hospitalAddress} onChange={e => setHospitalAddress(e.target.value)} />
          </div>
        </div>
        <button onClick={handleSave} className="btn btn-primary mt-4">Save Changes</button>
        {saved && <span className="ml-3 text-green-600 text-sm">Settings saved!</span>}
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">System Name</span>
            <span className="font-medium">BAGA Hospital Management System</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Mode</span>
            <span className="badge badge-blue">Demo Mode</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Database</span>
            <span className="badge badge-amber">Mock Data (Demo)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Last Updated</span>
            <span className="font-medium">May 15, 2025</span>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Reception', status: 'Active' },
            { name: 'Patients', status: 'Active' },
            { name: 'Doctors', status: 'Active' },
            { name: 'Pharmacy', status: 'Active' },
            { name: 'Laboratory', status: 'Active' },
            { name: 'X-Ray', status: 'Active' },
            { name: 'Ultrasound', status: 'Active' },
            { name: 'Accounts', status: 'Active' },
            { name: 'Surgery', status: 'Coming Soon' },
            { name: 'Reports', status: 'Coming Soon' },
          ].map((mod, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 text-center">
              <p className="font-medium text-sm text-slate-700">{mod.name}</p>
              <span className={`badge mt-1 ${mod.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>{mod.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
