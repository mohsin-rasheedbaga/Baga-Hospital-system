'use client';
import { useState, useEffect } from 'react';
import {
  getAdmissions, updateAdmission, getActiveAdmissions, todayStr, timeStr,
} from '@/lib/store';
import type { Admission } from '@/lib/types';

/* ========== MAIN COMPONENT ========== */
export default function AdmissionPage() {
  // Data from store
  const [approvedAdmissions, setApprovedAdmissions] = useState<Admission[]>([]);
  const [activeAdmissions, setActiveAdmissions] = useState<Admission[]>([]);
  const [dischargedAdmissions, setDischargedAdmissions] = useState<Admission[]>([]);
  const [allAdmissions, setAllAdmissions] = useState<Admission[]>([]);
  const [tab, setTab] = useState<'approved' | 'admitted' | 'history'>('approved');

  // UI State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [printContent, setPrintContent] = useState<string | null>(null);

  // Room assignment modal
  const [assignRoomFor, setAssignRoomFor] = useState<Admission | null>(null);
  const [roomInput, setRoomInput] = useState('');

  // View admission file
  const [viewAdmission, setViewAdmission] = useState<Admission | null>(null);

  // Load data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const all = getAdmissions();
    setAllAdmissions(all);
    setApprovedAdmissions(all.filter(a => a.status === 'Approved'));
    setActiveAdmissions(all.filter(a => a.status === 'Admitted'));
    setDischargedAdmissions(all.filter(a => a.status === 'Discharged'));
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ========= ASSIGN ROOM & ADMIT =========
  const handleAssignRoom = () => {
    if (!assignRoomFor || !roomInput.trim()) {
      showToast('Room number zaroor likhein', 'error');
      return;
    }
    updateAdmission(assignRoomFor.id, { status: 'Admitted', roomNo: roomInput.trim() });
    refreshData();
    setAssignRoomFor(null);
    setRoomInput('');
    showToast(`${assignRoomFor.patientName} - Room ${roomInput.trim()} mein admit!`, 'success');
  };

  // ========= DISCHARGE =========
  const handleDischarge = (admission: Admission) => {
    if (!confirm(`${admission.patientName} discharge karein?`)) return;
    updateAdmission(admission.id, { status: 'Discharged' });
    refreshData();
    showToast(`${admission.patientName} discharge ho gaye`, 'success');
  };

  // ========= PRINT ADMISSION FILE =========
  const handlePrintSlip = (admission: Admission) => {
    const hospital = JSON.parse(localStorage.getItem('baga_hospital') || '{}');
    const slipHtml = `
      <html><head><title>Admission File - ${admission.patientNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .file { border: 3px double #1e293b; border-radius: 8px; padding: 24px; max-width: 550px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { color: #1e293b; font-size: 22px; }
        .header p { color: #64748b; font-size: 11px; margin-top: 2px; }
        .file-title { text-align: center; font-size: 16px; font-weight: 700; color: #dc2626; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 2px; }
        .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
        .section h3 { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #cbd5e1; }
        .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .row .label { color: #64748b; }
        .row .value { color: #1e293b; font-weight: 600; }
        .status-approved { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
        .status-admitted { background: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
        .footer { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 2px solid #1e293b; }
        .footer p { font-size: 10px; color: #94a3b8; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>
        <div class="file">
          <div class="header">
            <h1>${hospital.name || 'BAGA Hospital'}</h1>
            <p>${hospital.address || 'Main Road, City'} | ${hospital.phone || ''}</p>
          </div>
          <div class="file-title">Admission File</div>

          <div class="section">
            <h3>Patient Information</h3>
            <div class="row"><span class="label">Patient No:</span><span class="value">${admission.patientNo}</span></div>
            <div class="row"><span class="label">Patient Name:</span><span class="value">${admission.patientName}</span></div>
          </div>

          <div class="section">
            <h3>Admission Details</h3>
            <div class="row"><span class="label">Department:</span><span class="value">${admission.department}</span></div>
            <div class="row"><span class="label">Doctor:</span><span class="value">${admission.doctor}</span></div>
            <div class="row"><span class="label">Admission Date:</span><span class="value">${admission.admissionDate}</span></div>
            <div class="row"><span class="label">Purpose:</span><span class="value">${admission.purpose}</span></div>
            <div class="row"><span class="label">Room No:</span><span class="value">${admission.roomNo || 'Pending'}</span></div>
            <div class="row"><span class="label">Status:</span><span class="value">${admission.status}</span></div>
          </div>

          <div class="section">
            <h3>Approval</h3>
            <div class="row"><span class="label">Approved By:</span><span class="value">${admission.approvedBy || admission.doctor}</span></div>
            <div class="row"><span class="label">Created:</span><span class="value">${admission.createdAt}</span></div>
          </div>

          ${admission.notes ? `
          <div class="section">
            <h3>Doctor Notes</h3>
            <p style="font-size:12px;color:#475569;">${admission.notes}</p>
          </div>` : ''}

          <div class="footer">
            <p>${hospital.name || 'BAGA Hospital'} - Admission File</p>
            <p>Printed: ${todayStr()} ${timeStr()}</p>
          </div>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;
    setPrintContent(slipHtml);
  };

  // ========= STATUS BADGE =========
  const statusBadge = (status: string) => {
    if (status === 'Approved') return <span className="badge badge-amber">{status}</span>;
    if (status === 'Admitted') return <span className="badge badge-green">{status}</span>;
    if (status === 'Discharged') return <span className="badge badge-blue">{status}</span>;
    return <span className="badge badge-slate">{status}</span>;
  };

  const purposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'Surgery': return <span className="badge" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>{purpose}</span>;
      case 'Emergency': return <span className="badge" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>{purpose}</span>;
      case 'ICU': return <span className="badge" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>{purpose}</span>;
      case 'Delivery': return <span className="badge" style={{background:'#faf5ff',color:'#9333ea',border:'1px solid #e9d5ff'}}>{purpose}</span>;
      case 'Checkup': return <span className="badge badge-blue">{purpose}</span>;
      case 'Observation': return <span className="badge badge-amber">{purpose}</span>;
      default: return <span className="badge badge-green">{purpose}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.msg}
        </div>
      )}

      {/* Print Slip Modal */}
      {printContent && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Admission File</h3>
              <button onClick={() => setPrintContent(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <iframe srcDoc={printContent} style={{ width: '100%', height: '650px', border: 'none' }} title="Admission Slip" />
          </div>
        </div>
      )}

      {/* Room Assignment Modal */}
      {assignRoomFor && (
        <div className="modal-overlay" onClick={() => { setAssignRoomFor(null); setRoomInput(''); }}>
          <div className="modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Room Assign Karein</h3>
            <p className="text-sm text-slate-500 mb-4">Doctor ne admission approve ki hai. Ab room assign karein.</p>

            {/* Patient Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-blue-500">Patient:</span> <span className="font-bold text-blue-800">{assignRoomFor.patientName}</span></div>
                <div><span className="text-blue-500">No:</span> <span className="font-mono font-bold text-blue-800">{assignRoomFor.patientNo}</span></div>
                <div><span className="text-blue-500">Doctor:</span> <span className="font-bold text-blue-800">{assignRoomFor.doctor}</span></div>
                <div><span className="text-blue-500">Dept:</span> <span className="font-bold text-blue-800">{assignRoomFor.department}</span></div>
                <div><span className="text-blue-500">Date:</span> <span className="font-bold text-blue-800">{assignRoomFor.admissionDate}</span></div>
                <div><span className="text-blue-500">Purpose:</span> {purposeBadge(assignRoomFor.purpose)}</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Room Number *</label>
              <input
                className="form-input text-lg"
                placeholder="e.g. 101, ICU-2, Ward-3"
                value={roomInput}
                onChange={e => setRoomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAssignRoom()}
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">Room number enter karein phir &quot;Admit Karein&quot; dabayein</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAssignRoomFor(null); setRoomInput(''); }} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleAssignRoom} className="btn btn-success flex-1">Admit Karein</button>
            </div>
          </div>
        </div>
      )}

      {/* View Admission File Modal */}
      {viewAdmission && (
        <div className="modal-overlay" onClick={() => setViewAdmission(null)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Admission File - {viewAdmission.patientNo}</h3>
              <button onClick={() => setViewAdmission(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <div className="space-y-4">
              {/* Patient Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-slate-600 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">No:</span> <span className="font-mono font-bold">{viewAdmission.patientNo}</span></div>
                  <div><span className="text-slate-400">Name:</span> <span className="font-bold">{viewAdmission.patientName}</span></div>
                </div>
              </div>

              {/* Admission Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-slate-600 mb-2">Admission Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Department:</span><span className="font-semibold">{viewAdmission.department}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Doctor:</span><span className="font-semibold">{viewAdmission.doctor}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Admission Date:</span><span className="font-semibold">{viewAdmission.admissionDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Purpose:</span>{purposeBadge(viewAdmission.purpose)}</div>
                  <div className="flex justify-between"><span className="text-slate-400">Room:</span><span className="font-semibold">{viewAdmission.roomNo || 'Pending'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status:</span>{statusBadge(viewAdmission.status)}</div>
                </div>
              </div>

              {/* Doctor Approval */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-amber-700 mb-2">Doctor Approval</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-amber-500">Approved By:</span><span className="font-semibold text-amber-800">{viewAdmission.approvedBy || viewAdmission.doctor}</span></div>
                  <div className="flex justify-between"><span className="text-amber-500">Created:</span><span className="font-semibold text-amber-800">{viewAdmission.createdAt}</span></div>
                </div>
              </div>

              {viewAdmission.notes && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-purple-700 mb-2">Doctor Notes</h4>
                  <p className="text-sm text-purple-800">{viewAdmission.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {viewAdmission.status === 'Approved' && (
                  <button onClick={() => { setViewAdmission(null); setAssignRoomFor(viewAdmission); }} className="btn btn-success flex-1">Room Assign & Admit</button>
                )}
                <button onClick={() => handlePrintSlip(viewAdmission)} className="btn btn-primary flex-1">Print File</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Admission Management</h2>
          <p className="text-sm text-slate-500">Doctor-approved admissions dekhein, room assign karein, discharge karein</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`stat-card card-hover border ${tab === 'approved' ? 'border-amber-400 bg-amber-50' : 'bg-amber-50 border-amber-200'} cursor-pointer`} onClick={() => setTab('approved')}>
          <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold">Doctor Approved</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{approvedAdmissions.length}</p>
          <p className="text-xs text-amber-500 mt-1">Room assign baqi hai</p>
        </div>
        <div className={`stat-card card-hover border ${tab === 'admitted' ? 'border-green-400 bg-green-50' : 'bg-green-50 border-green-200'} cursor-pointer`} onClick={() => setTab('admitted')}>
          <p className="text-xs text-green-600 uppercase tracking-wide font-semibold">Admitted</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{activeAdmissions.length}</p>
          <p className="text-xs text-green-500 mt-1">Abhi admitted hain</p>
        </div>
        <div className={`stat-card card-hover border ${tab === 'history' ? 'border-blue-400 bg-blue-50' : 'bg-blue-50 border-blue-200'} cursor-pointer`} onClick={() => setTab('history')}>
          <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold">Discharged</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{dischargedAdmissions.length}</p>
          <p className="text-xs text-blue-500 mt-1">Discharge ho chuke</p>
        </div>
      </div>

      {/* ===== APPROVED ADMISSIONS ===== */}
      {tab === 'approved' && (
        <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-200">
            <h3 className="font-bold text-amber-800">Doctor Approved Admissions ({approvedAdmissions.length})</h3>
            <p className="text-xs text-amber-600">In admissions mein room assign karein to admit honge</p>
          </div>
          {approvedAdmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">&#128203;</p>
              <p className="font-semibold">Koi pending approval nahi</p>
              <p className="text-sm mt-1">Jab koi doctor admission approve karega yahan dikhayi dega</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient No</th>
                    <th>Patient Name</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Purpose</th>
                    <th>Admission Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedAdmissions.map((a, i) => (
                    <tr key={a.id} className="bg-amber-50/50">
                      <td className="font-semibold">{i + 1}</td>
                      <td><span className="font-mono font-bold text-blue-600">{a.patientNo}</span></td>
                      <td className="font-semibold">{a.patientName}</td>
                      <td>{a.department}</td>
                      <td className="text-sm">{a.doctor}</td>
                      <td>{purposeBadge(a.purpose)}</td>
                      <td>{a.admissionDate}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => { setAssignRoomFor(a); }} className="btn btn-success btn-sm">
                            Room Assign
                          </button>
                          <button onClick={() => setViewAdmission(a)} className="btn btn-outline btn-sm">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== ADMITTED PATIENTS ===== */}
      {tab === 'admitted' && (
        <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <h3 className="font-bold text-green-800">Currently Admitted ({activeAdmissions.length})</h3>
          </div>
          {activeAdmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">&#127973;</p>
              <p className="font-semibold">Koi admitted patient nahi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient No</th>
                    <th>Patient Name</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Purpose</th>
                    <th>Room</th>
                    <th>Admission Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAdmissions.map((a, i) => (
                    <tr key={a.id}>
                      <td className="font-semibold">{i + 1}</td>
                      <td><span className="font-mono font-bold text-blue-600">{a.patientNo}</span></td>
                      <td className="font-semibold">{a.patientName}</td>
                      <td>{a.department}</td>
                      <td className="text-sm">{a.doctor}</td>
                      <td>{purposeBadge(a.purpose)}</td>
                      <td className="font-bold text-green-700">{a.roomNo || '-'}</td>
                      <td>{a.admissionDate}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleDischarge(a)} className="btn btn-danger btn-sm whitespace-nowrap">Discharge</button>
                          <button onClick={() => setViewAdmission(a)} className="btn btn-outline btn-sm">File</button>
                          <button onClick={() => handlePrintSlip(a)} className="btn btn-outline btn-sm">Print</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== HISTORY ===== */}
      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-700">All Admissions History ({allAdmissions.length})</h3>
          </div>
          {allAdmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">&#128196;</p>
              <p className="font-semibold">Koi admission record nahi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient No</th>
                    <th>Patient Name</th>
                    <th>Dept</th>
                    <th>Doctor</th>
                    <th>Purpose</th>
                    <th>Room</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...allAdmissions].reverse().map((a, i) => (
                    <tr key={a.id}>
                      <td className="font-semibold">{i + 1}</td>
                      <td><span className="font-mono font-bold text-blue-600">{a.patientNo}</span></td>
                      <td className="font-semibold">{a.patientName}</td>
                      <td>{a.department}</td>
                      <td className="text-sm">{a.doctor}</td>
                      <td>{purposeBadge(a.purpose)}</td>
                      <td>{a.roomNo || '-'}</td>
                      <td>{a.admissionDate}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => setViewAdmission(a)} className="btn btn-outline btn-sm">View</button>
                          <button onClick={() => handlePrintSlip(a)} className="btn btn-outline btn-sm">Print</button>
                          {a.status === 'Approved' && (
                            <button onClick={() => setAssignRoomFor(a)} className="btn btn-success btn-sm">Room</button>
                          )}
                          {a.status === 'Admitted' && (
                            <button onClick={() => handleDischarge(a)} className="btn btn-danger btn-sm">Discharge</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
