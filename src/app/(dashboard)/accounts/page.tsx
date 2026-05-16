'use client';
import { useState, useEffect, useCallback } from 'react';
import { getBills, updateBill, getVisits, getHospitalSettings, todayStr, timeStr, genId } from '@/lib/store';
import type { Bill } from '@/lib/types';

const DOCTORS = [
  { id: 'd1', name: 'Dr. Ahmed Hassan', dept: 'Emergency', fee: 1500 },
  { id: 'd2', name: 'Dr. Muhammad Ali', dept: 'Cardiology', fee: 2500 },
  { id: 'd3', name: 'Dr. Sara Khan', dept: 'Gynecology', fee: 2000 },
  { id: 'd4', name: 'Dr. Bilal Siddiqui', dept: 'Orthopedic', fee: 1800 },
  { id: 'd5', name: 'Dr. Zainab Malik', dept: 'Pediatrician', fee: 1500 },
  { id: 'd6', name: 'Dr. Usman Tariq', dept: 'ENT', fee: 2000 },
  { id: 'd7', name: 'Dr. Imran Raza', dept: 'General Medicine', fee: 1200 },
  { id: 'd8', name: 'Dr. Nadia Ashraf', dept: 'Skin Specialist', fee: 2000 },
  { id: 'd9', name: 'Dr. Kamran Hyder', dept: 'Eye Specialist', fee: 2200 },
  { id: 'd10', name: 'Dr. Farhan Ali', dept: 'Dental', fee: 1500 },
  { id: 'd11', name: 'Dr. Saima Noor', dept: 'Physiotherapy', fee: 1000 },
  { id: 'd12', name: 'Dr. Rizwan Ahmad', dept: 'Surgery', fee: 5000 },
];

