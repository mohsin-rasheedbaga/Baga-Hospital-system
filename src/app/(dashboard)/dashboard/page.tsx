'use client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const recentActivity = [
    { id: 1, text: 'Patient Muhammad Ali registered', time: '2 min ago', type: 'reception' },
    { id: 2, text: 'Lab report ready for Patient #BAGA-0145', time: '10 min ago', type: 'lab' },
    { id: 3, text: 'Dr. Ahmed completed consultation', time: '15 min ago', type: 'doctor' },
    { id: 4, text: 'Payment received Rs. 2,500', time: '20 min ago', type: 'accounts' },
    { id: 5, text: 'Pharmacy dispensed 3 medicines', time: '30 min ago', type: 'pharmacy' },
    { id: 6, text: 'X-Ray completed for Patient #BAGA-0138', time: '45 min ago', type: 'xray' },
  ];

  const statCards = [
    { label: "Today's Patients", value: '12', icon: '🏥', color: 'bg-blue-50 border-blue-200' },
    { label: 'Total Patients', value: '1,450', icon: '👥', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Active Doctors', value: '8', icon: '👨‍⚕️', color: 'bg-purple-50 border-purple-200' },
    { label: "Today's Revenue", value: 'Rs. 45,000', icon: '💰', color: 'bg-amber-50 border-amber-200' },
    { label: 'Pending Lab Tests', value: '5', icon: '🔬', color: 'bg-teal-50 border-teal-200' },
    { label: 'Pending Pharmacy', value: '8', icon: '💊', color: 'bg-rose-50 border-rose-200' },
  ];

  const quickActions = [
    { label: 'New Patient', desc: 'Register new patient', color: 'bg-blue-600 hover:bg-blue-700', route: '/reception' },
    { label: 'New Visit', desc: 'Create patient visit', color: 'bg-emerald-600 hover:bg-emerald-700', route: '/reception' },
    { label: 'Lab Tests', desc: 'View pending tests', color: 'bg-teal-600 hover:bg-teal-700', route: '/lab' },
    { label: 'X-Ray Queue', desc: 'View x-ray queue', color: 'bg-rose-600 hover:bg-rose-700', route: '/xray' },
    { label: 'Pharmacy', desc: 'Dispense medicine', color: 'bg-amber-600 hover:bg-amber-700', route: '/pharmacy' },
    { label: 'Accounts', desc: 'Billing & payments', color: 'bg-indigo-600 hover:bg-indigo-700', route: '/accounts' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`stat-card card-hover border ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  item.type === 'reception' ? 'bg-blue-500' :
                  item.type === 'lab' ? 'bg-teal-500' :
                  item.type === 'doctor' ? 'bg-purple-500' :
                  item.type === 'accounts' ? 'bg-amber-500' :
                  item.type === 'pharmacy' ? 'bg-emerald-500' :
                  'bg-rose-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Now navigates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => router.push(action.route)}
                className={`${action.color} text-white rounded-lg p-4 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer`}
              >
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs opacity-80 mt-1">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Department Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { dept: 'Reception', status: 'Active', patients: 12, color: 'text-blue-600 bg-blue-50' },
            { dept: 'Pharmacy', status: 'Active', patients: 8, color: 'text-emerald-600 bg-emerald-50' },
            { dept: 'Laboratory', status: 'Active', patients: 5, color: 'text-teal-600 bg-teal-50' },
            { dept: 'X-Ray', status: 'Busy', patients: 3, color: 'text-amber-600 bg-amber-50' },
            { dept: 'Ultrasound', status: 'Active', patients: 2, color: 'text-purple-600 bg-purple-50' },
          ].map((dept, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 text-center">
              <p className="font-semibold text-slate-700 text-sm">{dept.dept}</p>
              <p className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${dept.color}`}>
                {dept.status}
              </p>
              <p className="text-xs text-slate-400 mt-2">{dept.patients} waiting</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
