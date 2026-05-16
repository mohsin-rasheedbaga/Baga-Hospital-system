'use client';
import { useState, useEffect } from 'react';
import { searchPatients, getPatientByNo, getVisitsByPatient, getActiveVisitByPatient, addLabOrder, addPrescriptionItem, addXRayOrder, addUltrasoundOrder, updateVisit, updatePatient, getPrescriptionsByPatient, getLabOrdersByPatient, genId, todayStr, timeStr } from '@/lib/store';
import type { Patient, Visit, LabOrder, Prescription } from '@/lib/types';

const LAB_TESTS = ['CBC', 'Blood Sugar (Fasting)', 'Blood Sugar (Random)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Urine Routine', 'Urine Culture', 'Thyroid Panel (T3,T4,TSH)', 'Lipid Profile', 'HbA1c', 'ESR', 'CRP', 'HIV', 'Hepatitis B', 'Hepatitis C', 'Dengue NS1', 'Electrolytes', 'Vitamin D', 'Iron Studies', 'Blood Group', 'PT/INR'];
const MEDICINES_LIST = ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Amoxicillin 250mg', 'Azithromycin 500mg', 'Omeprazole 20mg', 'Cetirizine 10mg', 'Metformin 500mg', 'Amlodipine 5mg', 'Ciprofloxacin 500mg', 'Diclofenac 50mg', 'Pantoprazole 40mg', 'Ranitidine 150mg', 'Domperidone 10mg', 'Antacid Syrup', 'ORS', 'Vitamin C 500mg', 'Multivitamin', 'Calcium + Vitamin D', 'Aspirin 75mg', 'Clopidogrel 75mg', 'Atorvastatin 10mg', 'Salbutamol Inhaler', 'Montelukast 10mg'];