export default function AccountsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [collectModal, setCollectModal] = useState<Bill | null>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState<'Cash' | 'Card'>('Cash');
  const [receiptModal, setReceiptModal] = useState<Bill | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [settings, setSettings] = useState({ hospitalCutRatio: 40, currency: 'Rs.' });

  const loadData = useCallback(() => {
    setBills(getBills());
    const s = getHospitalSettings();
    setSettings({ hospitalCutRatio: s.hospitalCutRatio, currency: s.currency });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const today = todayStr();
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const todayBills = bills.filter(b => b.date === today);
  const monthBills = bills.filter(b => b.date.startsWith(monthStr));
  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Partial');

  const todayCollection = todayBills.reduce((s, b) => s + b.paidAmount, 0);
  const monthCollection = monthBills.reduce((s, b) => s + b.paidAmount, 0);
  const totalRevenue = bills.reduce((s, b) => s + b.paidAmount, 0);
  const pendingBills = unpaidBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

  const filtered = bills.filter(b => {
    const matchSearch = !search || b.patientName.toLowerCase().includes(search.toLowerCase()) || b.patientNo.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || b.status.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const allVisits = getVisits();

  // Doctor Revenue Summary
  const doctorRevenue = DOCTORS.map(doc => {
    const docVisits = allVisits.filter(v => v.doctor === doc.name && v.date.startsWith(monthStr));
    const totalVisits = docVisits.length;
    const totalFee = totalVisits * doc.fee;
    const hospCut = Math.round(totalFee * settings.hospitalCutRatio / 100);
    const docShare = totalFee - hospCut;
    // Check if bills for this doctor's visits are collected
    const collectedAmount = docVisits.reduce((s, v) => {
      const bill = bills.find(b => b.visitId === v.id);
      return s + (bill?.paidAmount || 0);
    }, 0);
    const pendingAmount = totalFee - collectedAmount;
    return { ...doc, totalVisits, totalFee, hospCut, docShare, collectedAmount, pendingAmount };
  });

  const handleCollect = () => {
    if (!collectModal || !collectAmount) return;
    const amt = Number(collectAmount);
    const balance = collectModal.totalAmount - collectModal.paidAmount;
    if (amt <= 0 || amt > balance) {
      setToast({ msg: 'Invalid amount', type: 'error' });
      return;
    }
    const newPaid = collectModal.paidAmount + amt;
    const newStatus: Bill['status'] = newPaid >= collectModal.totalAmount ? 'Paid' : 'Partial';
    updateBill(collectModal.id, {
      paidAmount: newPaid,
      status: newStatus,
      paymentMethod: collectMethod,
      receivedBy: 'Accountant',
    });
    setToast({ msg: `Rs. ${amt.toLocaleString()} collected successfully`, type: 'success' });
    setCollectModal(null);
    setCollectAmount('');
    loadData();
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Accounts & Billing</h2>
        <input className="form-input w-64" placeholder="Search by patient..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card card-hover border border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-medium">Today&apos;s Collection</p>
          <p className="text-2xl font-bold text-emerald-700">{settings.currency} {todayCollection.toLocaleString()}</p>
        </div>
        <div className="stat-card card-hover border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">Monthly Collection</p>
          <p className="text-2xl font-bold text-blue-700">{settings.currency} {monthCollection.toLocaleString()}</p>
        </div>
        <div className="stat-card card-hover border border-purple-200 bg-purple-50">
          <p className="text-xs text-purple-600 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-700">{settings.currency} {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card card-hover border border-red-200 bg-red-50">
          <p className="text-xs text-red-600 font-medium">Pending Bills</p>
          <p className="text-2xl font-bold text-red-700">{settings.currency} {pendingBills.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'paid', 'unpaid', 'partial'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'} btn-sm`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all' ? bills.length : bills.filter(b => b.status.toLowerCase() === tab).length})
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>Date</th><th>Patient No</th><th>Patient Name</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Method</th><th>Received By</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center text-slate-400 py-8">No bills found</td></tr>
              )}
              {filtered.map(bill => {
                const bal = bill.totalAmount - bill.paidAmount;
                return (
                  <tr key={bill.id}>
                    <td className="whitespace-nowrap">{bill.date}<br/><span className="text-xs text-slate-400">{bill.time}</span></td>
                    <td className="font-mono text-blue-600 font-bold">{bill.patientNo}</td>
                    <td className="font-medium">{bill.patientName}</td>
                    <td className="font-semibold">{settings.currency} {bill.totalAmount.toLocaleString()}</td>
                    <td className="font-semibold text-emerald-600">{settings.currency} {bill.paidAmount.toLocaleString()}</td>
                    <td className="font-semibold text-red-600">{settings.currency} {bal.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${bill.status === 'Paid' ? 'badge-green' : bill.status === 'Unpaid' ? 'badge-red' : 'badge-amber'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${bill.paymentMethod === 'Cash' ? 'badge-green' : bill.paymentMethod === 'Card' ? 'badge-blue' : 'badge-rose'}`}>
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="text-sm">{bill.receivedBy}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setReceiptModal(bill)} className="btn btn-outline btn-sm">Receipt</button>
                        {(bill.status === 'Unpaid' || bill.status === 'Partial') && (
                          <button onClick={() => { setCollectModal(bill); setCollectAmount(String(bill.totalAmount - bill.paidAmount)); }} className="btn btn-success btn-sm">Collect</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Revenue Summary */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <h3 className="text-lg font-bold text-slate-800">Doctor Revenue Summary - This Month</h3>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>Doctor</th><th>Department</th><th>Total Visits</th><th>Total Fee</th><th>Hospital Cut ({settings.hospitalCutRatio}%)</th><th>Doctor Share</th><th>Collected</th><th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {doctorRevenue.filter(d => d.totalVisits > 0).map(d => (
                <tr key={d.id}>
                  <td className="font-medium">{d.name}</td>
                  <td>{d.dept}</td>
                  <td className="text-center">{d.totalVisits}</td>
                  <td className="font-semibold">{settings.currency} {d.totalFee.toLocaleString()}</td>
                  <td className="font-semibold text-purple-600">{settings.currency} {d.hospCut.toLocaleString()}</td>
                  <td className="font-semibold text-blue-600">{settings.currency} {d.docShare.toLocaleString()}</td>
                  <td className="font-semibold text-emerald-600">{settings.currency} {d.collectedAmount.toLocaleString()}</td>
                  <td className="font-semibold text-red-600">{settings.currency} {d.pendingAmount.toLocaleString()}</td>
                </tr>
              ))}
              {doctorRevenue.filter(d => d.totalVisits > 0).length === 0 && (
                <tr><td colSpan={8} className="text-center text-slate-400 py-8">No doctor visits this month</td></tr>
              )}
            </tbody>
            {doctorRevenue.filter(d => d.totalVisits > 0).length > 0 && (
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td colSpan={2} className="text-right">Total:</td>
                  <td className="text-center">{doctorRevenue.reduce((s, d) => s + d.totalVisits, 0)}</td>
                  <td>{settings.currency} {doctorRevenue.reduce((s, d) => s + d.totalFee, 0).toLocaleString()}</td>
                  <td className="text-purple-600">{settings.currency} {doctorRevenue.reduce((s, d) => s + d.hospCut, 0).toLocaleString()}</td>
                  <td className="text-blue-600">{settings.currency} {doctorRevenue.reduce((s, d) => s + d.docShare, 0).toLocaleString()}</td>
                  <td className="text-emerald-600">{settings.currency} {doctorRevenue.reduce((s, d) => s + d.collectedAmount, 0).toLocaleString()}</td>
                  <td className="text-red-600">{settings.currency} {doctorRevenue.reduce((s, d) => s + d.pendingAmount, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Expense Summary Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
        <h3 className="text-lg font-semibold text-slate-500">Expense Summary</h3>
        <p className="text-sm text-slate-400 mt-1">Expenses will be managed here</p>
      </div>

      {/* Collect Payment Modal */}
      {collectModal && (
        <div className="modal-overlay" onClick={() => setCollectModal(null)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Collect Payment</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-500">Patient: <span className="font-semibold text-slate-800">{collectModal.patientName} ({collectModal.patientNo})</span></p>
                <p className="text-sm text-slate-500">Total: <span className="font-semibold">{settings.currency} {collectModal.totalAmount.toLocaleString()}</span></p>
                <p className="text-sm text-slate-500">Already Paid: <span className="font-semibold text-emerald-600">{settings.currency} {collectModal.paidAmount.toLocaleString()}</span></p>
                <p className="text-sm text-slate-500">Balance: <span className="font-semibold text-red-600">{settings.currency} {(collectModal.totalAmount - collectModal.paidAmount).toLocaleString()}</span></p>
              </div>
              <div>
                <label className="form-label">Amount to Collect</label>
                <input type="number" className="form-input" value={collectAmount} onChange={e => setCollectAmount(e.target.value)} max={collectModal.totalAmount - collectModal.paidAmount} min={1} />
              </div>
              <div>
                <label className="form-label">Payment Method</label>
                <select className="form-input" value={collectMethod} onChange={e => setCollectMethod(e.target.value as 'Cash' | 'Card')}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCollectModal(null)} className="btn btn-outline flex-1">Cancel</button>
                <button onClick={handleCollect} className="btn btn-success flex-1">Collect Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {receiptModal && (
        <div className="modal-overlay" onClick={() => setReceiptModal(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Bill Receipt</h3>
              <button onClick={() => setReceiptModal(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Bill ID:</span><span className="font-mono">{receiptModal.id}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Patient:</span><span className="font-medium">{receiptModal.patientName} ({receiptModal.patientNo})</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Date:</span><span>{receiptModal.date} {receiptModal.time}</span></div>
              <hr className="border-slate-200" />
              {receiptModal.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.description} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                  <span className="font-medium">{settings.currency} {item.amount.toLocaleString()}</span>
                </div>
              ))}
              <hr className="border-slate-200" />
              <div className="flex justify-between font-bold"><span>Total:</span><span>{settings.currency} {receiptModal.totalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-emerald-600"><span>Paid:</span><span>{settings.currency} {receiptModal.paidAmount.toLocaleString()}</span></div>
              {receiptModal.totalAmount - receiptModal.paidAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600 font-semibold"><span>Balance:</span><span>{settings.currency} {(receiptModal.totalAmount - receiptModal.paidAmount).toLocaleString()}</span></div>
              )}
              <div className="flex justify-between text-sm"><span>Status:</span><span className={`badge ${receiptModal.status === 'Paid' ? 'badge-green' : receiptModal.status === 'Unpaid' ? 'badge-red' : 'badge-amber'}`}>{receiptModal.status}</span></div>
              <div className="flex justify-between text-sm"><span>Payment Method:</span><span>{receiptModal.paymentMethod}</span></div>
              <div className="flex justify-between text-sm"><span>Received By:</span><span>{receiptModal.receivedBy}</span></div>
            </div>
            <button onClick={() => { window.print(); }} className="btn btn-primary w-full mt-4">Print Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}
