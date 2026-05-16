'use client';
import { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser, genId } from '@/lib/store';
import type { User } from '@/lib/types';

const ROLES = [
  { value: 'reception', label: 'Reception', dept: 'Reception' },
  { value: 'doctor', label: 'Doctor', dept: 'Doctor' },
  { value: 'lab', label: 'Lab Technician', dept: 'Laboratory' },
  { value: 'pharmacy', label: 'Pharmacist', dept: 'Pharmacy' },
  { value: 'xray', label: 'Radiologist', dept: 'X-Ray' },
  { value: 'ultrasound', label: 'USG Technician', dept: 'Ultrasound' },
  { value: 'accounts', label: 'Accountant', dept: 'Accounts' },
];

const ALL_PERMISSIONS = ['register_patient', 'new_visit', 'search_patient', 'card_renewal', 'print_card', 'order_lab', 'prescribe', 'order_xray', 'order_ultrasound', 'write_notes', 'discharge', 'view_reports', 'view_lab_orders', 'enter_results', 'print_report', 'view_prescriptions', 'dispense_medicine', 'view_bills', 'collect_payment', 'daily_report'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reception', department: '', active: true, permissions: [] as string[] });

  const showToast=(msg:string,type:'success'|'error')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};
  useEffect(()=>{setUsers(getUsers())},[]);

  const handleAdd=()=>{
    if(!form.name.trim()||!form.email.trim()||!form.password.trim()){showToast('All fields required','error');return}
    if(users.find(u=>u.email===form.email.trim())){showToast('Login ID already exists','error');return}
    const newUser:User={id:genId(),name:form.name.trim(),email:form.email.trim(),password:form.password,role:form.role as User['role'],department:form.department||form.role,active:form.active,permissions:form.permissions};
    addUser(newUser);
    setUsers(getUsers());setShowAdd(false);
    setForm({name:'',email:'',password:'',role:'reception',department:'',active:true,permissions:[]});
    showToast('User created!','success');
  };

  const handleUpdate=()=>{
    if(!editingUser)return;
    updateUser(editingUser.id,editingUser);
    setUsers(getUsers());setEditingUser(null);
    showToast('User updated!','success');
  };

  const handleDelete=(id:string)=>{
    if(!confirm('Delete this user?'))return;
    deleteUser(id);setUsers(getUsers());
    showToast('User deleted','success');
  };

  const togglePermission=(perm:string)=>{
    if(!editingUser)return;
    const perms=editingUser.permissions.includes('all')?ALL_PERMISSIONS.filter(p=>p!==perm):editingUser.permissions;
    setEditingUser({...editingUser,permissions:perms.includes(perm)?perms.filter(p=>p!==perm):[...perms,perm]});
  };

  const selectRole=(role:string,dept:string)=>{
    setForm({...form,role,department:dept});
  };

  const roleUsers=(role:string)=>users.filter(u=>u.role===role);

  return (
    <div className="space-y-5">
      {toast&&<div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-slate-800">User Management</h2><p className="text-sm text-slate-500">{users.length} total users</p></div>
        <button onClick={()=>{setForm({name:'',email:'',password:'',role:'reception',department:'',active:true,permissions:[]});setShowAdd(true)}} className="btn btn-primary">+ Add User</button>
      </div>

      {/* Users by Role */}
      {ROLES.map(r=>(
        <div key={r.value} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">{r.label}</h3>
            <span className="badge badge-blue">{roleUsers(r.value).length}</span>
          </div>
          {roleUsers(r.value).length===0&&<p className="text-sm text-slate-400">No users</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roleUsers(r.value).map(u=>(
              <div key={u.id} className={`border rounded-lg p-4 ${u.active?'border-slate-200':'border-red-200 bg-red-50 opacity-75'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{u.name}</span>
                  <span className={`badge ${u.active?'badge-green':'badge-red'}`}>{u.active?'Active':'Inactive'}</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Login ID: <span className="font-mono font-medium text-slate-700">{u.email}</span></p>
                  <p>Password: <span className="font-mono font-medium text-slate-700">{u.password}</span></p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>setEditingUser({...u})} className="btn btn-outline btn-sm flex-1">Edit</button>
                  <button onClick={()=>handleDelete(u.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Super Admin */}
      <div className="bg-white rounded-xl border-2 border-blue-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Super Admin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.filter(u=>u.role==='super_admin').map(u=>(
            <div key={u.id} className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2"><span className="badge badge-blue">Super Admin</span></div>
              <span className="font-semibold">{u.name}</span>
              <p className="text-xs text-slate-500 mt-1">Login: <span className="font-mono">{u.email}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal-content" style={{maxWidth:'500px'}} onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <div className="space-y-3">
              <div><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Staff member name"/></div>
              <div><label className="form-label">Login ID *</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="login_id (they will use this to login)"/></div>
              <div><label className="form-label">Password *</label><input className="form-input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password"/></div>
              <div><label className="form-label">Role / Department *</label>
                <select className="form-input" value={form.role} onChange={e=>{const r=ROLES.find(x=>x.value===e.target.value);selectRole(e.target.value,r?.dept||'')}}>
                  {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAdd} className="btn btn-success btn-lg flex-1">Create User</button>
                <button onClick={()=>setShowAdd(false)} className="btn btn-outline btn-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser&&(
        <div className="modal-overlay" onClick={()=>setEditingUser(null)}>
          <div className="modal-content" style={{maxWidth:'600px'}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit User - {editingUser.name}</h3>
              <button onClick={()=>setEditingUser(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="space-y-3">
              <div><label className="form-label">Name</label><input className="form-input" value={editingUser.name} onChange={e=>setEditingUser({...editingUser,name:e.target.value})}/></div>
              <div><label className="form-label">Login ID</label><input className="form-input" value={editingUser.email} onChange={e=>setEditingUser({...editingUser,email:e.target.value})}/></div>
              <div><label className="form-label">Password</label><input className="form-input" value={editingUser.password} onChange={e=>setEditingUser({...editingUser,password:e.target.value})}/></div>
              <div className="flex items-center gap-3">
                <label className="form-label mb-0">Active</label>
                <button onClick={()=>setEditingUser({...editingUser,active:!editingUser.active})} className={`w-12 h-6 rounded-full transition-colors ${editingUser.active?'bg-green-500':'bg-red-400'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${editingUser.active?'translate-x-6':'translate-x-0.5'}`}/>
                </button>
              </div>
              <div className="pt-3 border-t">
                <label className="form-label">Permissions</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_PERMISSIONS.map(perm=>(
                    <label key={perm} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${editingUser.permissions.includes(perm)?'border-blue-400 bg-blue-50 text-blue-700':'border-slate-200 text-slate-500'}`}>
                      <input type="checkbox" checked={editingUser.permissions.includes(perm)} onChange={()=>togglePermission(perm)} className="rounded" />
                      {perm.replace(/_/g,' ')}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdate} className="btn btn-primary btn-lg flex-1">Save Changes</button>
                <button onClick={()=>setEditingUser(null)} className="btn btn-outline btn-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
