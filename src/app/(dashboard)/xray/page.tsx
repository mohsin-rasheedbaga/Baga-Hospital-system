'use client';
import { useState } from 'react';

const pendingXrays = [
  { id: '1', patient: 'Muhammad Ali (BAGA-0001)', type: 'Chest X-Ray', doctor: 'Dr. Bilal Siddiqui', date: '2025-05-15', status: 'Waiting', payment: 'Paid' },
  { id: '2', patient: 'Ahmed Khan (BAGA-0003)', type: 'Knee X-Ray (Both)', doctor: 'Dr. Bilal Siddiqui', date: '2025-05-15', status: 'In Progress', payment: 'Paid' },
  { id: '3', patient: 'Babar Ali (BAGA-0005)', type: 'Spine X-Ray', doctor: 'Dr. Bilal Siddiqui', date: '2025-05-14', status: 'Waiting', payment: 'Unpaid' },
];

const completedXrays = [
  { id: '10', patient: 'Zainab Noor (BAGA-0008)', type: 'Hand X-Ray', date: '2025-05-12', status: 'Completed' },
  { id: '11', patient: 'Hassan Raza (BAGA-0009)', type: 'Pelvis X-Ray', date: '2025-05-11', status: 'Completed' },
];

export default function XrayPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">X-Ray Department</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('pending')} className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}>
            Queue ({pendingXrays.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}>
            Completed ({completedXrays.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card card-hover border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">Today&apos;s Queue</p>
          <p className="text-2xl font-bold text-blue-700">{pendingXrays.filter(x => x.date === '2025-05-15').length}</p>
        </div>
        <div className="stat-card card-hover border border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600 font-medium">Waiting</p>
          <p className="text-2xl font-bold text-amber-700">{pendingXrays.filter(x => x.status === 'Waiting').length}</p>
        </div>
        <div className="stat-card card-hover border border-red-200 bg-red-50">
          <p className="text-xs text-red-600 font-medium">Unpaid</p>
          <p className="text-2xl font-bold text-red-700">{pendingXrays.filter(x => x.payment === 'Unpaid').length}</p>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>X-Ray Type</th><th>Doctor</th><th>Date</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pendingXrays.map(x => (
                  <tr key={x.id}>
                    <td className="font-medium">{x.patient}</td>
                    <td>{x.type}</td>
                    <td className="text-sm">{x.doctor}</td>
                    <td>{x.date}</td>
                    <td><span className={`badge ${x.payment === 'Paid' ? 'badge-green' : 'badge-red'}`}>{x.payment}</span></td>
                    <td><span className={`badge ${x.status === 'Waiting' ? 'badge-amber' : 'badge-blue'}`}>{x.status}</span></td>
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
              <thead><tr><th>Patient</th><th>X-Ray Type</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {completedXrays.map(x => (
                  <tr key={x.id}>
                    <td className="font-medium">{x.patient}</td>
                    <td>{x.type}</td>
                    <td>{x.date}</td>
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
