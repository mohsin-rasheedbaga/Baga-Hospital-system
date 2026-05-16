'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { name: 'Admin', desc: 'Full access to all modules', color: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'Receptionist', desc: 'Patient registration & visits', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { name: 'Doctor', desc: 'Patient diagnosis & treatment', color: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'Pharmacist', desc: 'Medicine dispensing & stock', color: 'bg-amber-600 hover:bg-amber-700' },
  { name: 'Lab Technician', desc: 'Lab tests & reports', color: 'bg-teal-600 hover:bg-teal-700' },
  { name: 'Radiologist', desc: 'X-Ray & Ultrasound', color: 'bg-rose-600 hover:bg-rose-700' },
  { name: 'Accountant', desc: 'Payments & billing', color: 'bg-indigo-600 hover:bg-indigo-700' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (role: string) => {
    if (password.length < 2) { setError('Enter any password to continue (demo mode)'); return; }
    setLoading(true);
    setError('');
    // Store role and navigate
    localStorage.setItem('baga_role', role);
    localStorage.setItem('baga_user', role.charAt(0).toUpperCase() + role.slice(1));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">BAGA Hospital System</h1>
          <p className="text-blue-300 text-sm">Hospital Management System v1.0</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="mb-5">
            <label className="block text-blue-200 text-sm font-medium mb-2">Enter Password (Any password works in Demo)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password..."
              className="form-input bg-white/10 border-white/20 text-white placeholder-blue-300/50"
              onKeyDown={(e) => { if (e.key === 'Enter' && selectedRole) handleLogin(selectedRole); }}
            />
          </div>

          {error && <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

          <p className="text-blue-200 text-sm mb-3 font-medium">Select your role to login:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.name}
                onClick={() => { setSelectedRole(role.name); handleLogin(role.name); }}
                disabled={loading}
                className={`${role.color} text-white rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
              >
                <div className="font-semibold text-sm">{role.name}</div>
                <div className="text-xs opacity-80 mt-1">{role.desc}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-blue-300/60 text-xs">Click any role to login directly (Demo Mode - No real authentication)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
