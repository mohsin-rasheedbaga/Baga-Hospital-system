'use client';
import { useState, useEffect } from 'react';
import { searchPatients, getPatientByNo, getVisitsByPatient, getActiveVisitByPatient, addLabOrder, addPrescription, addXRayOrder, addUltrasoundOrder, updateVisit, updatePatient, getPrescriptionsByPatient, getLabOrdersByPatient, searchMedicines, genId, todayStr, timeStr, addAdmission, getAdmissionsByPatient, getHospitalSettings, getXRayOrders, getUltrasoundOrders } from '@/lib/store';
import type { Patient, Visit, LabOrder, Prescription, Admission, MedicineItem, XRayOrder, UltrasoundOrder } from '@/lib/types';

const LAB_TESTS = ['CBC', 'Blood Sugar (Fasting)', 'Blood Sugar (Random)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Urine Routine', 'Urine Culture', 'Thyroid Panel (T3,T4,TSH)', 'Lipid Profile', 'HbA1c', 'ESR', 'CRP', 'HIV', 'Hepatitis B', 'Hepatitis C', 'Dengue NS1', 'Electrolytes', 'Vitamin D', 'Iron Studies', 'Blood Group', 'PT/INR'];
const TIMING_OPTIONS = ['Before Breakfast','After Breakfast','Before Lunch','After Lunch','Before Dinner','After Dinner','At Bedtime','Every 6 Hours','Every 8 Hours','SOS','After Meal','Before Meal','Empty Stomach'];
const DURATION_OPTIONS = ['3 days','5 days','7 days','10 days','15 days','30 days','As needed'];

