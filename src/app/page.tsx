'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster, toast } from 'sonner';
import {
  Hospital, Plus, Search, LogOut, Copy, Eye, EyeOff, Edit, Trash2,
  Shield, Users, Building2, Phone, MapPin, Key, Activity, CheckCircle2,
  XCircle, AlertTriangle, ChevronDown, RefreshCw, Settings,
} from 'lucide-react';

// Types
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
}

const ALL_FEATURES = [
  { id: 'reception', label: 'ریسیپشن', icon: '🏥' },
  { id: 'doctor', label: 'ڈاکٹر', icon: '👨‍⚕️' },
  { id: 'pharmacy', label: 'فارمیسی', icon: '💊' },
  { id: 'lab', label: 'لیب', icon: '🔬' },
  { id: 'inventory', label: 'انونٹری', icon: '📦' },
  { id: 'reports', label: 'رپورٹس', icon: '📊' },
  { id: 'appointments', label: 'اپائنٹمنٹس', icon: '📅' },
  { id: 'patients', label: 'پیٹنٹس', icon: '🤒' },
];

// Admin Login
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
        toast.success('لاگ ان کامیاب!');
      } else {
        setError(data.error || 'لاگین ناکام');
      }
    } catch {
      setError('سرور سے کنیکشن نہیں ہو سکا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-emerald-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-emerald-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">ایڈمن پینل</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            Usman Welfare Hospital — License Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">ایڈمن پاسورڈ</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="پاسورڈ درج کریں..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-left pl-10"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? 'لاگ ان ہو رہا ہے...' : 'لاگ ان کریں'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}

// Copy to clipboard helper
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${label} کاپی ہو گیا!`);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
      <Copy className="w-3.5 h-3.5" />
      {copied && <span className="text-xs text-emerald-600 mr-1">کاپی!</span>}
    </Button>
  );
}

// Hospital Card
function HospitalCard({ license, onUpdate, onDelete }: {
  license: License;
  onUpdate: (id: number, data: Partial<License>) => void;
  onDelete: (id: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: license.name, city: license.city, phone: license.phone, rent_amount: license.rent_amount, type: license.type, notes: license.notes });

  const isActive = license.status === 'active';
  const lastCheck = license.last_check_at
    ? new Date(license.last_check_at).toLocaleDateString('ur-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'کبھی چیک نہیں ہوا';

  const toggleStatus = async () => {
    const newStatus = isActive ? 'inactive' : 'active';
    await onUpdate(license.id, { status: newStatus });
  };

  const saveEdit = async () => {
    await onUpdate(license.id, editData);
    setIsEditing(false);
  };

  return (
    <Card className={`border-2 transition-all duration-200 ${isActive ? 'border-emerald-200 hover:border-emerald-400' : 'border-red-200 hover:border-red-300 opacity-75'}`}>
      <CardContent className="p-4">
        {/* Top row: Name + Status Toggle */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                {isActive ? 'فعال' : 'غیر فعال'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {license.type === 'hospital' ? 'ہسپتال' : license.type === 'pharmacy' ? 'فارمیسی' : 'کلینک'}
              </Badge>
            </div>
            {isEditing ? (
              <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="font-bold text-lg" dir="rtl" />
            ) : (
              <h3 className="font-bold text-lg text-gray-800 truncate">{license.name}</h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={toggleStatus} />
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* City & Phone */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {license.city && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{license.city}</span>
          )}
          {license.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{license.phone}</span>
          )}
          {license.rent_amount > 0 && (
            <span className="flex items-center gap-1 font-semibold text-emerald-700">Rs. {license.rent_amount.toLocaleString()}/ماہ</span>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(license.features || []).map((f) => {
            const feature = ALL_FEATURES.find((af) => af.id === f);
            return feature ? (
              <span key={f} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {feature.icon} {feature.label}
              </span>
            ) : null;
          })}
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {/* Last Check */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-gray-500">آخری چیک:</span>
              <span className="font-medium">{lastCheck}</span>
            </div>

            {/* Credentials (hidden by default) */}
            <div>
              <button onClick={() => setShowKeys(!showKeys)} className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
                <Key className="w-4 h-4" />
                {showKeys ? 'لاگ ان تفصیلات چھپائیں' : 'لاگین تفصیلات دیکھیں'}
              </button>
              {showKeys && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2 font-mono text-sm" dir="ltr">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Username:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs">{license.username}</code>
                      <CopyButton text={license.username} label="یوزرنیم" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Password:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs">
                        {showPassword ? license.password : '••••••••'}
                      </code>
                      <button onClick={() => setShowPassword(!showPassword)} className="p-1 hover:bg-gray-200 rounded">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <CopyButton text={license.password} label="پاسورڈ" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">License Key:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-0.5 rounded border text-xs text-emerald-700 font-bold">{license.license_key}</code>
                      <CopyButton text={license.license_key} label="لائسنس کی" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {license.notes && (
              <div className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg p-2">
                {license.notes}
              </div>
            )}

            {/* Edit & Delete buttons */}
            <div className="flex items-center gap-2 pt-1">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700">
                    محفوظ کریں
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditData({ name: license.name, city: license.city, phone: license.phone, rent_amount: license.rent_amount, type: license.type, notes: license.notes }); }}>
                    منسوخ
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-3.5 h-3.5 ml-1" /> ترمیم
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(license.id)}>
                    <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف
                  </Button>
                </>
              )}
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                <div>
                  <Label className="text-xs">شہر</Label>
                  <Input value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value || null })} placeholder="شہر" dir="rtl" />
                </div>
                <div>
                  <Label className="text-xs">فون نمبر</Label>
                  <Input value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value || null })} placeholder="03001234567" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs">قسم</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">ہسپتال</SelectItem>
                      <SelectItem value="pharmacy">فارمیسی</SelectItem>
                      <SelectItem value="clinic">کلینک</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">کرایہ (Rs./ماہ)</Label>
                  <Input type="number" value={editData.rent_amount} onChange={(e) => setEditData({ ...editData, rent_amount: parseInt(e.target.value) || 0 })} dir="ltr" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">نوٹ</Label>
                  <Textarea value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value || null })} placeholder="نوٹ لکھیں..." dir="rtl" />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Hospital Dialog
function AddHospitalDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', phone: '', type: 'hospital',
    features: ['reception', 'doctor', 'pharmacy'] as string[],
    rent_amount: 0, notes: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('ہسپتال کا نام ضروری ہے');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': localStorage.getItem('admin_token') || '' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${form.name} کامیابی سے شامل ہوا!`);
        onAdded();
        setOpen(false);
        setForm({ name: '', city: '', phone: '', type: 'hospital', features: ['reception', 'doctor', 'pharmacy'], rent_amount: 0, notes: '' });
      } else {
        toast.error(data.error || 'شامل کرنے میں مسئلہ ہوا');
      }
    } catch {
      toast.error('سرور سے کنیکشن نہیں ہو سکا');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg" size="lg">
          <Plus className="w-5 h-5 ml-2" />
          نئا ہسپتال شامل کریں
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-600" />
            نئا ہسپتال / فارمیسی شامل کریں
          </DialogTitle>
          <DialogDescription>نیا کلائنٹ شامل کرنے کے لیے تفصیلات درج کریں۔ لائسنس کی، یوزرنیم اور پاسورڈ خود کار طور پر بن جائیں گے۔</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>ہسپتال / فارمیسی کا نام *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثلاً: حیات ہسپتال"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>شہر</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="کراچی"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>فون نمبر</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03001234567"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>قسم</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">ہسپتال</SelectItem>
                  <SelectItem value="pharmacy">فارمیسی</SelectItem>
                  <SelectItem value="clinic">کلینک</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>کرایہ (Rs./ماہ)</Label>
              <Input
                type="number"
                value={form.rent_amount}
                onChange={(e) => setForm({ ...form, rent_amount: parseInt(e.target.value) || 0 })}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>فیچرز منتخب کریں</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_FEATURES.map((feature) => (
                <label
                  key={feature.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    form.features.includes(feature.id)
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={form.features.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <span className="text-sm">{feature.icon} {feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>نوٹ</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="کوئی خاص نوٹ..."
              dir="rtl"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>منسوخ</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'شامل ہو رہا ہے...' : 'شامل کریں'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Dashboard
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

      const res = await fetch(`/api/admin/licenses?${params.toString()}`, {
        headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' },
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      const data = await res.json();
      setLicenses(data.licenses || []);
    } catch {
      toast.error('ڈیٹا لوڈ نہیں ہو سکا');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterType, onLogout]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleUpdate = async (id: number, updateData: Partial<License>) => {
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': localStorage.getItem('admin_token') || '' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        toast.success('اپ ڈیٹ ہو گیا!');
        fetchLicenses();
      } else {
        toast.error('اپ ڈیٹ نہیں ہو سکا');
      }
    } catch {
      toast.error('سرور سے کنیکشن نہیں ہو سکا');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('کیا آپ واقعی اس ہسپتال کو حذف کرنا چاہتے ہیں؟')) return;

    try {
      const res = await fetch(`/api/admin/licenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' },
      });

      if (res.ok) {
        toast.success('حذف ہو گیا!');
        fetchLicenses();
      } else {
        toast.error('حذف نہیں ہو سکا');
      }
    } catch {
      toast.error('سرور سے کنیکشن نہیں ہو سکا');
    }
  };

  // Stats
  const totalHospitals = licenses.length;
  const activeHospitals = licenses.filter((l) => l.status === 'active').length;
  const inactiveHospitals = licenses.filter((l) => l.status === 'inactive').length;
  const totalRent = licenses.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.rent_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">ایڈمن پینل</h1>
              <p className="text-xs text-gray-500">License Management System</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 ml-1" />
            لاگ آؤٹ
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{totalHospitals}</p>
                  <p className="text-xs text-gray-500">کل ہسپتال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{activeHospitals}</p>
                  <p className="text-xs text-gray-500">فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{inactiveHospitals}</p>
                  <p className="text-xs text-gray-500">غیر فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-700">Rs.</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{totalRent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ماہانہ آمدنی</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ہسپتال کا نام، شہر، فون، لائسنس..."
                  className="pr-10"
                  dir="rtl"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-36" dir="rtl">
                  <SelectValue placeholder="حالت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">تمام</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیر فعال</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-36" dir="rtl">
                  <SelectValue placeholder="قسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">تمام</SelectItem>
                  <SelectItem value="hospital">ہسپتال</SelectItem>
                  <SelectItem value="pharmacy">فارمیسی</SelectItem>
                  <SelectItem value="clinic">کلینک</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLicenses}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            ہسپتال / فارمیسی فہرست
            <span className="text-sm font-normal text-gray-400 mr-2">({licenses.length})</span>
          </h2>
          <AddHospitalDialog onAdded={fetchLicenses} />
        </div>

        {/* Hospital Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : licenses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-500 text-lg">کوئی ہسپتال موجود نہیں</h3>
              <p className="text-gray-400 text-sm mt-1">اوپر &quot;نئا ہسپتال شامل کریں&quot; بٹن سے شامل کریں</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map((license) => (
              <HospitalCard key={license.id} license={license} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t mt-8">
        UWH License Management System &copy; {new Date().getFullYear()}
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}

// Main App
export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
