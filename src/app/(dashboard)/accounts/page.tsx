'use client';
import { useState } from 'react';

const transactions = [
  { id: '1', patient: 'Muhammad Ali (BAGA-0001)', type: 'Consultation', amount: 1500, method: 'Cash', date: '2025-05-15', status: 'Paid' },
  { id: '2', patient: 'Fatima Bibi (BAGA-0002)', type: 'Lab Tests', amount: 2500, method: 'Card', date: '2025-05-15', status: 'Paid' },
  { id: '3', patient: 'Ahmed Khan (BAGA-0003)', type: 'X-Ray + Consultation', amount: 4500, method: 'Cash', date: '2025-05-15', status: 'Partial' },
  { id: '4', patient: 'Babar Ali (BAGA-0005)', type: 'Pharmacy', amount: 800, method: 'Cash', date: '2025-05-14', status: 'Paid' },
  { id: '5', patient: 'Ayesha Siddiqui (BAGA-0004)', type: 'Ultrasound', amount: 3000, method: 'Card', date: '2025-05-14', status: 'Paid' },
  { id: '6', patient: 'Zainab Noor (BAGA-0008)', type: 'Surgery Advance', amount: 25000, method: 'Cash', date: '2025-05-13', status: 'Advance' },
  { id: '7', patient: 'Hassan Raza (BAGA-0009)', type: 'Consultation + Lab', amount: 3500, method: 'Cash', date: '2025-05-13', status: 'Unpaid' },
];

export default function AccountsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');

  const filtered = transactions.filter(t => {
    const matchSearch = t.patient.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || t.status.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  });

  const totalRevenue = transactions.filter(t => t.status === 'Paid').reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'Unpaid' || t.status === 'Partial').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Accounts & Billing</h2>
        <input className="form-input w-64" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card card-hover border border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-medium">Today&apos;s Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">Rs. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card card-hover border border-red-200 bg-red-50">
          <p className="text-xs text-red-600 font-medium">Pending Amount</p>
          <p className="text-2xl font-bold text-red-700">Rs. {totalPending.toLocaleString()}</p>
        </div>
        <div className="stat-card card-hover border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">Cash</p>
          <p className="text-2xl font-bold text-blue-700">{transactions.filter(t => t.method === 'Cash').length}</p>
        </div>
        <div className="stat-card card-hover border border-purple-200 bg-purple-50">
          <p className="text-xs text-purple-600 font-medium">Card</p>
          <p className="text-2xl font-bold text-purple-700">{transactions.filter(t => t.method === 'Card').length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'paid', 'unpaid', 'partial'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'} btn-sm`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Type</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-medium">{t.patient}</td>
                  <td>{t.type}</td>
                  <td className="font-semibold">Rs. {t.amount.toLocaleString()}</td>
                  <td><span className={`badge ${t.method === 'Cash' ? 'badge-green' : 'badge-blue'}`}>{t.method}</span></td>
                  <td>{t.date}</td>
                  <td><span className={`badge ${t.status === 'Paid' ? 'badge-green' : t.status === 'Unpaid' ? 'badge-red' : 'badge-amber'}`}>{t.status}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm">Receipt</button>
                      {t.status === 'Unpaid' && <button className="btn btn-success btn-sm">Collect</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
