'use client';
import { useState, useEffect } from 'react';
import { getPendingLabOrders, getLabOrders, updateLabOrder, genId, todayStr, timeStr } from '@/lib/store';
import type { LabOrder, LabResult } from '@/lib/types';

export default function LabPage() {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [resultOrder, setResultOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState<{testName:string;value:string;unit:string;normalRange:string;status:string}[]>([]);

  const showToast=(msg:string,type:'success'|'error')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  useEffect(()=>{loadOrders()},[]);

  const loadOrders=()=>{
    const all=getLabOrders();
    setOrders(tab==='pending'?all.filter(o=>o.status!=='Completed'):all.filter(o=>o.status==='Completed'));
  };
  useEffect(()=>{loadOrders()},[tab]);

  const openResult=(order:LabOrder)=>{
    setResultOrder(order);
    setResults(order.tests.map(t=>({testName:t.testName,value:'',unit:'',normalRange:'',status:'Normal'})));
  };

  const saveResults=()=>{
    if(!resultOrder)return;
    const filled=results.filter(r=>r.value.trim()!=='');
    if(filled.length===0){showToast('Enter at least one result','error');return}
    const labResults:LabResult[]=filled.map(r=>({testName:r.testName,value:r.value,unit:r.unit||'-',normalRange:r.normalRange||'-',status:(r.status||'Normal') as 'Normal'|'Low'|'High'}));
    updateLabOrder(resultOrder.id,{status:'Completed',results:labResults});
    setResultOrder(null);loadOrders();
    showToast('Lab results saved!','success');
  };

  return (
    <div className="space-y-5">
      {toast&&<div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laboratory</h2>
          <p className="text-sm text-slate-500">Doctor-ordered lab tests. Enter results when ready.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setTab('pending')} className={`btn ${tab==='pending'?'btn-primary':'btn-outline'}`}>Pending ({getPendingLabOrders().length})</button>
          <button onClick={()=>setTab('completed')} className={`btn ${tab==='completed'?'btn-primary':'btn-outline'}`}>Completed</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Patient No</th><th>Patient Name</th><th>Tests Ordered</th><th>Ordered By</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id}>
                  <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                  <td className="font-medium">{o.patientName}</td>
                  <td><div className="flex flex-wrap gap-1">{o.tests.map((t,i)=><span key={i} className="badge badge-blue">{t.testName}</span>)}</div></td>
                  <td className="text-sm">{o.orderedBy}</td>
                  <td>{o.date}</td><td>{o.time}</td>
                  <td><span className={`badge ${o.status==='Pending'?'badge-amber':o.status==='In Progress'?'badge-blue':'badge-green'}`}>{o.status}</span></td>
                  <td>{o.status!=='Completed'&&<button onClick={()=>openResult(o)} className="btn btn-primary btn-sm">Enter Results</button>}</td>
                </tr>
              ))}
              {orders.length===0&&<tr><td colSpan={8} className="text-center py-8 text-slate-400">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Results Modal */}
      {resultOrder&&(
        <div className="modal-overlay" onClick={()=>setResultOrder(null)}>
          <div className="modal-content" style={{maxWidth:'700px'}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-lg font-bold">Enter Lab Results</h3><p className="text-sm text-blue-600">{resultOrder.patientNo} - {resultOrder.patientName}</p></div>
              <button onClick={()=>setResultOrder(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="space-y-3">
              {results.map((r,idx)=>(
                <div key={idx} className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-sm text-slate-700 mb-2">{r.testName}</div>
                  <div className="grid grid-cols-5 gap-2">
                    <div><label className="text-xs text-slate-500">Value</label><input className="form-input" value={r.value} onChange={e=>{const u=[...results];u[idx]={...u[idx],value:e.target.value};setResults(u)}}/></div>
                    <div><label className="text-xs text-slate-500">Unit</label><input className="form-input" placeholder="mg/dL" value={r.unit} onChange={e=>{const u=[...results];u[idx]={...u[idx],unit:e.target.value};setResults(u)}}/></div>
                    <div><label className="text-xs text-slate-500">Normal</label><input className="form-input" placeholder="70-100" value={r.normalRange} onChange={e=>{const u=[...results];u[idx]={...u[idx],normalRange:e.target.value};setResults(u)}}/></div>
                    <div><label className="text-xs text-slate-500">Status</label><select className="form-input" value={r.status} onChange={e=>{const u=[...results];u[idx]={...u[idx],status:e.target.value};setResults(u)}}><option>Normal</option><option>Low</option><option>High</option></select></div>
                  </div>
                </div>
              ))}
              <button onClick={saveResults} className="btn btn-success btn-lg w-full">Save Results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
