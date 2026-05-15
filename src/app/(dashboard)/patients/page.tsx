'use client';
import { useState } from 'react';

const demoPatients = [
  { id: '1', no: 'BAGA-0001', name: 'Muhammad Ali', father: 'Abdul Rehman', mobile: '03001234567', age: '35', gender: 'Male', visits: 5, status: 'Active', lastVisit: '2025-05-10' },
  { id: '2', no: 'BAGA-0002', name: 'Fatima Bibi', father: 'Haji Rasool', mobile: '03119876543', age: '28', gender: 'Female', visits: 3, status: 'Active', lastVisit: '2025-05-08' },
  { id: '3', no: 'BAGA-0003', name: 'Ahmed Khan', father: 'Ghulam Khan', mobile: '03234567890', age: '45', gender: 'Male', visits: 8, status: 'Expired', lastVisit: '2025-04-10' },
  { id: '4', no: 'BAGA-0004', name: 'Ayesha Siddiqui', father: 'Muhammad Siddiq', mobile: '03335678901', age: '22', gender: 'Female', visits: 1, status: 'Active', lastVisit: '2025-05-14' },
  { id: '5', no: 'BAGA-0005', name: 'Babar Ali', father: 'Nawaz Ali', mobile: '03456789012', age: '50', gender: 'Male', visits: 12, status: 'Active', lastVisit: '2025-05-13' },
];

export default function PatientsPage() {
  const [search, setSearch] = useState('');

  const filtered = demoPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.no.toLowerCase().includes(search.toLowerCase()) ||
    p.mobile.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All Patients</h2>
          <p className="text-sm text-slate-500">{demoPatients.length} total registered patients</p>
        </div>
        <div className="w-80">
          <input className="form-input" placeholder="Search by name, number, or mobile..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient No</th><th>Name</th><th>Father/Husband</th><th>Mobile</th><th>Age/Gender</th><th>Visits</th><th>Status</th><th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-mono font-bold text-blue-600">{p.no}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.father}</td>
                  <td className="font-mono">{p.mobile}</td>
                  <td>{p.age} / {p.gender}</td>
                  <td className="text-center">{p.visits}</td>
                  <td><span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{p.status}</span></td>
                  <td>{p.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
