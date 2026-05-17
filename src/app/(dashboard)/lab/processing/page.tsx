'use client';
import { useState, useEffect, useRef } from 'react';
import { initLabData, getLabOrders, getLabTestById, updateLabOrder, analyzeResult, getRefRange, nowTime, todayStr, genId, type LabOrderItem, type LabResultEntry, type LabParameter } from '@/lib/lab-store';

export default function ResultEntryPage() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [orders, setOrders] = useState<LabOrderItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeTestIdx, setActiveTestIdx] = useState(0);
  const [results, setResults] = useState<LabResultEntry[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadData = () => { setOrders(getLabOrders()); };

  useEffect(() => { initLabData(); loadData(); setMounted(true); }, []);

  if (!mounted) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;

  const readyOrders = orders.filter(o => o.status === 'collected' || o.status === 'processing');
  const processingOrders = orders.filter(o => o.status === 'processing');

  const activeOrder = orders.find(o => o.id === activeOrderId);

  const startProcessing = (order: LabOrderItem) => {
    updateLabOrder(order.id, { status: 'processing' });
    setActiveOrderId(order.id);
    setActiveTestIdx(0);
    // Build empty results for all parameters of all tests
    const allResults: LabResultEntry[] = [];
    order.tests.forEach(t => {
      const testDef = getLabTestById(t.testId);
      if (testDef) {
        testDef.parameters.forEach(p => {
          allResults.push({
            testId: testDef.id,
            testName: testDef.name,
            parameter: p.name,
            value: '',
            unit: p.unit,
            refRange: getRefRange(p, order.gender),
            flag: 'Normal',
          });
        });
      }
    });
    setResults(allResults);
    loadData();
  };

  const updateResultValue = (idx: number, value: string) => {
    if (!activeOrder) return;
    const updated = [...results];
    updated[idx].value = value;
    // Auto-analyze
    const testDef = getLabTestById(updated[idx].testId);
    if (testDef) {
      const param = testDef.parameters.find(p => p.name === updated[idx].parameter);
      updated[idx].flag = analyzeResult(value, param, activeOrder.gender);
      updated[idx].refRange = getRefRange(param!, activeOrder.gender);
    }
    setResults(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx < results.length - 1) {
        const nextInput = inputRefs.current[idx + 1];
        if (nextInput) { nextInput.focus(); nextInput.select(); }
        // Check if next result is for a different test
        if (results[idx + 1].testId !== results[idx].testId) {
          const nextTestIdx = activeOrder!.tests.findIndex(t => t.testId === results[idx + 1].testId);
          if (nextTestIdx >= 0) setActiveTestIdx(nextTestIdx);
        }
      }
    }
  };

  const completeReport = () => {
    if (!activeOrder) return;
    const filled = results.filter(r => r.value.trim() !== '');
    if (filled.length === 0) { showToast('Enter at least one result value', 'error'); return; }
    // Check that all parameters have values
    const empty = results.filter(r => r.value.trim() === '');
    if (empty.length > 0) { showToast(`${empty.length} parameter(s) still empty. Fill all or remove incomplete tests.`, 'error'); return; }

    updateLabOrder(activeOrder.id, {
      status: 'completed',
      results: results,
      completedAt: nowTime(),
      completedBy: 'Lab Tech',
      paidAmount: activeOrder.totalAmount,
      paymentStatus: 'paid',
    });
    setActiveOrderId(null);
    setResults([]);
    loadData();
    showToast('Report completed successfully!', 'success');
  };

  const printPreview = () => {
    if (!activeOrder) return;
    const abnormal = results.filter(r => r.flag !== 'Normal');
    const html = `<!DOCTYPE html><html><head><title>Lab Report - ${activeOrder.patientName}</title><style>
      body{margin:0;padding:20px;font-family:Arial,sans-serif;font-size:12px;}
      .report{border:1px solid #000;padding:20px;max-width:800px;margin:0 auto;}
      .header{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px;}
      h1{margin:0;font-size:18px;} .sub{color:#555;font-size:11px;}
      .info{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:15px;}
      .info div{display:flex;gap:5px;} .label{font-weight:bold;}
      table{width:100%;border-collapse:collapse;margin:10px 0;}
      th,td{border:1px solid #999;padding:5px 8px;text-align:left;}
      th{background:#eee;font-size:11px;text-transform:uppercase;}
      .flag-normal{background:#e6ffe6;} .flag-low{background:#fff3cd;} .flag-high{background:#fdd;} .flag-critical{background:#ff6666;color:white;}
      .footer{margin-top:20px;border-top:1px solid #ccc;padding-top:10px;font-size:10px;color:#666;display:flex;justify-content:space-between;}
      @media print{body{padding:0;}}
    </style></head><body><div class="report">
      <div class="header">
        <h1>BAGA HOSPITAL - LABORATORY REPORT</h1>
        <div class="sub">Main Road, City | Tel: 0300-1234567</div>
      </div>
      <div class="info">
        <div><span class="label">Patient:</span> ${activeOrder.patientName}</div>
        <div><span class="label">ID:</span> ${activeOrder.patientNo}</div>
        <div><span class="label">Gender/Age:</span> ${activeOrder.gender} / ${activeOrder.age}</div>
        <div><span class="label">Sample:</span> ${activeOrder.sampleType}</div>
        <div><span class="label">Ordered By:</span> ${activeOrder.orderedBy}</div>
        <div><span class="label">Date:</span> ${activeOrder.date}</div>
      </div>
      ${[...new Set(results.map(r => r.testName))].map(testName => {
        const testResults = results.filter(r => r.testName === testName);
        return `<h3 style="margin:10px 0 5px;font-size:13px;">${testName}</h3>
        <table><tr><th>Parameter</th><th>Result</th><th>Unit</th><th>Ref Range</th><th>Flag</th></tr>
        ${testResults.map(r => `<tr class="flag-${r.flag.toLowerCase()}">
          <td>${r.parameter}</td><td><strong>${r.value}</strong></td><td>${r.unit}</td><td>${r.refRange}</td><td><strong>${r.flag}</strong></td>
        </tr>`).join('')}</table>`;
      }).join('')}
      <div style="margin-top:10px;padding:5px;background:#fff3cd;border-radius:4px;">
        <strong>Summary:</strong> ${results.length} parameters | ${abnormal.length} abnormal
        ${abnormal.length > 0 ? `<br/><span style="color:#d00;">Abnormal: ${abnormal.map(a => `${a.parameter} (${a.flag})`).join(', ')}</span>` : '<br/><span style="color:#16a34a;">All results are within normal limits.</span>'}
      </div>
      <div class="footer">
        <span>Report Generated: ${nowTime()}</span>
        <span>Verified by: _______________</span>
      </div>
    </div></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // Get test results for active tab
  const activeTest = activeOrder?.tests[activeTestIdx];
  const activeTestResults = activeTest ? results.filter(r => r.testId === activeTest.testId) : [];

  const getTestDefParams = (testId: string): LabParameter[] => {
    const def = getLabTestById(testId);
    return def ? def.parameters : [];
  };

  const flagClass = (flag: string) => flag === 'Normal' ? 'border-green-300 bg-green-50' : flag === 'Low' ? 'border-amber-300 bg-amber-50' : flag === 'High' ? 'border-orange-300 bg-orange-50' : 'border-red-500 bg-red-50';

  return (
    <div className="space-y-5">
      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>}

      <div>
        <h2 className="text-xl font-bold text-slate-800">Result Entry</h2>
        <p className="text-sm text-slate-500">Enter test results and complete reports</p>
      </div>

      {!activeOrder ? (
        <>
          {/* Ready to Process */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Ready to Process ({readyOrders.length})
            </h3>
            {readyOrders.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No orders ready for processing</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Tests</th><th>Sample</th><th>Urgency</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {readyOrders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <span className="font-mono font-bold text-blue-600 text-xs">{o.patientNo}</span>
                          <div className="font-medium">{o.patientName}</div>
                          <div className="text-xs text-slate-400">{o.gender} / {o.age}</div>
                        </td>
                        <td><div className="flex flex-wrap gap-1">{o.tests.map((t,i) => <span key={i} className="badge badge-blue text-xs">{t.testName}</span>)}</div></td>
                        <td className="text-sm">{o.sampleType}</td>
                        <td><span className={`badge ${o.urgency === 'stat' ? 'badge-rose' : o.urgency === 'urgent' ? 'badge-amber' : 'badge-slate'}`}>{o.urgency.toUpperCase()}</span></td>
                        <td><span className={`badge ${o.status === 'processing' ? 'badge-purple' : 'badge-blue'}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                        <td><button onClick={() => startProcessing(o)} className="btn btn-primary btn-sm">{o.status === 'processing' ? 'Continue' : 'Start Processing'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Result Entry Mode */
        <div className="space-y-5">
          {/* Patient Info Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                  {activeOrder.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{activeOrder.patientName} <span className="font-mono text-blue-600">({activeOrder.patientNo})</span></p>
                  <p className="text-sm text-slate-500">{activeOrder.gender} / {activeOrder.age} | Ordered by {activeOrder.orderedBy} | {activeOrder.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={printPreview} className="btn btn-outline btn-sm">Print Preview</button>
                <button onClick={() => { setActiveOrderId(null); setResults([]); }} className="btn btn-outline btn-sm">Back</button>
              </div>
            </div>
          </div>

          {/* Test Tabs */}
          <div className="flex flex-wrap gap-2">
            {activeOrder.tests.map((t, i) => {
              const testResults = results.filter(r => r.testId === t.testId);
              const hasAllValues = testResults.every(r => r.value.trim() !== '');
              const hasAbnormal = testResults.some(r => r.flag !== 'Normal');
              return (
                <button
                  key={i}
                  onClick={() => setActiveTestIdx(i)}
                  className={`btn btn-sm ${activeTestIdx === i ? 'btn-primary' : 'btn-outline'} ${hasAbnormal ? 'ring-2 ring-red-300' : ''}`}
                >
                  {t.testName}
                  {hasAllValues && <span className="ml-1 text-green-500">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Parameters Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">{activeTest?.testName}</h3>
              <p className="text-xs text-slate-500">Press ENTER to move to next field. Values are auto-analyzed.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{width: '30%'}}>Parameter</th>
                    <th style={{width: '20%'}}>Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTestResults.map((r, idx) => {
                    const globalIdx = results.indexOf(r);
                    const paramDef = getTestDefParams(r.testId).find(p => p.name === r.parameter);
                    return (
                      <tr key={idx} className={r.value ? flagClass(r.flag) : ''}>
                        <td className="font-medium">{r.parameter}</td>
                        <td>
                          <input
                            ref={el => { inputRefs.current[globalIdx] = el; }}
                            type="text"
                            className={`form-input text-sm ${r.value ? flagClass(r.flag) : ''}`}
                            value={r.value}
                            onChange={e => updateResultValue(globalIdx, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, globalIdx)}
                            placeholder="—"
                            style={{minWidth: '100px'}}
                          />
                        </td>
                        <td className="text-sm text-slate-500">{r.unit || '—'}</td>
                        <td className="text-sm text-slate-500">{r.refRange || '—'}</td>
                        <td>
                          <span className={`badge ${r.flag === 'Normal' ? 'badge-green' : r.flag === 'Low' ? 'badge-amber' : r.flag === 'High' ? 'badge-rose' : 'badge-red'}`}>
                            {r.flag}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={completeReport} className="btn btn-success btn-lg flex-1">Complete Report</button>
            <button onClick={printPreview} className="btn btn-outline btn-lg">Print Preview</button>
          </div>

          {/* Result Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-sm mb-2">Result Summary</h4>
            <div className="flex gap-4 text-sm">
              <span>Total Parameters: <strong>{results.length}</strong></span>
              <span>Filled: <strong className="text-green-600">{results.filter(r => r.value.trim() !== '').length}</strong></span>
              <span>Empty: <strong className="text-amber-600">{results.filter(r => r.value.trim() === '').length}</strong></span>
              <span>Abnormal: <strong className="text-red-600">{results.filter(r => r.flag !== 'Normal' && r.value.trim() !== '').length}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
