'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EntityList } from '@/components/ui/EntityList';
import { toast } from '@/lib/toast';

const STEPS = ['Basic info', 'Pricing', 'Create'];

export default function TeacherCoursesPage() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          subtitle: form.get('subtitle'),
          description: form.get('description'),
          pricingType: form.get('pricingType'),
          price: Number(form.get('price') || 0),
          category: form.get('category'),
          targetExam: form.get('targetExam'),
          validityDays: Number(form.get('validityDays') || 365),
          certificateEnabled: form.get('certificate') === 'on',
        }),
      });
      toast.success('Course created as draft. Add videos from the Videos page after Cloudinary is configured.');
      setStep(0);
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gc-black">Course builder</h1>
        <ol className="mt-4 flex gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className={`rounded-full px-3 py-1 ${i === step ? 'bg-gc-gold text-black' : 'bg-gc-ink text-gc-mute'}`}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      </div>
      <form onSubmit={create} className="gc-card grid gap-3 p-5 md:grid-cols-2">
        <div className={step === 0 ? 'contents' : 'hidden'}>
          <Input name="title" required label="Title" className="md:col-span-2" />
          <Input name="subtitle" label="Subtitle" className="md:col-span-2" />
          <Input name="category" label="Category" placeholder="JEE, NEET…" />
          <Input name="targetExam" label="Target exam" />
          <Textarea name="description" label="Description" className="md:col-span-2" />
        </div>
        <div className={step === 1 ? 'contents' : 'hidden'}>
          <Select name="pricingType" label="Pricing" defaultValue="paid">
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </Select>
          <Input name="price" type="number" min={0} label="Price (INR)" />
          <Input name="validityDays" type="number" min={1} label="Validity (days)" defaultValue={365} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="certificate" defaultChecked /> Certificate on completion
          </label>
        </div>
        {step === 2 ? (
          <p className="md:col-span-2 text-sm text-gc-mist">
            Review and create. The course stays draft until an admin publishes it. Subjects, chapters and videos are added after the course exists.
          </p>
        ) : null}
        <div className="md:col-span-2 flex gap-2">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          <Button loading={busy} type="submit">
            {step < 2 ? 'Next' : 'Create draft'}
          </Button>
        </div>
      </form>
      <EntityList title="Your catalogue" path="/api/courses?mine=1" />
    </div>
  );
}
