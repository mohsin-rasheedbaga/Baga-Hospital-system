'use client';
import { useState, useEffect } from 'react';
import { getActivePrescriptions, updatePrescription, addDispense, genId, todayStr, timeStr } from '@/lib/store';
import type { Prescription } from '@/lib/types';

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [dispenseRx, setDispenseRx] = useState<Prescription | null>(null);

  const showToast=(msg:string,type:'success'|'error')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  useEffect(()=>{loadRxs()},[]);
  const loadRxs=()=>{setPrescriptions(getActivePrescriptions())};

  const confirmDispense=()=>{
    if(!dispenseRx)return;
    updatePrescription(dispenseRx.id,{status:'Dispensed'});
    addDispense({id:genId(),prescriptionId:dispenseRx.id,patientNo:dispenseRx.patientNo,patientName:dispenseRx.patientName,medicines:dispenseRx.medicines.map(m=>m.name),dispensedBy:'Pharmacist',date:todayStr(),time:timeStr()});
    setDispenseRx(null);loadRxs();
    showToast('Medicines dispensed successfully!','success');
  };

  return (
    <div className="space-y-5">
      {toast&&<div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}

      <div>
        <h2 className="text-xl font-bold text-slate-800">Pharmacy</h2>
        <p className="text-sm text-slate-500">Active prescriptions from doctors. Dispense medicines to patients.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Patient No</th><th>Patient Name</th><th>Medicines</th><th>Prescribed By</th><th>Date</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {prescriptions.map(rx=>(
                <tr key={rx.id}>
                  <td className="font-mono font-bold text-blue-600">{rx.patientNo}</td>
                  <td className="font-medium">{rx.patientName}</td>
                  <td><div className="flex flex-wrap gap-1">{rx.medicines.map((m,i)=><span key={i} className="badge badge-amber">{m.name} - {m.dosage} - {m.duration}</span>)}</div></td>
                  <td className="text-sm">{rx.prescribedBy}</td>
                  <td>{rx.date}</td>
                  <td className="text-sm text-slate-500 max-w-[150px] truncate">{rx.notes||'-'}</td>
                  <td><span className="badge badge-blue">{rx.status}</span></td>
                  <td><button onClick={()=>setDispenseRx(rx)} className="btn btn-success btn-sm">Dispense</button></td>
                </tr>
              ))}
              {prescriptions.length===0&&<tr><td colSpan={8} className="text-center py-8 text-slate-400">No active prescriptions. Prescriptions will appear when doctors prescribe medicines.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispense Confirm Modal */}
      {dispenseRx&&(
        <div className="modal-overlay" onClick={()=>setDispenseRx(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Confirm Dispense</h3>
            <p className="text-sm text-blue-600 mb-4">{dispenseRx.patientNo} - {dispenseRx.patientName}</p>
            <div className="space-y-2 mb-4">
              {dispenseRx.medicines.map((m,i)=>(
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-slate-600">{m.dosage} | {m.duration} | {m.frequency}{m.instructions?` | ${m.instructions}`:''}</p>
                </div>
              ))}
            </div>
            {dispenseRx.notes&&<p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded">Notes: {dispenseRx.notes}</p>}
            <div className="flex gap-3">
              <button onClick={confirmDispense} className="btn btn-success btn-lg flex-1">Confirm Dispense</button>
              <button onClick={()=>setDispenseRx(null)} className="btn btn-outline btn-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
