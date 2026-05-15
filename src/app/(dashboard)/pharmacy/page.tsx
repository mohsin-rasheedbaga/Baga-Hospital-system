'use client';
import { useState } from 'react';

const demoMedicines = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 500, price: 50, unit: 'Tablet', status: 'In Stock' },
  { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 200, price: 120, unit: 'Capsule', status: 'In Stock' },
  { id: '3', name: 'Omeprazole 20mg', category: 'Gastro', stock: 15, price: 80, unit: 'Capsule', status: 'Low Stock' },
  { id: '4', name: 'Cetirizine 10mg', category: 'Allergy', stock: 300, price: 40, unit: 'Tablet', status: 'In Stock' },
  { id: '5', name: 'Metformin 500mg', category: 'Diabetes', stock: 0, price: 60, unit: 'Tablet', status: 'Out of Stock' },
  { id: '6', name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 180, price: 35, unit: 'Tablet', status: 'In Stock' },
];

const recentDispensed = [
  { id: '1', patient: 'Muhammad Ali (BAGA-0001)', medicines: 'Paracetamol, Amoxicillin', total: 340, date: '2025-05-15' },
  { id: '2', patient: 'Fatima Bibi (BAGA-0002)', medicines: 'Omeprazole, Cetirizine', total: 240, date: '2025-05-15' },
  { id: '3', patient: 'Ahmed Khan (BAGA-0003)', medicines: 'Ibuprofen', total: 105, date: '2025-05-14' },
];

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'dispense'>('stock');
  const [search, setSearch] = useState('');

  const filtered = demoMedicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Pharmacy Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('stock')} className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`}>Medicine Stock</button>
          <button onClick={() => setActiveTab('dispense')} className={`btn ${activeTab === 'dispense' ? 'btn-primary' : 'btn-outline'}`}>Dispense History</button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card card-hover border border-emerald-200 bg-emerald-50">
              <p className="text-xs text-emerald-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-emerald-700">{demoMedicines.length}</p>
            </div>
            <div className="stat-card card-hover border border-amber-200 bg-amber-50">
              <p className="text-xs text-amber-600 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-amber-700">{demoMedicines.filter(m => m.status === 'Low Stock').length}</p>
            </div>
            <div className="stat-card card-hover border border-red-200 bg-red-50">
              <p className="text-xs text-red-600 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">{demoMedicines.filter(m => m.status === 'Out of Stock').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <input className="form-input w-64" placeholder="Search medicine..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-primary">Add Medicine</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Unit</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id}>
                      <td className="font-medium">{m.name}</td>
                      <td><span className="badge badge-blue">{m.category}</span></td>
                      <td className="font-mono">{m.stock}</td>
                      <td>Rs. {m.price}</td>
                      <td>{m.unit}</td>
                      <td><span className={`badge ${m.status === 'In Stock' ? 'badge-green' : m.status === 'Low Stock' ? 'badge-amber' : 'badge-red'}`}>{m.status}</span></td>
                      <td><button className="btn btn-outline btn-sm">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'dispense' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Medicines</th><th>Total</th><th>Date</th></tr></thead>
              <tbody>
                {recentDispensed.map(d => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.patient}</td>
                    <td>{d.medicines}</td>
                    <td className="font-semibold">Rs. {d.total}</td>
                    <td>{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
