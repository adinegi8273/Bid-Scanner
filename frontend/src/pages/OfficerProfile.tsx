import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getOfficerProfile, updateOfficerProfile } from '../services/officerService';
import { Officer } from '../types';

export function OfficerProfile() {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [form, setForm] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfficerProfile()
      .then((o) => { setOfficer(o); setForm(o); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof Officer, value: string) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await updateOfficerProfile(form);
      setOfficer(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(officer);
    setSaved(false);
  };

  if (loading) return <AppLayout><LoadingState message="Loading profile..." /></AppLayout>;
  if (error || !form) return <AppLayout><ErrorState message={error ?? 'Profile not found'} /></AppLayout>;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Officer Profile</div>
        <div className="page-subtitle">View and update your procurement officer details</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, maxWidth: 960 }}>
        {/* Profile Card */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, margin: '0 auto 12px',
            }}>
              {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{form.name}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{form.designation}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{form.officerId}</div>
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--color-primary-light)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {form.department.split('(')[0].trim()}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Personal Information</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input id="name" className="form-input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="officerId">Officer ID</label>
                <input id="officerId" className="form-input" value={form.officerId} readOnly style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="designation">Designation</label>
                <input id="designation" className="form-input" value={form.designation} onChange={(e) => handleChange('designation', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" type="email" className="form-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input id="phone" className="form-input" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input id="department" className="form-input" value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officeLocation">Office Location</label>
              <textarea id="officeLocation" className="form-textarea" value={form.officeLocation} onChange={(e) => handleChange('officeLocation', e.target.value)} style={{ minHeight: 60 }} />
            </div>

            <div className="flex gap-3" style={{ marginTop: 8 }}>
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
