'use client';
import { useState } from 'react';

const pendingUltrasounds = [
  { id: '1', patient: 'Ayesha Siddiqui (BAGA-0004)', type: 'Abdominal Ultrasound', doctor: 'Dr. Sara Khan', date: '2025-05-15', status: 'Waiting', payment: 'Paid' },
  { id: '2', patient: 'Fatima Bibi (BAGA-0002)', type: 'Obstetric USG', doctor: 'Dr. Sara Khan', date: '2025-05-15', status: 'Waiting', payment: 'Unpaid' },
  { id: '3', patient: 'Zainab Noor (BAGA-0008)', type: 'Pelvic Ultrasound', doctor: 'Dr. Sara Khan', date: '2025-05-14', status: 'In Progress', payment: 'Paid' },
];

const completedUltrasounds = [
  { id: '10', patient: 'Sana Rafiq (BAGA-0010)', type: 'Thyroid USG', date: '2025-05-12', status: 'Completed' },
];

export default function UltrasoundPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Ultrasound Department</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('pending')} className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}>
            Queue ({pendingUltrasounds.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}>
            Completed ({completedUltrasounds.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card card-hover border border-purple-200 bg-purple-50">
          <p className="text-xs text-purple-600 font-medium">Today&apos;s Queue</p>
          <p className="text-2xl font-bold text-purple-700">{pendingUltrasounds.filter(u => u.date === '2025-05-15').length}</p>
        </div>
        <div className="stat-card card-hover border border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600 font-medium">Waiting</p>
          <p className="text-2xl font-bold text-amber-700">{pendingUltrasounds.filter(u => u.status === 'Waiting').length}</p>
        </div>
        <div className="stat-card card-hover border border-red-200 bg-red-50">
          <p className="text-xs text-red-600 font-medium">Unpaid</p>
          <p className="text-2xl font-bold text-red-700">{pendingUltrasounds.filter(u => u.payment === 'Unpaid').length}</p>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Ultrasound Type</th><th>Doctor</th><th>Date</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pendingUltrasounds.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.patient}</td>
                    <td>{u.type}</td>
                    <td className="text-sm">{u.doctor}</td>
                    <td>{u.date}</td>
                    <td><span className={`badge ${u.payment === 'Paid' ? 'badge-green' : 'badge-red'}`}>{u.payment}</span></td>
                    <td><span className={`badge ${u.status === 'Waiting' ? 'badge-amber' : 'badge-blue'}`}>{u.status}</span></td>
                    <td><button className="btn btn-primary btn-sm">Process</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Ultrasound Type</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {completedUltrasounds.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.patient}</td>
                    <td>{u.type}</td>
                    <td>{u.date}</td>
                    <td><button className="btn btn-outline btn-sm">View Report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
