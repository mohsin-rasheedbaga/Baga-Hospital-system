'use client';
import { useState, useEffect } from 'react';
import { getHospital, setHospital, getHospitalSettings, setHospitalSettings } from '@/lib/store';
import type { Hospital, HospitalSettings } from '@/lib/types';

export default function SettingsPage() {
  const [hospital, setHospitalState] = useState<Hospital>({
    name: '', address: '', phone: '', email: '', licenseNo: ''
  });
  const [settings, setSettingsState] = useState<HospitalSettings>({
    receptionCanCollectPharmacy: true,
    receptionCanCollectLab: true,
    receptionCanCollectXray: true,
    receptionCanCollectUltrasound: true,
    currency: 'Rs.',
    receiptFooter: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHospitalState(getHospital());
    setSettingsState(getHospitalSettings());
  }, []);

  const handleSaveHospital = () => {
    setHospital(hospital);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveSettings = () => {
    setHospitalSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: keyof HospitalSettings, value: boolean | string) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        {saved && <span className="badge badge-green animate-pulse">Settings saved!</span>}
      </div>

      {/* Hospital Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          Hospital Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Hospital Name</label>
            <input className="form-input" value={hospital.name} onChange={e => setHospitalState({...hospital, name: e.target.value})} />
          </div>
          <div>
            <label className="form-label">License Number</label>
            <input className="form-input" value={hospital.licenseNo} onChange={e => setHospitalState({...hospital, licenseNo: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={hospital.phone} onChange={e => setHospitalState({...hospital, phone: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={hospital.email} onChange={e => setHospitalState({...hospital, email: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <input className="form-input" value={hospital.address} onChange={e => setHospitalState({...hospital, address: e.target.value})} />
          </div>
        </div>
        <button onClick={handleSaveHospital} className="btn btn-primary mt-4">Save Hospital Info</button>
      </div>

      {/* Reception Payment Permissions - SUPER ADMIN ONLY */}
      <div className="bg-white rounded-xl border-2 border-amber-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Reception Payment Permissions
        </h3>
        <p className="text-sm text-slate-500 mb-4">Control which payments the reception staff can collect. If a permission is OFF, patients will pay directly at the respective department.</p>

        <div className="space-y-4">
          {/* Pharmacy Permission */}
          <div className="flex items-center justify-between p-4 border border-amber-100 rounded-lg bg-amber-50">
            <div>
              <p className="font-semibold text-slate-800">Pharmacy Payment at Reception</p>
              <p className="text-xs text-slate-500 mt-1">If ON: Reception can collect medicine payment from patients and show pharmacy items in the bill. If OFF: Patients pay directly at the Pharmacy counter.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.receptionCanCollectPharmacy}
                onChange={e => updateSetting('receptionCanCollectPharmacy', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Lab Permission */}
          <div className="flex items-center justify-between p-4 border border-green-100 rounded-lg bg-green-50">
            <div>
              <p className="font-semibold text-slate-800">Lab Payment at Reception</p>
              <p className="text-xs text-slate-500 mt-1">If ON: Reception can collect lab test payment. If OFF: Patients pay directly at the Lab counter.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.receptionCanCollectLab}
                onChange={e => updateSetting('receptionCanCollectLab', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* X-Ray Permission */}
          <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-red-50">
            <div>
              <p className="font-semibold text-slate-800">X-Ray Payment at Reception</p>
              <p className="text-xs text-slate-500 mt-1">If ON: Reception can collect X-ray payment. If OFF: Patients pay directly at the X-Ray department.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.receptionCanCollectXray}
                onChange={e => updateSetting('receptionCanCollectXray', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          {/* Ultrasound Permission */}
          <div className="flex items-center justify-between p-4 border border-purple-100 rounded-lg bg-purple-50">
            <div>
              <p className="font-semibold text-slate-800">Ultrasound Payment at Reception</p>
              <p className="text-xs text-slate-500 mt-1">If ON: Reception can collect ultrasound payment. If OFF: Patients pay directly at the Ultrasound department.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.receptionCanCollectUltrasound}
                onChange={e => updateSetting('receptionCanCollectUltrasound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        <button onClick={handleSaveSettings} className="btn btn-primary mt-5">Save Permission Settings</button>
      </div>

      {/* Receipt Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Receipt Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Currency Symbol</label>
            <input className="form-input" value={settings.currency} onChange={e => updateSetting('currency', e.target.value)} placeholder="Rs." />
          </div>
          <div>
            <label className="form-label">Receipt Footer Message</label>
            <input className="form-input" value={settings.receiptFooter} onChange={e => updateSetting('receiptFooter', e.target.value)} placeholder="Thank you message..." />
          </div>
        </div>
        <button onClick={handleSaveSettings} className="btn btn-primary mt-4">Save Receipt Settings</button>
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
            <span className="badge badge-blue">Offline Mode</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Database</span>
            <span className="badge badge-green">Local Storage (Offline)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Last Updated</span>
            <span className="font-medium">May 16, 2026</span>
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
            { name: 'Billing', status: 'Active' },
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
