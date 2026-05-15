'use client';
import { useState } from 'react';

const pendingTests = [
  { id: '1', patient: 'Muhammad Ali (BAGA-0001)', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Ahmed Hassan', date: '2025-05-15', status: 'Pending', payment: 'Paid' },
  { id: '2', patient: 'Fatima Bibi (BAGA-0002)', test: 'Blood Sugar (Fasting)', doctor: 'Dr. Ahmed Hassan', date: '2025-05-15', status: 'In Progress', payment: 'Paid' },
  { id: '3', patient: 'Babar Ali (BAGA-0005)', test: 'Liver Function Test (LFT)', doctor: 'Dr. Muhammad Ali', date: '2025-05-14', status: 'Pending', payment: 'Unpaid' },
  { id: '4', patient: 'Ahmed Khan (BAGA-0003)', test: 'Urinalysis', doctor: 'Dr. Ahmed Hassan', date: '2025-05-14', status: 'Ready', payment: 'Paid' },
  { id: '5', patient: 'Ayesha Siddiqui (BAGA-0004)', test: 'Thyroid Panel', doctor: 'Dr. Sara Khan', date: '2025-05-13', status: 'Ready', payment: 'Paid' },
];

const completedTests = [
  { id: '10', patient: 'Zainab Noor (BAGA-0008)', test: 'CBC', date: '2025-05-12', result: 'Normal' },
  { id: '11', patient: 'Hassan Raza (BAGA-0009)', test: 'Blood Sugar', date: '2025-05-11', result: 'High' },
];

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Laboratory Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('pending')} className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}>
            Pending ({pendingTests.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}>
            Completed ({completedTests.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card card-hover border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">Total Tests Today</p>
          <p className="text-2xl font-bold text-blue-700">{pendingTests.filter(t => t.date === '2025-05-15').length}</p>
        </div>
        <div className="stat-card card-hover border border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{pendingTests.filter(t => t.status === 'Pending').length}</p>
        </div>
        <div className="stat-card card-hover border border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-medium">Ready</p>
          <p className="text-2xl font-bold text-emerald-700">{pendingTests.filter(t => t.status === 'Ready').length}</p>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Test</th><th>Doctor</th><th>Date</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pendingTests.map(t => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.patient}</td>
                    <td>{t.test}</td>
                    <td className="text-sm">{t.doctor}</td>
                    <td>{t.date}</td>
                    <td><span className={`badge ${t.payment === 'Paid' ? 'badge-green' : 'badge-red'}`}>{t.payment}</span></td>
                    <td>
                      <span className={`badge ${t.status === 'Pending' ? 'badge-amber' : t.status === 'In Progress' ? 'badge-blue' : 'badge-green'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm">Process</button>
                        {t.status === 'Ready' && <button className="btn btn-success btn-sm">View Report</button>}
                      </div>
                    </td>
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
              <thead><tr><th>Patient</th><th>Test</th><th>Date</th><th>Result</th><th>Action</th></tr></thead>
              <tbody>
                {completedTests.map(t => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.patient}</td>
                    <td>{t.test}</td>
                    <td>{t.date}</td>
                    <td><span className={`badge ${t.result === 'Normal' ? 'badge-green' : 'badge-red'}`}>{t.result}</span></td>
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