export default function DoctorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [vitals, setVitals] = useState({bp:'',pulse:'',temp:'',weight:''});
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [rxMeds, setRxMeds] = useState<{name:string;dosage:string;duration:string;frequency:string;instructions:string}[]>([]);
  const [rxNotes, setRxNotes] = useState('');
  const [xrayType, setXrayType] = useState('');
  const [usgType, setUsgType] = useState('');
  const [pLabOrders, setPLabOrders] = useState<LabOrder[]>([]);
  const [pPrescriptions, setPPrescriptions] = useState<Prescription[]>([]);

  const showToast = (msg:string,type:'success'|'error')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  const handleSearch=()=>{
    if(!searchQuery.trim())return;
    const r=searchPatients(searchQuery.trim());
    const byNo=getPatientByNo(searchQuery.trim());
    if(byNo&&!r.find(x=>x.id===byNo.id))r.unshift(byNo);
    setSearchResults(r);
  };

  const selectPatient=(p:Patient)=>{
    setSelectedPatient(p);setSearchResults([]);
    setDiagnosis('');setNotes('');setSelectedTests([]);setRxMeds([]);setRxNotes('');setXrayType('');setUsgType('');
    setVitals({bp:'',pulse:'',temp:'',weight:''});
    const ev=getActiveVisitByPatient(p.id);
    if(ev){setActiveVisit(ev);setDiagnosis(ev.diagnosis||'');setNotes(ev.notes||'');setVitals(ev.vitals||{bp:'',pulse:'',temp:'',weight:''});}
    else{const nv:Visit={id:genId(),patientId:p.id,patientNo:p.patientNo,patientName:p.name,department:'General',doctor:'Current Doctor',doctorFee:0,date:todayStr(),time:timeStr(),status:'Active',diagnosis:'',notes:'',vitals:{bp:'',pulse:'',temp:'',weight:''}};setActiveVisit(nv);}
    setPLabOrders(getLabOrdersByPatient(p.id));
    setPPrescriptions(getPrescriptionsByPatient(p.id));
    setTab('info');
  };

  const saveVitals=()=>{if(!activeVisit)return;updateVisit(activeVisit.id,{vitals});showToast('Vitals saved!','success')};
  const saveDiagnosis=()=>{if(!activeVisit)return;updateVisit(activeVisit.id,{diagnosis,notes});showToast('Diagnosis saved!','success')};

  const orderLabTests=()=>{
    if(!activeVisit||selectedTests.length===0){showToast('Select tests','error');return}
    addLabOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,testNames:selectedTests,orderedBy:'Current Doctor',date:todayStr(),time:timeStr(),status:'Pending',results:[]});
    setSelectedTests([]);setPLabOrders(getLabOrdersByPatient(selectedPatient!.id));
    showToast(`${selectedTests.length} test(s) ordered!`,'success');
  };

  const saveRx=()=>{
    if(!activeVisit||rxMeds.length===0){showToast('Add medicines','error');return}
    addPrescriptionItem({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,medicines:rxMeds,prescribedBy:'Current Doctor',date:todayStr(),time:timeStr(),status:'Active',notes:rxNotes});
    setRxMeds([]);setRxNotes('');setPPrescriptions(getPrescriptionsByPatient(selectedPatient!.id));
    showToast('Prescription saved!','success');
  };

  const orderXR=()=>{if(!activeVisit||!xrayType){showToast('Select type','error');return}addXRayOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,xrayType,orderedBy:'Current Doctor',date:todayStr(),status:'Pending'});setXrayType('');showToast('X-Ray ordered!','success')};
  const orderUSG=()=>{if(!activeVisit||!usgType){showToast('Select type','error');return}addUltrasoundOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,usgType,orderedBy:'Current Doctor',date:todayStr(),status:'Pending'});setUsgType('');showToast('Ultrasound ordered!','success')};

  const discharge=()=>{
    if(!activeVisit||!selectedPatient)return;
    if(!confirm(`Discharge ${selectedPatient.name}?`))return;
    updateVisit(activeVisit.id,{status:'Discharged',diagnosis,notes});
    updatePatient(selectedPatient.id,{lastVisit:todayStr(),totalVisits:selectedPatient.totalVisits+1});
    setActiveVisit(null);setSelectedPatient(null);showToast('Patient discharged!','success');
  };

  const tabs=[{key:'info',label:'Info'},{key:'vitals',label:'Vitals'},{key:'prescribe',label:'Prescription'},{key:'lab',label:'Lab Order'},{key:'xray',label:'X-Ray'},{key:'ultrasound',label:'USG'},{key:'notes',label:'Diagnosis'},{key:'reports',label:'Reports'},{key:'history',label:'History'}];

  return (
    <div className="space-y-5">
      {toast&&<div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}

      {/* Search */}
      <div className="bg-white rounded-xl border-2 border-purple-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Search Patient by Card Number / Mobile</h2>
        <div className="flex gap-3">
          <input className="form-input flex-1 text-lg" placeholder="BAGA-0001 or mobile number..."
            value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
          <button onClick={handleSearch} className="btn btn-primary btn-lg">Search</button>
        </div>
        {searchResults.length>0&&<div className="mt-3 space-y-2">
          {searchResults.map(p=>(
            <button key={p.id} onClick={()=>selectPatient(p)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-purple-50 transition-colors text-left">
              <div><span className="font-mono font-bold text-purple-600">{p.patientNo}</span><span className="font-semibold text-slate-800 ml-3">{p.name}</span><span className="text-sm text-slate-500 ml-2">({p.gender}, {p.age})</span></div>
              <span className="text-sm text-slate-500">{p.mobile}</span>
            </button>
          ))}
        </div>}
      </div>

      {/* Patient Panel */}
      {selectedPatient&&activeVisit&&(
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3"><span className="font-mono font-bold text-lg">{selectedPatient.patientNo}</span><span className="text-purple-200">{selectedPatient.name}</span></div>
                <div className="flex gap-4 mt-1 text-sm text-purple-200"><span>Father: {selectedPatient.fatherName}</span><span>Mobile: {selectedPatient.mobile}</span><span>Age: {selectedPatient.age}/{selectedPatient.gender}</span><span>Visits: {selectedPatient.totalVisits}</span></div>
              </div>
              <button onClick={discharge} className="btn bg-red-500 hover:bg-red-600 text-white btn-sm">Discharge</button>
            </div>
          </div>

          <div className="border-b border-slate-200 px-4 overflow-x-auto"><div className="flex gap-1">
            {tabs.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab===t.key?'border-purple-600 text-purple-600':'border-transparent text-slate-500 hover:text-slate-700'}`}>{t.label}</button>))}
          </div></div>

          <div className="p-5">
            {tab==='info'&&(
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[{l:'Patient No',v:selectedPatient.patientNo},{l:'Name',v:selectedPatient.name},{l:'Father/Husband',v:selectedPatient.fatherName},{l:'Mobile',v:selectedPatient.mobile},{l:'Age/Gender',v:`${selectedPatient.age} / ${selectedPatient.gender}`},{l:'Address',v:selectedPatient.address},{l:'Card Status',v:selectedPatient.cardStatus},{l:'Card Expiry',v:selectedPatient.cardExpiry},{l:'Total Visits',v:String(selectedPatient.totalVisits)},{l:'Last Visit',v:selectedPatient.lastVisit}].map((item,i)=>(
                  <div key={i} className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">{item.l}</p><p className="font-semibold text-slate-800">{item.v}</p></div>
                ))}
              </div>
            )}

            {tab==='vitals'&&(
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="form-label">Blood Pressure</label><input className="form-input" placeholder="120/80" value={vitals.bp} onChange={e=>setVitals({...vitals,bp:e.target.value})}/></div>
                  <div><label className="form-label">Pulse</label><input className="form-input" placeholder="72 bpm" value={vitals.pulse} onChange={e=>setVitals({...vitals,pulse:e.target.value})}/></div>
                  <div><label className="form-label">Temperature</label><input className="form-input" placeholder="98.6 F" value={vitals.temp} onChange={e=>setVitals({...vitals,temp:e.target.value})}/></div>
                  <div><label className="form-label">Weight</label><input className="form-input" placeholder="70 kg" value={vitals.weight} onChange={e=>setVitals({...vitals,weight:e.target.value})}/></div>
                </div>
                <button onClick={saveVitals} className="btn btn-primary">Save Vitals</button>
              </div>
            )}

            {tab==='prescribe'&&(
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-semibold">Prescribe Medicines</h3><button onClick={()=>setRxMeds([...rxMeds,{name:'',dosage:'',duration:'',frequency:'3 times daily',instructions:''}])} className="btn btn-primary btn-sm">+ Add Medicine</button></div>
                {rxMeds.length===0&&<p className="text-slate-400 text-center py-4">No medicines added</p>}
                {rxMeds.map((med,idx)=>(
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between mb-3"><span className="font-semibold text-sm text-slate-600">Medicine #{idx+1}</span><button onClick={()=>setRxMeds(rxMeds.filter((_,i)=>i!==idx))} className="text-red-500 text-sm">Remove</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div><label className="form-label">Medicine</label><select className="form-input" value={med.name} onChange={e=>{const u=[...rxMeds];u[idx]={...u[idx],name:e.target.value};setRxMeds(u)}}><option value="">-- Select --</option>{MEDICINES_LIST.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className="form-label">Dosage</label><input className="form-input" placeholder="1 tablet" value={med.dosage} onChange={e=>{const u=[...rxMeds];u[idx]={...u[idx],dosage:e.target.value};setRxMeds(u)}}/></div>
                      <div><label className="form-label">Duration</label><input className="form-input" placeholder="5 days" value={med.duration} onChange={e=>{const u=[...rxMeds];u[idx]={...u[idx],duration:e.target.value};setRxMeds(u)}}/></div>
                      <div><label className="form-label">Frequency</label><select className="form-input" value={med.frequency} onChange={e=>{const u=[...rxMeds];u[idx]={...u[idx],frequency:e.target.value};setRxMeds(u)}}><option>Once daily</option><option>Twice daily</option><option>3 times daily</option><option>After meal</option><option>Before meal</option><option>SOS</option></select></div>
                      <div className="md:col-span-2"><label className="form-label">Instructions</label><input className="form-input" placeholder="Take with water" value={med.instructions} onChange={e=>{const u=[...rxMeds];u[idx]={...u[idx],instructions:e.target.value};setRxMeds(u)}}/></div>
                    </div>
                  </div>
                ))}
                <div><label className="form-label">Notes</label><textarea className="form-input" rows={2} value={rxNotes} onChange={e=>setRxNotes(e.target.value)}/></div>
                <button onClick={saveRx} className="btn btn-success btn-lg">Save Prescription</button>
              </div>
            )}

            {tab==='lab'&&(
              <div className="space-y-4">
                <h3 className="font-semibold">Order Lab Tests</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {LAB_TESTS.map(test=>(<button key={test} onClick={()=>setSelectedTests(selectedTests.includes(test)?selectedTests.filter(t=>t!==test):[...selectedTests,test])} className={`p-2 rounded-lg border text-sm text-left transition-colors ${selectedTests.includes(test)?'border-purple-500 bg-purple-50 text-purple-700 font-medium':'border-slate-200 hover:border-slate-300 text-slate-600'}`}>{selectedTests.includes(test)&&<span className="mr-1">&#10003;</span>}{test}</button>))}
                </div>
                {selectedTests.length>0&&<p className="text-sm text-purple-600 font-medium">{selectedTests.length} test(s) selected</p>}
                <button onClick={orderLabTests} className="btn btn-success btn-lg" disabled={selectedTests.length===0}>Order Lab Tests</button>
                {pLabOrders.length>0&&<div className="mt-4 border-t pt-4"><h4 className="font-semibold text-sm mb-2">Previous Orders</h4>{pLabOrders.map(o=>(<div key={o.id} className="border border-slate-200 rounded-lg p-3 mb-2"><div className="flex justify-between"><span className="text-sm text-slate-500">{o.date} {o.time}</span><span className={`badge ${o.status==='Completed'?'badge-green':'badge-amber'}`}>{o.status}</span></div><div className="flex flex-wrap gap-1 mt-1">{o.testNames.map((t,i)=><span key={i} className="badge badge-blue">{t}</span>)}</div></div>))}</div>}
              </div>
            )}

            {tab==='xray'&&(
              <div className="space-y-4">
                <h3 className="font-semibold">Order X-Ray</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Chest X-Ray','Knee X-Ray (Both)','Spine X-Ray (Lumbar)','Pelvis X-Ray','Hand X-Ray','Foot X-Ray','Shoulder X-Ray','Abdomen X-Ray','Skull X-Ray'].map(x=>(<button key={x} onClick={()=>setXrayType(x)} className={`p-2 rounded-lg border text-sm transition-colors ${xrayType===x?'border-purple-500 bg-purple-50 text-purple-700 font-medium':'border-slate-200 hover:border-slate-300 text-slate-600'}`}>{xrayType===x&&<span className="mr-1">&#10003;</span>}{x}</button>))}
                </div>
                <button onClick={orderXR} className="btn btn-success btn-lg" disabled={!xrayType}>Order X-Ray</button>
              </div>
            )}

            {tab==='ultrasound'&&(
              <div className="space-y-4">
                <h3 className="font-semibold">Order Ultrasound</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Abdominal USG','Pelvic USG','Obstetric USG','Thyroid USG','Breast USG','Renal USG','Prostate USG','Doppler Study'].map(u=>(<button key={u} onClick={()=>setUsgType(u)} className={`p-2 rounded-lg border text-sm transition-colors ${usgType===u?'border-purple-500 bg-purple-50 text-purple-700 font-medium':'border-slate-200 hover:border-slate-300 text-slate-600'}`}>{usgType===u&&<span className="mr-1">&#10003;</span>}{u}</button>))}
                </div>
                <button onClick={orderUSG} className="btn btn-success btn-lg" disabled={!usgType}>Order Ultrasound</button>
              </div>
            )}

            {tab==='notes'&&(
              <div className="space-y-4">
                <div><label className="form-label">Diagnosis</label><textarea className="form-input" rows={3} value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} placeholder="Enter diagnosis..."/></div>
                <div><label className="form-label">Doctor Notes</label><textarea className="form-input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional notes..."/></div>
                <button onClick={saveDiagnosis} className="btn btn-primary btn-lg">Save Diagnosis</button>
              </div>
            )}

            {tab==='reports'&&(
              <div className="space-y-4">
                <h3 className="font-semibold">Lab Reports</h3>
                {pLabOrders.length===0&&<p className="text-slate-400 text-center py-4">No reports yet</p>}
                {pLabOrders.map(o=>(<div key={o.id} className="border border-slate-200 rounded-lg p-4 mb-2"><div className="flex justify-between"><span className="text-sm text-slate-500">{o.date}</span><span className={`badge ${o.status==='Completed'?'badge-green':'badge-amber'}`}>{o.status}</span></div><div className="flex flex-wrap gap-1 mt-1">{o.testNames.map((t,i)=><span key={i} className="badge badge-blue">{t}</span>)}</div></div>))}
                <h3 className="font-semibold mt-6">Prescriptions</h3>
                {pPrescriptions.length===0&&<p className="text-slate-400 text-center py-4">No prescriptions yet</p>}
                {pPrescriptions.map(rx=>(<div key={rx.id} className="border border-slate-200 rounded-lg p-4 mb-2"><div className="flex justify-between"><span className="text-sm text-slate-500">{rx.date} {rx.time}</span><span className={`badge ${rx.status==='Active'?'badge-blue':'badge-green'}`}>{rx.status}</span></div><table className="data-table mt-2"><thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Frequency</th></tr></thead><tbody>{rx.medicines.map((m,i)=><tr key={i}><td className="font-medium">{m.name}</td><td>{m.dosage}</td><td>{m.duration}</td><td>{m.frequency}</td></tr>)}</tbody></table></div>))}
              </div>
            )}

            {tab==='history'&&(
              <div><h3 className="font-semibold mb-3">Visit History</h3><p className="text-slate-400 text-center py-4">Previous visits will show here after multiple consultations</p></div>
            )}
          </div>
        </div>
      )}

      {!selectedPatient&&(
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-6xl mb-4">&#128137;</p>
          <h3 className="text-lg font-semibold text-slate-600">Search Patient to Start Consultation</h3>
          <p className="text-sm text-slate-400 mt-2">Enter card number (BAGA-0001) or mobile to search</p>
        </div>
      )}
    </div>
  );
}
