'use client';

import { FormEvent, useState } from 'react';
import { ResourceManager } from '@/components/panel/ResourceManager';
import { formatPaise } from '@/lib/format';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

export default function Page() {
  const [busy, setBusy] = useState(false);

  async function credit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api('/api/wallet/credit', {
        method: 'POST',
        body: JSON.stringify({
          userId: form.get('userId'),
          amountPaise: Math.round(Number(form.get('amount') || 0) * 100),
          type: form.get('type'),
        }),
      });
      toast.success('Wallet credited');
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={credit} className="gc-card grid gap-3 p-5 md:grid-cols-4">
        <Input name="userId" label="User id" required />
        <Input name="amount" type="number" min={1} label="Amount (INR)" required />
        <Select name="type" label="Type" defaultValue="credit_promo">
          <option value="credit_promo">Promo</option>
          <option value="credit_cashback">Cashback</option>
        </Select>
        <div className="flex items-end">
          <Button loading={busy} type="submit">
            Credit wallet
          </Button>
        </div>
      </form>
      <ResourceManager
        title="Wallets"
        path="/api/wallet/all"
        empty="No wallets yet"
        columns={[
          { key: 'user', label: 'User' },
          { key: 'balancePaise', label: 'Balance', render: (row) => formatPaise(Number(row.balancePaise ?? 0)) },
          { key: 'referralPaise', label: 'Referral', render: (row) => formatPaise(Number(row.referralPaise ?? 0)) },
        ]}
      />
    </div>
  );
}
