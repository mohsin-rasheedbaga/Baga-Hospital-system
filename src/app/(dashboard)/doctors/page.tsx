'use client';
import { useState } from 'react';

const demoDoctors = [
  { id: '1', name: 'Dr. Ahmed Hassan', spec: 'General Physician', mobile: '03001234567', fee: 1500, status: 'Available', patients: 8, timing: '9AM - 1PM' },
  { id: '2', name: 'Dr. Muhammad Ali', spec: 'Cardiologist', mobile: '03119876543', fee: 2500, status: 'Available', patients: 5, timing: '2PM - 6PM' },
  { id: '3', name: 'Dr. Sara Khan', spec: 'Gynecologist', mobile: '03234567890', fee: 2000, status: 'Busy', patients: 12, timing: '10AM - 2PM' },
  { id: '4', name: 'Dr. Bilal Siddiqui', spec: 'Orthopedic', mobile: '03335678901', fee: 1800, status: 'Available', patients: 3, timing: '4PM - 8PM' },
  { id: '5', name: 'Dr. Zainab Malik', spec: 'Pediatrician', mobile: '03456789012', fee: 1500, status: 'Off Duty', patients: 0, timing: '9AM - 1PM' },
  { id: '6', name: 'Dr. Usman Tariq', spec: 'ENT Specialist', mobile: '03567890123', fee: 2000, status: 'Available', patients: 6, timing: '3PM - 7PM' },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState('');

  const filtered = demoDoctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.spec.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Doctors Management</h2>
          <p className="text-sm text-slate-500">{demoDoctors.length} registered doctors</p>
        </div>
        <div className="flex gap-3">
          <input className="form-input w-64" placeholder="Search doctor..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary">Add Doctor</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {doc.name.split(' ').slice(-1)[0].charAt(0)}
              </div>
              <span className={`badge ${doc.status === 'Available' ? 'badge-green' : doc.status === 'Busy' ? 'badge-amber' : 'badge-red'}`}>
                {doc.status}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800">{doc.name}</h3>
            <p className="text-sm text-blue-600">{doc.spec}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>Mobile: <span className="font-mono">{doc.mobile}</span></p>
              <p>Fee: <span className="font-semibold text-slate-700">Rs. {doc.fee.toLocaleString()}</span></p>
              <p>Timing: {doc.timing}</p>
              <p>Today&apos;s Patients: {doc.patients}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-outline btn-sm flex-1">Edit</button>
              <button className="btn btn-primary btn-sm flex-1">View Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