export default function DoctorPage() {
  // Session
  const [session, setSession] = useState<{ userId: string; name: string; role: string; department: string } | null>(null);

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
  const [rxMeds, setRxMeds] = useState<{name:string;form:string;strength:string;qtyPerDay:string;timing:string;duration:string;instructions:string;price:number;selected:boolean}[]>([]);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState<MedicineItem[]>([]);
  const [rxNotes, setRxNotes] = useState('');
  const [xrayType, setXrayType] = useState('');
  const [usgType, setUsgType] = useState('');
  const [pLabOrders, setPLabOrders] = useState<LabOrder[]>([]);
  const [pPrescriptions, setPPrescriptions] = useState<Prescription[]>([]);
  const [pXRayOrders, setPXRayOrders] = useState<XRayOrder[]>([]);
  const [pUltrasoundOrders, setPUltrasoundOrders] = useState<UltrasoundOrder[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  // Admission fields (doctor chooses date + purpose + fee)
  const [admissionPurpose, setAdmissionPurpose] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionNotes, setAdmissionNotes] = useState('');
  const [admissionFee, setAdmissionFee] = useState('');

  const showToast = (msg:string,type:'success'|'error')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  useEffect(() => {
    try {
      const s = localStorage.getItem('baga_session');
      if (s) setSession(JSON.parse(s));
    } catch {}
  }, []);

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
    setAdmissionPurpose('');setAdmissionDate('');setAdmissionNotes('');setAdmissionFee('');
    const ev=getActiveVisitByPatient(p.id);
    if(ev){setActiveVisit(ev);setDiagnosis(ev.diagnosis||'');setNotes(ev.notes||'');setVitals(ev.vitals||{bp:'',pulse:'',temp:'',weight:''});}
    else{
      const dept = session?.department || 'General';
      const docName = session?.name || 'Current Doctor';
      const nv:Visit={id:genId(),patientId:p.id,patientNo:p.patientNo,patientName:p.name,department:dept,doctor:docName,doctorFee:0,date:todayStr(),time:timeStr(),tokenNo:0,status:'Active',diagnosis:'',notes:'',vitals:{bp:'',pulse:'',temp:'',weight:''}};
      setActiveVisit(nv);
    }
    setPLabOrders(getLabOrdersByPatient(p.id));
    setPPrescriptions(getPrescriptionsByPatient(p.id));
    setPXRayOrders(getXRayOrders().filter(o => o.patientId === p.id));
    setPUltrasoundOrders(getUltrasoundOrders().filter(o => o.patientId === p.id));
    setAdmissions(getAdmissionsByPatient(p.id));
    setTab('info');
  };

  const saveVitals=()=>{if(!activeVisit)return;updateVisit(activeVisit.id,{vitals});showToast('Vitals saved!','success')};
  const saveDiagnosis=()=>{if(!activeVisit)return;updateVisit(activeVisit.id,{diagnosis,notes});showToast('Diagnosis saved!','success')};

  const orderLabTests=()=>{
    if(!activeVisit||selectedTests.length===0){showToast('Select tests','error');return}
    const docName = session?.name || 'Current Doctor';
    addLabOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,tests:selectedTests.map(t=>({testName:t,price:0,selected:true})),orderedBy:docName,date:todayStr(),time:timeStr(),status:'Pending',results:[]});
    setSelectedTests([]);setPLabOrders(getLabOrdersByPatient(selectedPatient!.id));
    showToast(`${selectedTests.length} test(s) ordered!`,'success');
  };

  const addMedFromSearch=(med:MedicineItem)=>{
    setRxMeds([...rxMeds,{name:med.name,form:med.form,strength:med.strength,qtyPerDay:'1',timing:'',duration:'',instructions:'',price:med.price,selected:true}]);
    setMedSearchQuery('');setMedSearchResults([]);
  };
  const updateRxMed=(idx:number,field:string,value:string)=>{const u=[...rxMeds];u[idx]={...u[idx],[field]:value};setRxMeds(u);};

  const saveRx=()=>{
    if(!activeVisit||rxMeds.length===0){showToast('Add medicines','error');return}
    const docName = session?.name || 'Current Doctor';
    addPrescription({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,medicines:rxMeds.map(m=>({...m,dosage:`${m.qtyPerDay} ${m.form.toLowerCase()}(s)`,frequency:m.timing})),prescribedBy:docName,date:todayStr(),time:timeStr(),status:'Active',notes:rxNotes});
    setRxMeds([]);setRxNotes('');setPPrescriptions(getPrescriptionsByPatient(selectedPatient!.id));
    showToast('Prescription saved!','success');
  };

  const orderXR=()=>{
    if(!activeVisit||!xrayType){showToast('Select type','error');return}
    const docName = session?.name || 'Current Doctor';
    addXRayOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,xrayType,price:0,selected:true,orderedBy:docName,date:todayStr(),status:'Pending'});
    setXrayType('');setPXRayOrders(getXRayOrders().filter(o => o.patientId === selectedPatient!.id));showToast('X-Ray ordered!','success');
  };

  const orderUSG=()=>{
    if(!activeVisit||!usgType){showToast('Select type','error');return}
    const docName = session?.name || 'Current Doctor';
    addUltrasoundOrder({id:genId(),visitId:activeVisit.id,patientId:selectedPatient!.id,patientNo:selectedPatient!.patientNo,patientName:selectedPatient!.name,usgType,price:0,selected:true,orderedBy:docName,date:todayStr(),status:'Pending'});
    setUsgType('');setPUltrasoundOrders(getUltrasoundOrders().filter(o => o.patientId === selectedPatient!.id));showToast('Ultrasound ordered!','success');
  };

  // Doctor approves admission - department & doctor auto from session
  const handleAdmission = () => {
    if (!selectedPatient || !admissionPurpose) { showToast('Please select admission purpose', 'error'); return; }
    const dept = session?.department || 'General';
    const docName = session?.name || 'Current Doctor';
    const fee = parseFloat(admissionFee) || 0;
    addAdmission({
      id: genId(),
      patientId: selectedPatient.id,
      patientNo: selectedPatient.patientNo,
      patientName: selectedPatient.name,
      department: dept,
      doctor: docName,
      doctorFee: fee,
      admissionDate: admissionDate || todayStr(),
      admittedAt: '',
      dischargedAt: '',
      purpose: admissionPurpose,
      roomNo: '',
      roomTypeId: '',
      roomChargesPerNight: 0,
      status: 'Approved',
      notes: admissionNotes,
      createdAt: todayStr(),
      approvedBy: docName,
    });
    setAdmissions(getAdmissionsByPatient(selectedPatient.id));
    setAdmissionPurpose('');setAdmissionDate('');setAdmissionNotes('');setAdmissionFee('');
    showToast('Admission Approved! Reception has been notified.', 'success');
  };

  const discharge=()=>{
    if(!activeVisit||!selectedPatient)return;
    if(!confirm(`Discharge ${selectedPatient.name}?`))return;
    updateVisit(activeVisit.id,{status:'Discharged',diagnosis,notes});
    updatePatient(selectedPatient.id,{lastVisit:todayStr(),totalVisits:selectedPatient.totalVisits+1});
    setActiveVisit(null);setSelectedPatient(null);showToast('Patient discharged!','success');
  };

  const tabs=[{key:'info',label:'Info'},{key:'vitals',label:'Vitals'},{key:'prescribe',label:'Medication'},{key:'admission',label:'Admission'},{key:'notes',label:'Diagnosis'},{key:'reports',label:'Reports'},{key:'history',label:'History'}];

  const doctorName = session?.name || 'Doctor';
  const doctorDept = session?.department || 'General';
  const currency = getHospitalSettings().currency;

  return (
    <div className="space-y-5">
      {toast&&<div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}

      {/* Doctor Info Banner */}
      {session && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{doctorName.charAt(0)}</div>
          <div>
            <p className="font-semibold text-purple-800 text-sm">{doctorName}</p>
            <p className="text-xs text-purple-500">Department: {doctorDept}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border-2 border-purple-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Search Patient - Card Number / Mobile</h2>
        <div className="flex gap-3">
          <input className="form-input flex-1 text-lg" placeholder="Enter card number (BAGA-0001) or mobile number..."
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
                {/* Medicine Search from Pharmacy */}
                <div className="relative">
                  <label className="form-label">Search & Add Medicine from Pharmacy</label>
                  <div className="flex items-center gap-2 border-2 border-purple-200 rounded-lg px-3 py-2 bg-white focus-within:border-purple-500 transition-colors">
                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      className="flex-1 outline-none text-sm bg-transparent placeholder:text-slate-400"
                      placeholder="Type medicine name, generic name, or category..."
                      value={medSearchQuery}
                      onChange={e=>{const q=e.target.value;setMedSearchQuery(q);if(q.trim().length>1){setMedSearchResults(searchMedicines(q.trim()))}else{setMedSearchResults([])}}}
                      onFocus={()=>{if(medSearchQuery.trim().length>1)setMedSearchResults(searchMedicines(medSearchQuery.trim()))}}
                      onBlur={()=>setTimeout(()=>setMedSearchResults([]),200)}
                    />
                    {medSearchQuery&&(
                      <button onClick={()=>{setMedSearchQuery('');setMedSearchResults([])}} className="text-slate-400 hover:text-slate-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {/* Search Results Dropdown */}
                  {medSearchResults.length>0&&(
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {medSearchResults.map(med=>(
                        <button
                          key={med.id}
                          onClick={()=>addMedFromSearch(med)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-50 border-b border-slate-100 last:border-b-0 transition-colors text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm truncate">{med.name} <span className="text-slate-400 font-normal">{med.genericName!==med.name?`(${med.genericName})`:''}</span></p>
                            <p className="text-xs text-slate-500 mt-0.5">{med.form} &middot; {med.strength} &middot; {med.packing}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="font-bold text-purple-700">{currency}{med.price}</p>
                            <span className="badge badge-blue text-xs">{med.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {medSearchQuery.trim().length>1&&medSearchResults.length===0&&(
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-center text-slate-400 text-sm">
                      No medicines found matching &ldquo;{medSearchQuery}&rdquo;
                    </div>
                  )}
                </div>

                {/* Prescription Table */}
                {rxMeds.length>0&&(
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                          <th className="px-3 py-2.5 text-left font-semibold w-8">#</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Medicine</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Form</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Strength</th>
                          <th className="px-3 py-2.5 text-left font-semibold w-20">Qty/Day</th>
                          <th className="px-3 py-2.5 text-left font-semibold min-w-[170px]">Timing</th>
                          <th className="px-3 py-2.5 text-left font-semibold min-w-[120px]">Duration</th>
                          <th className="px-3 py-2.5 text-left font-semibold min-w-[150px]">Instructions</th>
                          <th className="px-3 py-2.5 text-left font-semibold w-20">Price</th>
                          <th className="px-3 py-2.5 text-center font-semibold w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rxMeds.map((med,idx)=>(
                          <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2 text-slate-400 font-medium text-xs">{idx+1}</td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-slate-800">{med.name}</span>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{med.form}</td>
                            <td className="px-3 py-2 text-slate-600 font-mono text-xs">{med.strength}</td>
                            <td className="px-3 py-2">
                              <input className="form-input py-1 text-sm text-center" type="number" min="1" max="10" value={med.qtyPerDay} onChange={e=>updateRxMed(idx,'qtyPerDay',e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <select className="form-input py-1 text-sm" value={med.timing} onChange={e=>updateRxMed(idx,'timing',e.target.value)}>
                                <option value="">-- Select --</option>
                                {TIMING_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select className="form-input py-1 text-sm" value={med.duration} onChange={e=>updateRxMed(idx,'duration',e.target.value)}>
                                <option value="">-- Select --</option>
                                {DURATION_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input className="form-input py-1 text-sm" placeholder="e.g. Take with water" value={med.instructions} onChange={e=>updateRxMed(idx,'instructions',e.target.value)} />
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{currency}{med.price}</td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={()=>setRxMeds(rxMeds.filter((_,i)=>i!==idx))} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors" title="Remove medicine">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t-2 border-slate-200">
                          <td colSpan={8} className="px-3 py-2.5 text-right font-bold text-slate-700">Total:</td>
                          <td className="px-3 py-2.5 font-extrabold text-purple-700">{currency}{rxMeds.reduce((s,m)=>s+m.price,0)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {rxMeds.length===0&&(
                  <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <p className="font-medium">Search and add medicines from the pharmacy above</p>
                    <p className="text-xs mt-1">Type at least 2 characters to search</p>
                  </div>
                )}

                {/* Notes & Save */}
                <div>
                  <label className="form-label">Prescription Notes</label>
                  <textarea className="form-input" rows={2} value={rxNotes} onChange={e=>setRxNotes(e.target.value)} placeholder="Additional instructions for patient..." />
                </div>
                <button onClick={saveRx} className="btn btn-success btn-lg w-full" disabled={rxMeds.length===0}>
                  💊 Save Prescription ({rxMeds.length} medicine{rxMeds.length!==1?'s':''})
                </button>

                {/* Previous Prescriptions */}
                {pPrescriptions.length>0&&(
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3 text-slate-700">📋 Previous Prescriptions</h4>
                    {pPrescriptions.map(rx=>(
                      <div key={rx.id} className="border border-slate-200 rounded-lg p-3 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">{rx.date} {rx.time} — {rx.prescribedBy}</span>
                          <span className={`badge ${rx.status==='Active'?'badge-blue':'badge-green'}`}>{rx.status}</span>
                        </div>
                        {rx.notes&&<p className="text-xs text-slate-400 mt-1 italic">{rx.notes}</p>}
                        <div className="overflow-x-auto mt-2">
                          <table className="data-table">
                            <thead><tr><th>#</th><th>Medicine</th><th>Form</th><th>Strength</th><th>Qty</th><th>Timing</th><th>Duration</th></tr></thead>
                            <tbody>
                              {rx.medicines.map((m,i)=>(
                                <tr key={i}>
                                  <td className="text-slate-400 text-xs">{i+1}</td>
                                  <td className="font-medium">{m.name}</td>
                                  <td>{m.form||'-'}</td>
                                  <td className="font-mono text-xs">{m.strength||'-'}</td>
                                  <td>{m.qtyPerDay||m.dosage||'-'}</td>
                                  <td>{m.timing||m.frequency||'-'}</td>
                                  <td>{m.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab==='admission'&&(
              <div className="space-y-4">
                {/* Doctor Admission - Department & Doctor AUTO from session */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-amber-800 text-sm uppercase tracking-wide">Patient Admission - Doctor Approval</h3>
                  <p className="text-xs text-amber-600 mt-1">Doctor approves admission. Department and doctor name are auto-filled from your profile.</p>
                </div>

                {/* Auto Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Department (Auto)</p>
                    <p className="font-bold text-purple-700">{doctorDept}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Doctor Name (Auto)</p>
                    <p className="font-bold text-purple-700">{doctorName}</p>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-500">Patient</p>
                  <p className="font-bold text-blue-800">{selectedPatient.patientNo} - {selectedPatient.name}</p>
                </div>

                {/* Doctor selects: Date, Purpose & Fee */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Admission Date *</label>
                    <input className="form-input" type="date" value={admissionDate} onChange={e=>setAdmissionDate(e.target.value)} />
                    <p className="text-xs text-slate-400 mt-1">Select the admission date</p>
                  </div>
                  <div>
                    <label className="form-label">Purpose *</label>
                    <select className="form-input" value={admissionPurpose} onChange={e=>setAdmissionPurpose(e.target.value)}>
                      <option value="">-- Select Purpose --</option>
                      <option>Surgery</option>
                      <option>Checkup</option>
                      <option>Delivery</option>
                      <option>Emergency</option>
                      <option>Observation</option>
                      <option>ICU</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Doctor Fee ({currency})</label>
                    <input className="form-input" type="number" min="0" placeholder="e.g. 5000" value={admissionFee} onChange={e=>setAdmissionFee(e.target.value)} />
                    <p className="text-xs text-slate-400 mt-1">Admission / surgery fee amount</p>
                  </div>
                </div>

                <div>
                  <label className="form-label">Doctor Notes</label>
                  <textarea className="form-input" rows={3} value={admissionNotes} onChange={e=>setAdmissionNotes(e.target.value)} placeholder="Enter admission notes... e.g. type of surgery, reason for admission, etc."/>
                </div>

                <button onClick={handleAdmission} className="btn btn-success btn-lg w-full">
                  Approve Admission
                </button>
                <p className="text-xs text-center text-slate-400">After approval, reception will be notified to process the admission</p>

                {/* Previous Admissions */}
                {admissions.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Patient Admission History</h4>
                    {admissions.map(a => (
                      <div key={a.id} className={`border rounded-lg p-3 mb-2 ${a.status === 'Approved' ? 'border-amber-200 bg-amber-50' : a.status === 'Admitted' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="flex justify-between">
                          <span className="font-medium">{a.purpose}</span>
                          <span className={`badge ${a.status === 'Approved' ? 'badge-amber' : a.status === 'Admitted' ? 'badge-blue' : 'badge-green'}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Date: {a.admissionDate} | Dept: {a.department} | Doctor: {a.doctor}
                          {a.roomNo && ` | Room: ${a.roomNo}`}
                          {a.doctorFee > 0 && ` | Fee: ${currency}${a.doctorFee}`}
                        </div>
                        {a.notes && <div className="text-sm text-slate-500 mt-1">Notes: {a.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="space-y-6">
                {/* Lab Reports Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Lab Reports
                  </h3>
                  {pLabOrders.length===0&&<p className="text-slate-400 text-center py-4">No lab reports yet</p>}
                  {pLabOrders.map(o=>(
                    <div key={o.id} className="border border-slate-200 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">{o.date} {o.time}</span>
                        <span className={`badge ${o.status==='Completed'?'badge-green':'badge-amber'}`}>{o.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {o.tests.map((t,i)=><span key={i} className="badge badge-blue">{t.testName}</span>)}
                      </div>
                      {o.status==='Completed'&&o.results&&o.results.length>0&&(
                        <div className="mt-3 overflow-x-auto">
                          <table className="data-table text-sm">
                            <thead><tr><th>Test</th><th>Result</th><th>Reference</th></tr></thead>
                            <tbody>
                              {o.results.map((r,i)=>(
                                <tr key={i}>
                                  <td className="font-medium">{r.testName}</td>
                                  <td className="font-mono">{r.value||'-'} {r.unit}</td>
                                  <td className="text-slate-500 text-xs">{r.normalRange||'-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* X-Ray Reports Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    X-Ray Reports
                  </h3>
                  {pXRayOrders.length===0&&<p className="text-slate-400 text-center py-4">No X-Ray reports yet</p>}
                  {pXRayOrders.map(o=>(
                    <div key={o.id} className="border border-slate-200 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-slate-800">{o.xrayType}</span>
                          <span className="text-sm text-slate-500 ml-2">{o.date}</span>
                        </div>
                        <span className={`badge ${o.status==='Completed'?'badge-green':o.status==='In Progress'?'badge-blue':'badge-amber'}`}>{o.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Ordered by: {o.orderedBy}</div>
                      {o.status==='Completed'&&o.report&&(
                        <div className="mt-2 bg-slate-50 rounded-lg p-3 text-sm text-slate-700 border border-slate-100">
                          <p className="font-medium text-slate-600 mb-1">Report:</p>
                          <p className="whitespace-pre-wrap">{o.report}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ultrasound Reports Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Ultrasound Reports
                  </h3>
                  {pUltrasoundOrders.length===0&&<p className="text-slate-400 text-center py-4">No ultrasound reports yet</p>}
                  {pUltrasoundOrders.map(o=>(
                    <div key={o.id} className="border border-slate-200 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-slate-800">{o.usgType}</span>
                          <span className="text-sm text-slate-500 ml-2">{o.date}</span>
                        </div>
                        <span className={`badge ${o.status==='Completed'?'badge-green':o.status==='In Progress'?'badge-blue':'badge-amber'}`}>{o.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Ordered by: {o.orderedBy}</div>
                      {o.status==='Completed'&&o.report&&(
                        <div className="mt-2 bg-slate-50 rounded-lg p-3 text-sm text-slate-700 border border-slate-100">
                          <p className="font-medium text-slate-600 mb-1">Report:</p>
                          <p className="whitespace-pre-wrap">{o.report}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Prescriptions Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Prescriptions
                  </h3>
                  {pPrescriptions.length===0&&<p className="text-slate-400 text-center py-4">No prescriptions yet</p>}
                  {pPrescriptions.map(rx=>(
                    <div key={rx.id} className="border border-slate-200 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">{rx.date} {rx.time} — {rx.prescribedBy}</span>
                        <span className={`badge ${rx.status==='Active'?'badge-blue':'badge-green'}`}>{rx.status}</span>
                      </div>
                      <table className="data-table mt-2"><thead><tr><th>Medicine</th><th>Form</th><th>Strength</th><th>Qty</th><th>Timing</th><th>Duration</th></tr></thead><tbody>{rx.medicines.map((m,i)=><tr key={i}><td className="font-medium">{m.name}</td><td>{m.form||'-'}</td><td>{m.strength||'-'}</td><td>{m.qtyPerDay||m.dosage||'-'}</td><td>{m.timing||m.frequency||'-'}</td><td>{m.duration}</td></tr>)}</tbody></table>
                      {rx.notes&&<p className="text-xs text-slate-400 mt-2 italic">Notes: {rx.notes}</p>}
                    </div>
                  ))}
                </div>
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
