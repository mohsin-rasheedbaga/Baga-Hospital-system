'use client';
import { useState, useEffect } from 'react';
import {
  getLabOrders, updateLabOrder, searchPatients, getLabOrdersByPatient,
  getVisits, genId, todayStr, timeStr
} from '@/lib/store';
import type { LabOrder, LabResult, Patient, Visit } from '@/lib/types';

export default function LabPage() {
  const [tab, setTab] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [resultOrder, setResultOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState<{ testName: string; value: string; unit: string; normalRange: string; status: string }[]>([]);
  const [viewOrder, setViewOrder] = useState<LabOrder | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientOrders, setPatientOrders] = useState<LabOrder[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Stats
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { loadOrders(); loadStats(); }, []);

  const loadStats = () => {
    const all = getLabOrders();
    setPendingCount(all.filter(o => o.status === 'Pending').length);
    setInProgressCount(all.filter(o => o.status === 'In Progress').length);
    setCompletedCount(all.filter(o => o.status === 'Completed').length);
  };

  const loadOrders = () => {
    const all = getLabOrders();
    let filtered: LabOrder[];
    if (tab === 'pending') filtered = all.filter(o => o.status === 'Pending');
    else if (tab === 'in-progress') filtered = all.filter(o => o.status === 'In Progress');
    else filtered = all.filter(o => o.status === 'Completed');
    setOrders(filtered);
  };

  useEffect(() => { loadOrders(); loadStats(); }, [tab]);

  // Patient Search
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setSearchResults([]); return; }
    const results = searchPatients(q);
    setSearchResults(results);
  };

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    const pOrders = getLabOrdersByPatient(p.id);
    setPatientOrders(pOrders);
  };

  const clearPatientSearch = () => {
    setSelectedPatient(null);
    setPatientOrders([]);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Status Change
  const markInProgress = (order: LabOrder) => {
    updateLabOrder(order.id, { status: 'In Progress' });
    showToast(`${order.patientNo} - Status: In Progress`, 'success');
    loadOrders(); loadStats();
    if (selectedPatient) {
      setPatientOrders(getLabOrdersByPatient(selectedPatient.id));
    }
  };

  // Enter Results
  const openResult = (order: LabOrder) => {
    setResultOrder(order);
    // Pre-fill with existing results if any
    if (order.results && order.results.length > 0) {
      setResults(order.tests.map(t => {
        const existing = order.results.find(r => r.testName === t.testName);
        return {
          testName: t.testName,
          value: existing?.value || '',
          unit: existing?.unit || '',
          normalRange: existing?.normalRange || '',
          status: existing?.status || 'Normal'
        };
      }));
    } else {
      setResults(order.tests.map(t => ({ testName: t.testName, value: '', unit: '', normalRange: '', status: 'Normal' })));
    }
  };

  const saveResults = () => {
    if (!resultOrder) return;
    const filled = results.filter(r => r.value.trim() !== '');
    if (filled.length === 0) { showToast('Enter at least one result', 'error'); return; }
    const labResults: LabResult[] = results.map(r => ({
      testName: r.testName,
      value: r.value || '-',
      unit: r.unit || '-',
      normalRange: r.normalRange || '-',
      status: (r.status || 'Normal') as 'Normal' | 'Low' | 'High'
    }));
    updateLabOrder(resultOrder.id, { status: 'Completed', results: labResults });
    setResultOrder(null);
    loadOrders(); loadStats();
    if (selectedPatient) {
      setPatientOrders(getLabOrdersByPatient(selectedPatient.id));
    }
    showToast('Lab results saved!', 'success');
  };

  return (
    <div className="space-y-5">
      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>}

      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laboratory</h2>
          <p className="text-sm text-slate-500">Doctor-ordered lab tests. Search patient or browse pending tests.</p>
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className="btn btn-primary">
          {showSearch ? 'Hide Search' : 'Search Patient'}
        </button>
      </div>

      {/* Patient Search Bar */}
      {showSearch && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Patient No, Name, ya Mobile dalein..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {selectedPatient && (
              <button onClick={clearPatientSearch} className="btn btn-outline btn-sm">Clear</button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && !selectedPatient && (
            <div className="mt-2 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPatient(p)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-blue-600">{p.patientNo}</span>
                      <span className="ml-3 font-medium text-slate-700">{p.name}</span>
                      <span className="ml-3 text-sm text-slate-400">S/O {p.fatherName}</span>
                    </div>
                    <span className="text-sm text-slate-400">{p.mobile}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Patient Info */}
          {selectedPatient && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{selectedPatient.name}</p>
                    <p className="text-sm text-slate-500">
                      <span className="font-mono text-blue-600">{selectedPatient.patientNo}</span> | {selectedPatient.gender} | {selectedPatient.age} yrs | {selectedPatient.mobile}
                    </p>
                  </div>
                </div>
                <button onClick={clearPatientSearch} className="btn btn-outline btn-sm">Close</button>
              </div>

              {/* Patient Lab Orders */}
              {patientOrders.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Lab Orders ({patientOrders.length})</h4>
                  <div className="space-y-2">
                    {patientOrders.map(o => (
                      <div key={o.id} className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{o.date} {o.time}</span>
                            <span className="text-sm text-slate-400">by {o.orderedBy}</span>
                          </div>
                          <span className={`badge ${o.status === 'Pending' ? 'badge-amber' : o.status === 'In Progress' ? 'badge-blue' : 'badge-green'}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {o.tests.map((t, i) => <span key={i} className="badge badge-blue">{t.testName}</span>)}
                        </div>
                        <div className="flex gap-2">
                          {o.status === 'Pending' && (
                            <button onClick={() => markInProgress(o)} className="btn btn-primary btn-sm">Start Processing</button>
                          )}
                          {o.status === 'In Progress' && (
                            <button onClick={() => openResult(o)} className="btn btn-success btn-sm">Enter Results</button>
                          )}
                          {o.status === 'Completed' && (
                            <button onClick={() => setViewOrder(o)} className="btn btn-outline btn-sm">View Results</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-4 text-slate-400">
                  Is patient ke liye koi lab order nahi mila. Doctor ne abhi tak koi test recommend nahi kiya.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Buttons with Counts */}
      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-outline'}`}>
          Pending ({pendingCount})
        </button>
        <button onClick={() => setTab('in-progress')} className={`btn ${tab === 'in-progress' ? 'btn-primary' : 'btn-outline'}`}>
          In Progress ({inProgressCount})
        </button>
        <button onClick={() => setTab('completed')} className={`btn ${tab === 'completed' ? 'btn-primary' : 'btn-outline'}`}>
          Completed ({completedCount})
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient No</th>
                <th>Patient Name</th>
                <th>Tests Ordered</th>
                <th>Ordered By</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                  <td className="font-medium">{o.patientName}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {o.tests.map((t, i) => <span key={i} className="badge badge-blue">{t.testName}</span>)}
                    </div>
                  </td>
                  <td className="text-sm">{o.orderedBy}</td>
                  <td>{o.date}</td>
                  <td>{o.time}</td>
                  <td>
                    <span className={`badge ${o.status === 'Pending' ? 'badge-amber' : o.status === 'In Progress' ? 'badge-blue' : 'badge-green'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {o.status === 'Pending' && (
                        <button onClick={() => markInProgress(o)} className="btn btn-primary btn-sm">Start</button>
                      )}
                      {o.status === 'In Progress' && (
                        <button onClick={() => openResult(o)} className="btn btn-success btn-sm">Results</button>
                      )}
                      {o.status === 'Completed' && (
                        <button onClick={() => setViewOrder(o)} className="btn btn-outline btn-sm">View</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">
                  {tab === 'pending' ? 'Koi pending test nahi' : tab === 'in-progress' ? 'Koi in-progress test nahi' : 'Koi completed test nahi'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Results Modal */}
      {resultOrder && (
        <div className="modal-overlay" onClick={() => setResultOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Enter Lab Results</h3>
                <p className="text-sm text-blue-600">{resultOrder.patientNo} - {resultOrder.patientName}</p>
                <p className="text-xs text-slate-400">Ordered by {resultOrder.orderedBy} on {resultOrder.date}</p>
              </div>
              <button onClick={() => setResultOrder(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <div className="space-y-3">
              {results.map((r, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-sm text-slate-700 mb-2">{r.testName}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-slate-500">Value</label>
                      <input
                        className="form-input"
                        placeholder="e.g. 120"
                        value={r.value}
                        onChange={e => { const u = [...results]; u[idx] = { ...u[idx], value: e.target.value }; setResults(u); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Unit</label>
                      <input
                        className="form-input"
                        placeholder="mg/dL"
                        value={r.unit}
                        onChange={e => { const u = [...results]; u[idx] = { ...u[idx], unit: e.target.value }; setResults(u); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Normal Range</label>
                      <input
                        className="form-input"
                        placeholder="70-100"
                        value={r.normalRange}
                        onChange={e => { const u = [...results]; u[idx] = { ...u[idx], normalRange: e.target.value }; setResults(u); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Status</label>
                      <select
                        className="form-input"
                        value={r.status}
                        onChange={e => { const u = [...results]; u[idx] = { ...u[idx], status: e.target.value }; setResults(u); }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={saveResults} className="btn btn-success btn-lg w-full">Save Results & Mark Complete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Results Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Lab Report</h3>
                <p className="text-sm text-blue-600">{viewOrder.patientNo} - {viewOrder.patientName}</p>
                <p className="text-xs text-slate-400">Ordered by {viewOrder.orderedBy} on {viewOrder.date}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="space-y-2">
              <table className="data-table">
                <thead>
                  <tr><th>Test Name</th><th>Value</th><th>Unit</th><th>Normal Range</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {viewOrder.results.map((r, i) => (
                    <tr key={i}>
                      <td className="font-medium">{r.testName}</td>
                      <td className="font-bold">{r.value}</td>
                      <td>{r.unit}</td>
                      <td className="text-sm text-slate-500">{r.normalRange}</td>
                      <td>
                        <span className={`badge ${r.status === 'Normal' ? 'badge-green' : r.status === 'High' ? 'badge-rose' : 'badge-amber'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
