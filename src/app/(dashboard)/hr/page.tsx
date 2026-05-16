'use client';
import { useState, useEffect, useCallback } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, searchEmployees, genId, todayStr } from '@/lib/store';
import type { Employee } from '@/lib/types';

const emptyForm = {
  name: '', fatherName: '', cnic: '', mobile: '', designation: '', department: '',
  salary: 0, joinDate: todayStr(), status: 'Active' as 'Active' | 'Inactive' | 'Terminated', documents: [] as string[],
  bankAccount: '', emergencyContact: '',
};

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(() => {
    setEmployees(getEmployees());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const monthlySalary = employees.filter(e => e.status === 'Active').reduce((s, e) => s + e.salary, 0);

  const displayed = search ? searchEmployees(search) : employees;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setForm({ ...emp });
    setEditId(emp.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.cnic || !form.mobile || !form.designation || !form.department) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (editMode) {
      updateEmployee(editId, form);
      showToast('Employee updated successfully', 'success');
    } else {
      addEmployee({ ...form, id: genId() });
      showToast('Employee added successfully', 'success');
    }
    setShowModal(false);
    loadData();
  };

  const handleTerminate = (emp: Employee) => {
    if (confirm(`Are you sure you want to terminate ${emp.name}?`)) {
      updateEmployee(emp.id, { status: 'Terminated' });
      showToast(`${emp.name} has been terminated`, 'success');
      loadData();
    }
  };

  const updateField = (field: string, value: string | number | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">HR Department</h2>
          <p className="text-sm text-slate-500">Employee Management</p>
        </div>
        <div className="flex gap-3">
          <input className="form-input w-64" placeholder="Search by name, department, designation..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={handleAdd} className="btn btn-primary">Add Employee</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card card-hover border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">Total Employees</p>
          <p className="text-2xl font-bold text-blue-700">{totalEmployees}</p>
        </div>
        <div className="stat-card card-hover border border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-medium">Active Employees</p>
          <p className="text-2xl font-bold text-emerald-700">{activeEmployees}</p>
        </div>
        <div className="stat-card card-hover border border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600 font-medium">This Month Salary</p>
          <p className="text-2xl font-bold text-amber-700">Rs. {monthlySalary.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>#</th><th>Name</th><th>Father Name</th><th>CNIC</th><th>Mobile</th><th>Designation</th><th>Department</th><th>Salary</th><th>Join Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={11} className="text-center text-slate-400 py-8">No employees found</td></tr>
              )}
              {displayed.map((emp, i) => (
                <tr key={emp.id}>
                  <td className="text-slate-400">{i + 1}</td>
                  <td className="font-medium">{emp.name}</td>
                  <td>{emp.fatherName}</td>
                  <td className="font-mono text-sm">{emp.cnic}</td>
                  <td className="font-mono">{emp.mobile}</td>
                  <td>{emp.designation}</td>
                  <td><span className="badge badge-blue">{emp.department}</span></td>
                  <td className="font-semibold">Rs. {emp.salary.toLocaleString()}</td>
                  <td>{emp.joinDate}</td>
                  <td>
                    <span className={`badge ${emp.status === 'Active' ? 'badge-green' : emp.status === 'Inactive' ? 'badge-amber' : 'badge-red'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setViewEmployee(emp)} className="btn btn-outline btn-sm">View</button>
                      {emp.status !== 'Terminated' && (
                        <>
                          <button onClick={() => handleEdit(emp)} className="btn btn-primary btn-sm">Edit</button>
                          <button onClick={() => handleTerminate(emp)} className="btn btn-danger btn-sm">Terminate</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editMode ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Enter full name" />
              </div>
              <div>
                <label className="form-label">Father Name *</label>
                <input className="form-input" value={form.fatherName} onChange={e => updateField('fatherName', e.target.value)} placeholder="Enter father name" />
              </div>
              <div>
                <label className="form-label">CNIC *</label>
                <input className="form-input" value={form.cnic} onChange={e => updateField('cnic', e.target.value)} placeholder="35201-1234567-1" />
              </div>
              <div>
                <label className="form-label">Mobile *</label>
                <input className="form-input" value={form.mobile} onChange={e => updateField('mobile', e.target.value)} placeholder="0300-1234567" />
              </div>
              <div>
                <label className="form-label">Designation *</label>
                <input className="form-input" value={form.designation} onChange={e => updateField('designation', e.target.value)} placeholder="e.g. Staff Nurse" />
              </div>
              <div>
                <label className="form-label">Department *</label>
                <select className="form-input" value={form.department} onChange={e => updateField('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {['Emergency', 'Cardiology', 'Gynecology', 'Orthopedic', 'Pediatrician', 'ENT', 'General Medicine', 'Skin Specialist', 'Eye Specialist', 'Dental', 'Physiotherapy', 'Surgery', 'Laboratory', 'Pharmacy', 'Radiology', 'Ultrasound', 'Reception', 'Management', 'Administration', 'General Ward', 'ICU', 'Accounts', 'IT', 'Security', 'Housekeeping'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Monthly Salary (Rs.)</label>
                <input type="number" className="form-input" value={form.salary || ''} onChange={e => updateField('salary', Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Join Date</label>
                <input type="date" className="form-input" value={form.joinDate} onChange={e => updateField('joinDate', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Bank Account (IBAN)</label>
                <input className="form-input" value={form.bankAccount} onChange={e => updateField('bankAccount', e.target.value)} placeholder="IBAN-xxxx" />
              </div>
              <div>
                <label className="form-label">Emergency Contact</label>
                <input className="form-input" value={form.emergencyContact} onChange={e => updateField('emergencyContact', e.target.value)} placeholder="0300-xxxxxxx" />
              </div>
              {editMode && (
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => updateField('status', e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary flex-1">{editMode ? 'Update Employee' : 'Add Employee'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewEmployee && (
        <div className="modal-overlay" onClick={() => setViewEmployee(null)}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Employee Details</h3>
              <button onClick={() => setViewEmployee(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                {viewEmployee.name.split(' ').slice(-1)[0].charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-800">{viewEmployee.name}</h4>
                <p className="text-sm text-slate-500">{viewEmployee.designation} - {viewEmployee.department}</p>
                <span className={`badge ${viewEmployee.status === 'Active' ? 'badge-green' : viewEmployee.status === 'Inactive' ? 'badge-amber' : 'badge-red'}`}>{viewEmployee.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Father Name</p>
                <p>{viewEmployee.fatherName}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">CNIC</p>
                <p className="font-mono">{viewEmployee.cnic}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Mobile</p>
                <p className="font-mono">{viewEmployee.mobile}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Emergency Contact</p>
                <p className="font-mono">{viewEmployee.emergencyContact || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Monthly Salary</p>
                <p className="font-bold text-lg text-slate-800">Rs. {viewEmployee.salary.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Join Date</p>
                <p>{viewEmployee.joinDate}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-slate-400">Bank Account</p>
                <p className="font-mono">{viewEmployee.bankAccount || '-'}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="mt-4">
              <h4 className="font-semibold text-slate-700 mb-2">Documents</h4>
              {viewEmployee.documents && viewEmployee.documents.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {viewEmployee.documents.map((doc, i) => (
                    <span key={i} className="badge badge-amber">{doc}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No documents uploaded</p>
              )}
            </div>

            <button onClick={() => setViewEmployee(null)} className="btn btn-outline w-full mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
