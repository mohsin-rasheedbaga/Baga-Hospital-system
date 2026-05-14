'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster, toast } from 'sonner';
import {
  Hospital, Plus, Search, LogOut, Copy, Eye, EyeOff, Edit, Trash2,
  Shield, Building2, Phone, MapPin, Key, Activity, CheckCircle2,
  XCircle, AlertTriangle, ChevronDown, RefreshCw, Mail, Image, PhoneCall,
} from 'lucide-react';

interface License {
  id: number;
  name: string;
  city: string | null;
  phone: string | null;
  type: string;
  license_key: string;
  username: string;
  password: string;
  features: string[] | null;
  status: string;
  rent_amount: number;
  created_at: string;
  last_check_at: string | null;
  notes: string | null;
  logo: string | null;
  email: string | null;
  telephone: string | null;
}

const ALL_FEATURES = [
  { id: 'reception', label: 'Reception', icon: '🏥' },
  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'lab', label: 'Lab', icon: '🔬' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'patients', label: 'Patients', icon: '🤒' },
];

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        onLogin();
        toast.success('Login successful!');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-emerald-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-emerald-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">Admin Panel</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            UWH — License Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />{error}
              </div>
            )}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${label} copied!`);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
      <Copy className="w-3.5 h-3.5" />
      {copied && <span className="text-xs text-emerald-600 ml-1">Copied!</span>}
    </Button>
  );
}

function HospitalCard({ license, onUpdate, onDelete }: {
  license: License;
  onUpdate: (id: number, data: Partial<License>) => void;
  onDelete: (id: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: license.name, city: license.city, phone: license.phone,
    rent_amount: license.rent_amount, type: license.type, notes: license.notes,
    email: license.email, telephone: license.telephone, logo: license.logo,
  });

  const isActive = license.status === 'active';
  const lastCheck = license.last_check_at
    ? new Date(license.last_check_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never checked';

  const toggleStatus = async () => { await onUpdate(license.id, { status: isActive ? 'inactive' : 'active' }); };
  const saveEdit = async () => { await onUpdate(license.id, editData); setIsEditing(false); };

  return (
    <Card className={`border-2 transition-all duration-200 ${isActive ? 'border-emerald-200 hover:border-emerald-400' : 'border-red-200 hover:border-red-300 opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {license.logo ? (
              <img src={license.logo} alt="" className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hospital className="w-6 h-6 text-emerald-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-emerald-600' : ''}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {license.type === 'hospital' ? 'Hospital' : license.type === 'pharmacy' ? 'Pharmacy' : 'Clinic'}
                </Badge>
              </div>
              {isEditing ? (
                <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="font-bold text-lg" />
              ) : (
                <h3 className="font-bold text-lg text-gray-800 truncate">{license.name}</h3>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={toggleStatus} />
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
          {license.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{license.city}</span>}
          {license.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{license.phone}</span>}
          {license.telephone && <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5" />{license.telephone}</span>}
          {license.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{license.email}</span>}
          {license.rent_amount > 0 && <span className="flex items-center gap-1 font-semibold text-emerald-700">Rs. {license.rent_amount.toLocaleString()}/mo</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {(license.features || []).map((f) => {
            const feature = ALL_FEATURES.find((af) => af.id === f);
            return feature ? (
              <span key={f} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{feature.icon} {feature.label}</span>
            ) : null;
          })}
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-gray-500">Last Check:</span>
              <span className="font-medium">{lastCheck}</span>
            </div>

            <div>
              <button onClick={() => setShowKeys(!showKeys)} className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
                <Key className="w-4 h-4" />
                {showKeys ? 'Hide Login Details' : 'Show Login Details'}
              </button>
              {showKeys && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Username:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs">{license.username}</code>
                      <CopyButton text={license.username} label="Username" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Password:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs">{showPassword ? license.password : '••••••••'}</code>
                      <button onClick={() => setShowPassword(!showPassword)} className="p-1 hover:bg-gray-200 rounded">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <CopyButton text={license.password} label="Password" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">License Key:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs text-emerald-700 font-bold">{license.license_key}</code>
                      <CopyButton text={license.license_key} label="License Key" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {license.notes && (
              <div className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg p-2">{license.notes}</div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditData({ name: license.name, city: license.city, phone: license.phone, rent_amount: license.rent_amount, type: license.type, notes: license.notes, email: license.email, telephone: license.telephone, logo: license.logo }); }}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(license.id)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
                </>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                <div><Label className="text-xs">City</Label><Input value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value || null })} placeholder="City" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value || null })} placeholder="03001234567" dir="ltr" /></div>
                <div><Label className="text-xs">Telephone</Label><Input value={editData.telephone || ''} onChange={(e) => setEditData({ ...editData, telephone: e.target.value || null })} placeholder="042-1234567" dir="ltr" /></div>
                <div><Label className="text-xs">Email</Label><Input value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value || null })} placeholder="info@hospital.com" dir="ltr" /></div>
                <div><Label className="text-xs">Logo URL</Label><Input value={editData.logo || ''} onChange={(e) => setEditData({ ...editData, logo: e.target.value || null })} placeholder="https://..." dir="ltr" /></div>
                <div><Label className="text-xs">Type</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Rent (Rs./month)</Label><Input type="number" value={editData.rent_amount} onChange={(e) => setEditData({ ...editData, rent_amount: parseInt(e.target.value) || 0 })} dir="ltr" /></div>
                <div className="sm:col-span-2"><Label className="text-xs">Notes</Label><Textarea value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value || null })} placeholder="Notes..." /></div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddHospitalDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', phone: '', type: 'hospital',
    features: ['reception', 'doctor', 'pharmacy'] as string[],
    rent_amount: 0, notes: '', email: '', telephone: '', logo: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Hospital name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': localStorage.getItem('admin_token') || '' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${form.name} added successfully!`);
        onAdded();
        setOpen(false);
        setForm({ name: '', city: '', phone: '', type: 'hospital', features: ['reception', 'doctor', 'pharmacy'], rent_amount: 0, notes: '', email: '', telephone: '', logo: '' });
      } else {
        toast.error(data.error || 'Failed to add');
      }
    } catch { toast.error('Could not connect to server'); } finally { setLoading(false); }
  };

  const toggleFeature = (featureId: string) => {
    setForm((prev) => ({ ...prev, features: prev.features.includes(featureId) ? prev.features.filter((f) => f !== featureId) : [...prev.features, featureId] }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg" size="lg">
          <Plus className="w-5 h-5 mr-2" />Add New Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-600" />
            Add New Hospital / Pharmacy
          </DialogTitle>
          <DialogDescription>Enter details to add a new client. License key, username and password will be generated automatically.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Hospital / Pharmacy Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hayat Medical Center" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Karachi" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03001234567" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telephone</Label>
              <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="042-1234567" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@hospital.com" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rent (Rs./month)</Label>
              <Input type="number" value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: parseInt(e.target.value) || 0 })} dir="ltr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Image className="w-4 h-4" />Logo URL</Label>
            <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://example.com/logo.png" dir="ltr" />
          </div>

          <div className="space-y-2">
            <Label>Select Features</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_FEATURES.map((feature) => (
                <label key={feature.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${form.features.includes(feature.id) ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Checkbox checked={form.features.includes(feature.id)} onCheckedChange={() => toggleFeature(feature.id)} />
                  <span className="text-sm">{feature.icon} {feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special notes..." />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'Adding...' : 'Add Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchLicenses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterType !== 'all') params.set('type', filterType);
      const res = await fetch(`/api/admin/licenses?${params.toString()}`, { headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' } });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setLicenses(data.licenses || []);
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  }, [search, filterStatus, filterType, onLogout]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleUpdate = async (id: number, updateData: Partial<License>) => {
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': localStorage.getItem('admin_token') || '' }, body: JSON.stringify(updateData) });
      if (res.ok) { toast.success('Updated!'); fetchLicenses(); } else { toast.error('Update failed'); }
    } catch { toast.error('Could not connect'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE', headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' } });
      if (res.ok) { toast.success('Deleted!'); fetchLicenses(); } else { toast.error('Delete failed'); }
    } catch { toast.error('Could not connect'); }
  };

  const totalHospitals = licenses.length;
  const activeHospitals = licenses.filter((l) => l.status === 'active').length;
  const inactiveHospitals = licenses.filter((l) => l.status === 'inactive').length;
  const totalRent = licenses.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.rent_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500">License Management System</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-1" />Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-800">{totalHospitals}</p><p className="text-xs text-gray-500">Total</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-emerald-700">{activeHospitals}</p><p className="text-xs text-gray-500">Active</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-700">{inactiveHospitals}</p><p className="text-xs text-gray-500">Inactive</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><span className="text-lg font-bold text-amber-700">Rs.</span></div><div><p className="text-2xl font-bold text-amber-700">{totalRent.toLocaleString()}</p><p className="text-xs text-gray-500">Monthly Revenue</p></div></div></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, city, phone, license..." className="pl-10" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLicenses}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Hospitals / Pharmacies <span className="text-sm font-normal text-gray-400 ml-2">({licenses.length})</span>
          </h2>
          <AddHospitalDialog onAdded={fetchLicenses} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (<Card key={i} className="animate-pulse"><CardContent className="p-4 space-y-3"><div className="h-5 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-4 bg-gray-200 rounded w-1/2" /></CardContent></Card>))}
          </div>
        ) : licenses.length === 0 ? (
          <Card><CardContent className="py-16 text-center"><Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><h3 className="text-gray-500 text-lg">No hospitals yet</h3><p className="text-gray-400 text-sm mt-1">Click &quot;Add New Hospital&quot; button to get started</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map((license) => (<HospitalCard key={license.id} license={license} onUpdate={handleUpdate} onDelete={handleDelete} />))}
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t mt-8">UWH License Management System &copy; {new Date().getFullYear()}</footer>
      <Toaster position="top-center" />
    </div>
  );
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => { localStorage.removeItem('admin_token'); setIsLoggedIn(false); };
  if (!isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
