'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength';

export default function StudentSettingsPage() {
  const { user, refresh, logout } = useAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [allOpen, setAllOpen] = useState(false);
  const prefs = useQuery({
    queryKey: ['notif-prefs'],
    queryFn: () => api<{ prefs: { inApp?: boolean; email?: boolean; push?: boolean } }>('/api/notifications/preferences'),
  });

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: form.get('name'), state: form.get('state'), language: form.get('language') }),
      });
      await refresh();
      toast.success('Profile saved');
      setMsg('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword: form.get('newPassword') }),
      });
      toast.success('Password updated');
      setMsg('Password updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function savePrefs(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          inApp: form.get('inApp') === 'on',
          email: form.get('email') === 'on',
          push: form.get('push') === 'on',
        }),
      });
      toast.success('Preferences saved');
      await prefs.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="gc-card space-y-3 p-5">
        <h1 className="font-display text-2xl text-gc-black">Profile</h1>
        {user?.mustChangePassword ? (
          <p className="text-sm text-amber-300">Please change the initial password after first login.</p>
        ) : null}
        <Input name="name" label="Name" defaultValue={user?.name} />
        <Input name="state" label="State" placeholder="State" />
        <Select name="language" label="Language" defaultValue="en">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </Select>
        <Button loading={busy} type="submit">
          Save
        </Button>
      </form>
      <form onSubmit={changePassword} className="gc-card space-y-3 p-5">
        <h2 className="font-display text-2xl text-gc-black">Password</h2>
        <Input type="password" name="currentPassword" label="Current" required autoComplete="current-password" />
        <Input
          type="password"
          name="newPassword"
          label="New"
          minLength={8}
          required
          autoComplete="new-password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <PasswordStrengthIndicator password={newPass} />
        <Button variant="blue" loading={busy} type="submit">
          Update password
        </Button>
        {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      </form>
      <form onSubmit={savePrefs} className="gc-card space-y-3 p-5">
        <h2 className="font-display text-2xl text-gc-black">Notifications</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="inApp" defaultChecked={prefs.data?.prefs.inApp !== false} /> In-app
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="email" defaultChecked={prefs.data?.prefs.email !== false} /> Email
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="push" defaultChecked={Boolean(prefs.data?.prefs.push)} /> Push (when configured)
        </label>
        <Button type="submit">Save preferences</Button>
      </form>
      <div className="gc-card space-y-3 p-5">
        <h2 className="font-display text-2xl text-gc-black">Sessions</h2>
        <p className="text-sm text-gc-mute">Sign out every device that holds a refresh cookie. Individual device listing is not exposed.</p>
        <Button variant="danger" type="button" onClick={() => setAllOpen(true)}>
          Sign out all devices
        </Button>
      </div>
      <ConfirmDialog
        open={allOpen}
        title="Sign out all devices?"
        body="Every refresh session for this account will be revoked."
        confirmLabel="Sign out everywhere"
        onClose={() => setAllOpen(false)}
        onConfirm={async () => {
          await logout(true);
          window.location.href = '/login';
        }}
      />
    </div>
  );
}
