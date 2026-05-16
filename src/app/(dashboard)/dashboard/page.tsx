'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getVisits, getLabOrders, getXRayOrders, getUltrasoundOrders,
  getPrescriptions, getBills, getPatients, getActiveAdmissions,
  getPendingLabOrders, getPendingXRayOrders, getPendingUltrasoundOrders,
  getDispenses, getAdmissions, todayStr, getHospitalSettings
} from '@/lib/store';

interface Session {
  userId: string;
  name: string;
  role: string;
  department: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem('baga_session');
      if (s) setSession(JSON.parse(s));
    } catch {}
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;

  const role = session.role;

  /* =========== COMMON DATA =========== */
  const allVisits = getVisits();
  const allLabOrders = getLabOrders();
  const allXRayOrders = getXRayOrders();
  const allUSGOrders = getUltrasoundOrders();
  const allPrescriptions = getPrescriptions();
  const allBills = getBills();
  const allPatients = getPatients();
  const allDispenses = getDispenses();
  const allAdmissions = getAdmissions();
  const today = todayStr();

  const todayVisits = allVisits.filter(v => v.date === today);
  const monthStart = today.substring(0, 7) + '-01';
  const monthVisits = allVisits.filter(v => v.date >= monthStart);
  const pendingLab = allLabOrders.filter(o => o.status !== 'Completed');
  const pendingXRay = allXRayOrders.filter(o => o.status !== 'Completed');
  const pendingUSG = allUSGOrders.filter(o => o.status !== 'Completed');
  const activeAdmissions = allAdmissions.filter(a => a.status === 'Admitted');
  const pendingPrescriptions = allPrescriptions.filter(p => p.status === 'Active');

  const currency = getHospitalSettings().currency;

  /* =========== HOSPITAL CUT RATIO (demo) =========== */
  const hospitalCutRatio = 0.4; // 40% hospital, 60% doctor

  /* ========================================================= */
  /* =========== SUPER ADMIN DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'super_admin') {
    const totalRevenue = allBills.reduce((s, b) => s + b.paidAmount, 0);
    const todayRevenue = allBills.filter(b => b.date === today).reduce((s, b) => s + b.paidAmount, 0);
    const monthRevenue = allBills.filter(b => b.date >= monthStart).reduce((s, b) => s + b.paidAmount, 0);
    const pendingBills = allBills.filter(b => b.status === 'Unpaid' || b.status === 'Partial');
    const pendingAmount = pendingBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Patients" value={todayVisits.length} sub="OPD Patients Today" color="blue" />
          <StatCard label="Monthly Patients" value={monthVisits.length} sub="This Month Total" color="emerald" />
          <StatCard label="Today's Revenue" value={`${currency} ${todayRevenue.toLocaleString()}`} sub="Today Revenue" color="amber" />
          <StatCard label="Monthly Revenue" value={`${currency} ${monthRevenue.toLocaleString()}`} sub="This Month Revenue" color="purple" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={allPatients.length} sub="Total Registered" color="cyan" />
          <StatCard label="PENDING BILLS" value={pendingBills.length} sub={`${currency} ${pendingAmount.toLocaleString()} pending`} color="rose" />
          <StatCard label="PENDING LAB TESTS" value={pendingLab.length} sub="Awaiting results" color="teal" onClick={() => router.push('/lab')} />
          <StatCard label="ACTIVE ADMISSIONS" value={activeAdmissions.length} sub="Currently admitted" color="indigo" onClick={() => router.push('/admission')} />
        </div>

        {/* Department Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Status - Today</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <DeptCard name="Reception" count={todayVisits.length} sub="patients today" color="blue" />
            <DeptCard name="Laboratory" count={pendingLab.length} sub="pending tests" color="teal" />
            <DeptCard name="X-Ray" count={pendingXRay.length} sub="pending" color="rose" />
            <DeptCard name="Ultrasound" count={pendingUSG.length} sub="pending" color="indigo" />
            <DeptCard name="Pharmacy" count={pendingPrescriptions.length} sub="pending scripts" color="amber" />
            <DeptCard name="Admissions" count={activeAdmissions.length} sub="active" color="purple" />
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Recent Visits</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient No</th><th>Name</th><th>Department</th><th>Doctor</th><th>Token</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {todayVisits.slice(-10).reverse().map(v => (
                  <tr key={v.id}>
                    <td className="font-mono font-bold text-blue-600">{v.patientNo}</td>
                    <td className="font-medium">{v.patientName}</td>
                    <td>{v.department}</td><td>{v.doctor}</td><td>#{v.tokenNo}</td><td>{v.time}</td>
                    <td><span className={`badge ${v.status==='Active'?'badge-amber':v.status==='Completed'?'badge-green':'badge-blue'}`}>{v.status}</span></td>
                  </tr>
                ))}
                {todayVisits.length===0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No visits today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== RECEPTION DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'reception') {
    const todayRevenue = allBills.filter(b => b.date === today).reduce((s, b) => s + b.paidAmount, 0);
    const monthRevenue = allBills.filter(b => b.date >= monthStart).reduce((s, b) => s + b.paidAmount, 0);
    const monthTotalBills = allBills.filter(b => b.date >= monthStart).reduce((s, b) => s + b.totalAmount, 0);
    const monthPending = monthTotalBills - monthRevenue;
    const pendingBills = allBills.filter(b => b.status === 'Unpaid' || b.status === 'Partial');
    const pendingAmt = pendingBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

    return (
      <div className="space-y-6">
        {/* Today Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Patients" value={todayVisits.length} sub="OPD patients today" color="blue" />
          <StatCard label="Today's Collection" value={`${currency} ${todayRevenue.toLocaleString()}`} sub="Today Collection" color="emerald" />
          <StatCard label="PENDING LAB TESTS" value={pendingLab.length} sub="Click to view status" color="teal" onClick={() => router.push('/lab')} />
          <StatCard label="PENDING X-RAY" value={pendingXRay.length} sub="Click to view" color="rose" onClick={() => router.push('/xray')} />
        </div>

        {/* Monthly Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Monthly Patients" value={monthVisits.length} sub="This month total" color="cyan" />
            <StatCard label="Monthly Collection" value={`${currency} ${monthRevenue.toLocaleString()}`} sub="This month collection" color="amber" />
            <StatCard label="Monthly Pending" value={`${currency} ${monthPending.toLocaleString()}`} sub="Pending / Unpaid" color="rose" />
          </div>
        </div>

        {/* Pending Lab - Clickable */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-teal-300 transition-colors" onClick={() => router.push('/lab')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Pending Lab Tests ({pendingLab.length})</h2>
            <span className="badge badge-teal">Click to View</span>
          </div>
          {pendingLab.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No pending lab tests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Patient No</th><th>Patient Name</th><th>Tests</th><th>Doctor</th><th>Status</th></tr></thead>
                <tbody>
                  {pendingLab.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                      <td className="font-medium">{o.patientName}</td>
                      <td><div className="flex flex-wrap gap-1">{o.tests.slice(0,2).map((t,i)=><span key={i} className="badge badge-blue">{t.testName}</span>)}{o.tests.length>2&&<span className="badge badge-slate">+{o.tests.length-2} more</span>}</div></td>
                      <td className="text-sm">{o.orderedBy}</td>
                      <td><span className={`badge ${o.status==='Pending'?'badge-amber':'badge-blue'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Today's Visit List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Visits</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient No</th><th>Name</th><th>Department</th><th>Doctor</th><th>Token</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {todayVisits.slice().reverse().map(v => (
                  <tr key={v.id}>
                    <td className="font-mono font-bold text-blue-600">{v.patientNo}</td>
                    <td className="font-medium">{v.patientName}</td>
                    <td>{v.department}</td><td>{v.doctor}</td><td>#{v.tokenNo}</td><td>{v.time}</td>
                    <td><span className={`badge ${v.status==='Active'?'badge-amber':v.status==='Completed'?'badge-green':'badge-blue'}`}>{v.status}</span></td>
                  </tr>
                ))}
                {todayVisits.length===0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No visits today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions - ONLY Reception Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ActionButton label="New Patient" desc="Register new patient" color="blue" route="/reception" />
            <ActionButton label="New Visit" desc="Create visit" color="emerald" route="/reception" />
            <ActionButton label="Appointment" desc="Book appointment" color="purple" route="/appointment" />
            <ActionButton label="Admission" desc="Admit patient" color="amber" route="/admission" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== DOCTOR DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'doctor') {
    const doctorName = session.name;
    const myVisits = allVisits.filter(v => v.doctor === doctorName);
    const myTodayVisits = myVisits.filter(v => v.date === today);
    const myMonthVisits = myVisits.filter(v => v.date >= monthStart);
    const myChecked = myTodayVisits.filter(v => v.status === 'Completed');
    const myRemaining = myTodayVisits.filter(v => v.status === 'Active');

    // Revenue: each visit has doctorFee. Hospital takes cut, doctor gets rest.
    const myTotalRevenue = myMonthVisits.reduce((s, v) => s + v.doctorFee, 0);
    const myDoctorShare = Math.round(myTotalRevenue * (1 - hospitalCutRatio));
    const myHospitalShare = Math.round(myTotalRevenue * hospitalCutRatio);

    // Check bills for paid vs pending
    const myMonthVisitIds = myMonthVisits.map(v => v.id);
    const myBills = allBills.filter(b => myMonthVisitIds.includes(b.visitId));
    const myCollected = myBills.reduce((s, b) => s + b.paidAmount, 0);
    const myPendingBills = myBills.filter(b => b.status === 'Unpaid' || b.status === 'Partial');
    const myPendingAmount = myPendingBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

    // My pending lab orders (for patients I sent)
    const myLabOrders = allLabOrders.filter(o => o.orderedBy === doctorName && o.status !== 'Completed');
    const myXRayOrders = allXRayOrders.filter(o => o.orderedBy === doctorName && o.status !== 'Completed');
    const myUSGOrders = allUSGOrders.filter(o => o.orderedBy === doctorName && o.status !== 'Completed');

    return (
      <div className="space-y-6">
        {/* Doctor Name Banner */}
        <div className="bg-purple-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">Dr. {doctorName}</h2>
          <p className="text-purple-200 text-sm">Doctor Dashboard - OPD Summary</p>
        </div>

        {/* Today's OPD Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Patients" value={myTodayVisits.length} sub="Came today" color="blue" />
          <StatCard label="Checked" value={myChecked.length} sub="Completed today" color="green" />
          <StatCard label="Remaining" value={myRemaining.length} sub="Currently remaining" color="amber" />
          <StatCard label="Monthly Total" value={myMonthVisits.length} sub="This month's patients" color="purple" />
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue - Monthly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Fee" value={`${currency} ${myTotalRevenue.toLocaleString()}`} sub={`Hospital Cut: ${currency} ${myHospitalShare.toLocaleString()} (${Math.round(hospitalCutRatio*100)}%)`} color="cyan" />
            <StatCard label="Your Share" value={`${currency} ${myDoctorShare.toLocaleString()}`} sub={`Your share (${Math.round((1-hospitalCutRatio)*100)}%)`} color="emerald" />
            <StatCard label="Collected" value={`${currency} ${myCollected.toLocaleString()}`} sub="Received from hospital" color="blue" />
            <StatCard label="Pending" value={`${currency} ${myPendingAmount.toLocaleString()}`} sub="Pending from hospital" color="rose" />
          </div>
          {myPendingBills.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-semibold">Pending Payments:</p>
              {myPendingBills.map(b => (
                <div key={b.id} className="flex justify-between text-sm text-amber-700 mt-1">
                  <span>{b.patientName} ({b.patientNo})</span>
                  <span>{currency} {(b.totalAmount - b.paidAmount).toLocaleString()} remaining</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders from This Doctor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-teal-300" onClick={() => router.push('/lab')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Lab Tests</p>
                <p className="text-2xl font-bold text-teal-600 mt-1">{myLabOrders.length}</p>
              </div>
              <span className="badge badge-teal">Lab</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-rose-300" onClick={() => router.push('/xray')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Pending X-Ray</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{myXRayOrders.length}</p>
              </div>
              <span className="badge badge-rose">X-Ray</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300" onClick={() => router.push('/ultrasound')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Ultrasound</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{myUSGOrders.length}</p>
              </div>
              <span className="badge badge-indigo">USG</span>
            </div>
          </div>
        </div>

        {/* Today's Patient Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Today's Queue ({myTodayVisits.length})</h2>
            <button onClick={() => router.push('/doctor')} className="btn btn-primary btn-sm">View All Patients</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Token</th><th>Patient No</th><th>Name</th><th>Fee</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {myTodayVisits.map(v => (
                  <tr key={v.id}>
                    <td><span className="bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-lg text-sm">#{v.tokenNo}</span></td>
                    <td className="font-mono font-bold text-blue-600">{v.patientNo}</td>
                    <td className="font-medium">{v.patientName}</td>
                    <td className="font-semibold text-emerald-600">{currency} {v.doctorFee.toLocaleString()}</td>
                    <td>{v.time}</td>
                    <td>
                      <span className={`badge ${v.status==='Active'?'badge-amber':v.status==='Completed'?'badge-green':'badge-blue'}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myTodayVisits.length===0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No patient came today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== LAB DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'lab') {
    return (
      <div className="space-y-6">
        <div className="bg-teal-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">Lab Technician Dashboard</h2>
          <p className="text-teal-200 text-sm">Laboratory Test Management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="PENDING TESTS" value={pendingLab.length} sub="Awaiting processing" color="amber" onClick={() => router.push('/lab')} />
          <StatCard label="IN PROGRESS" value={allLabOrders.filter(o=>o.status==='In Progress').length} sub="Being processed" color="blue" />
          <StatCard label="COMPLETED" value={allLabOrders.filter(o=>o.status==='Completed').length} sub="Results entered" color="green" />
          <StatCard label="TOTAL ORDERS" value={allLabOrders.length} sub="All time" color="purple" />
        </div>

        {/* Pending Lab Orders - Clickable */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-teal-300" onClick={() => router.push('/lab')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Pending Lab Tests ({pendingLab.length})</h2>
            <span className="badge badge-teal">Click to Process</span>
          </div>
          {pendingLab.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No pending tests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Patient No</th><th>Patient Name</th><th>Tests</th><th>Ordered By</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {pendingLab.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                      <td className="font-medium">{o.patientName}</td>
                      <td><div className="flex flex-wrap gap-1">{o.tests.slice(0,2).map((t,i)=><span key={i} className="badge badge-blue">{t.testName}</span>)}{o.tests.length>2&&<span className="badge badge-slate">+{o.tests.length-2} more</span>}</div></td>
                      <td className="text-sm">{o.orderedBy}</td>
                      <td>{o.date}</td>
                      <td><span className={`badge ${o.status==='Pending'?'badge-amber':'badge-blue'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== PHARMACY DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'pharmacy') {
    const activeScripts = allPrescriptions.filter(p => p.status === 'Active');
    const dispensed = allPrescriptions.filter(p => p.status === 'Dispensed');

    return (
      <div className="space-y-6">
        <div className="bg-amber-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">Pharmacy Dashboard</h2>
          <p className="text-amber-200 text-sm">Medicine Dispensing</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="PENDING SCRIPTS" value={activeScripts.length} sub="Awaiting dispensing" color="amber" onClick={() => router.push('/pharmacy')} />
          <StatCard label="DISPENSED" value={dispensed.length} sub="Completed today" color="green" />
          <StatCard label="TOTAL" value={allPrescriptions.length} sub="All prescriptions" color="purple" />
        </div>

        {/* Pending Prescriptions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-amber-300" onClick={() => router.push('/pharmacy')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Pending Prescriptions ({activeScripts.length})</h2>
            <span className="badge badge-amber">Click to Dispense</span>
          </div>
          {activeScripts.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No pending prescriptions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Patient No</th><th>Patient Name</th><th>Medicines</th><th>Doctor</th><th>Date</th></tr></thead>
                <tbody>
                  {activeScripts.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td className="font-mono font-bold text-blue-600">{p.patientNo}</td>
                      <td className="font-medium">{p.patientName}</td>
                      <td><div className="flex flex-wrap gap-1">{p.medicines.slice(0,2).map((m,i)=><span key={i} className="badge badge-amber">{m.name}</span>)}{p.medicines.length>2&&<span className="badge badge-slate">+{p.medicines.length-2}</span>}</div></td>
                      <td className="text-sm">{p.prescribedBy}</td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== X-RAY DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'xray') {
    return (
      <div className="space-y-6">
        <div className="bg-rose-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">X-Ray Dashboard</h2>
          <p className="text-rose-200 text-sm">Radiology Department</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="PENDING X-RAY" value={pendingXRay.length} sub="Awaiting processing" color="amber" onClick={() => router.push('/xray')} />
          <StatCard label="COMPLETED" value={allXRayOrders.filter(o=>o.status==='Completed').length} sub="Reports ready" color="green" />
          <StatCard label="TOTAL" value={allXRayOrders.length} sub="All orders" color="purple" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-rose-300" onClick={() => router.push('/xray')}>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Pending X-Ray Orders ({pendingXRay.length})</h2>
          {pendingXRay.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No pending x-ray</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Patient No</th><th>Patient Name</th><th>X-Ray Type</th><th>Doctor</th><th>Date</th></tr></thead>
                <tbody>
                  {pendingXRay.slice(0,5).map(o=>(
                    <tr key={o.id}>
                      <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                      <td className="font-medium">{o.patientName}</td>
                      <td><span className="badge badge-rose">{o.xrayType}</span></td>
                      <td className="text-sm">{o.orderedBy}</td>
                      <td>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== ULTRASOUND DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'ultrasound') {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">Ultrasound Dashboard</h2>
          <p className="text-indigo-200 text-sm">USG Department</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="PENDING USG" value={pendingUSG.length} sub="Awaiting processing" color="amber" onClick={() => router.push('/ultrasound')} />
          <StatCard label="COMPLETED" value={allUSGOrders.filter(o=>o.status==='Completed').length} sub="Reports ready" color="green" />
          <StatCard label="TOTAL" value={allUSGOrders.length} sub="All orders" color="purple" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300" onClick={() => router.push('/ultrasound')}>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Pending Ultrasound Orders ({pendingUSG.length})</h2>
          {pendingUSG.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No pending ultrasound</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Patient No</th><th>Patient Name</th><th>USG Type</th><th>Doctor</th><th>Date</th></tr></thead>
                <tbody>
                  {pendingUSG.slice(0,5).map(o=>(
                    <tr key={o.id}>
                      <td className="font-mono font-bold text-blue-600">{o.patientNo}</td>
                      <td className="font-medium">{o.patientName}</td>
                      <td><span className="badge badge-indigo">{o.usgType}</span></td>
                      <td className="text-sm">{o.orderedBy}</td>
                      <td>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* =========== ACCOUNTS DASHBOARD =========== */
  /* ========================================================= */
  if (role === 'accounts') {
    const todayRevenue = allBills.filter(b => b.date === today).reduce((s, b) => s + b.paidAmount, 0);
    const monthRevenue = allBills.filter(b => b.date >= monthStart).reduce((s, b) => s + b.paidAmount, 0);
    const monthTotal = allBills.filter(b => b.date >= monthStart).reduce((s, b) => s + b.totalAmount, 0);
    const totalRevenue = allBills.reduce((s, b) => s + b.paidAmount, 0);

    return (
      <div className="space-y-6">
        <div className="bg-cyan-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">Accounts Dashboard</h2>
          <p className="text-cyan-200 text-sm">Billing & Revenue</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Collection" value={`${currency} ${todayRevenue.toLocaleString()}`} sub="Today collection" color="blue" />
          <StatCard label="Monthly Collection" value={`${currency} ${monthRevenue.toLocaleString()}`} sub="This month" color="emerald" />
          <StatCard label="Total Collection" value={`${currency} ${totalRevenue.toLocaleString()}`} sub="All time" color="purple" />
          <StatCard label="Monthly Target" value={`${currency} ${monthTotal.toLocaleString()}`} sub={`Remaining: ${currency} ${(monthTotal-monthRevenue).toLocaleString()}`} color="amber" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Bills</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Total</th><th>Paid</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {allBills.filter(b=>b.date===today).map(b=>(
                  <tr key={b.id}>
                    <td className="font-medium">{b.patientName} <span className="text-blue-600 font-mono text-xs">({b.patientNo})</span></td>
                    <td className="font-semibold">{currency} {b.totalAmount.toLocaleString()}</td>
                    <td className="text-emerald-600">{currency} {b.paidAmount.toLocaleString()}</td>
                    <td>{b.paymentMethod}</td>
                    <td><span className={`badge ${b.status==='Paid'?'badge-green':b.status==='Partial'?'badge-amber':'badge-rose'}`}>{b.status}</span></td>
                    <td>{b.time}</td>
                  </tr>
                ))}
                {allBills.filter(b=>b.date===today).length===0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No bills today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* Fallback */
  return <p className="text-slate-400">Dashboard loading...</p>;
}

/* ============ SUB COMPONENTS ============ */

function StatCard({ label, value, sub, color, onClick }: { label: string; value: string | number; sub?: string; color: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`stat-card card-hover border ${colors[color] || colors.blue} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function DeptCard({ name, count, sub, color }: { name: string; count: number; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    teal: 'text-teal-600 bg-teal-50',
    rose: 'text-rose-600 bg-rose-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    cyan: 'text-cyan-600 bg-cyan-50',
  };
  return (
    <div className="border border-slate-200 rounded-lg p-4 text-center">
      <p className="font-semibold text-slate-700 text-sm">{name}</p>
      <p className="text-2xl font-bold text-slate-800 mt-2">{count}</p>
      <p className={`text-xs mt-1 ${colors[color] || ''}`}>{sub}</p>
    </div>
  );
}

function ActionButton({ label, desc, color, route }: { label: string; desc: string; color: string; route: string }) {
  const router = useRouter();
  const colors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  };
  return (
    <button onClick={() => router.push(route)} className={`${colors[color] || colors.blue} text-white rounded-lg p-4 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer`}>
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs opacity-80 mt-1">{desc}</p>
    </button>
  );
}
