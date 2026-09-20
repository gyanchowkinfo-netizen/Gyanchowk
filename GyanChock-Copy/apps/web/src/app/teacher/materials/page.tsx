'use client';

import { FormEvent, useState } from 'react';
import { ResourceManager } from '@/components/panel/ResourceManager';
import { api } from '@/lib/api';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

export default function TeacherMaterialsPage() {
  const [busy, setBusy] = useState(false);

  async function onFile(file: File, form: HTMLFormElement) {
    setBusy(true);
    try {
      const sig = await api<{
        timestamp: number;
        signature: string;
        folder: string;
        cloudName: string;
        apiKey: string;
      }>('/api/uploads/signature', {
        method: 'POST',
        body: JSON.stringify({ folder: 'materials', resourceType: 'raw' }),
      });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`, { method: 'POST', body: fd });
      const json = (await cloud.json()) as { public_id?: string; secure_url?: string; bytes?: number; error?: { message?: string } };
      if (!json.public_id) throw new Error(json.error?.message || 'Upload failed');
      const fields = new FormData(form);
      await api('/api/learning/materials', {
        method: 'POST',
        body: JSON.stringify({
          title: fields.get('title'),
          type: fields.get('type'),
          course: fields.get('course') || undefined,
          publicId: json.public_id,
          url: json.secure_url,
          bytes: json.bytes,
        }),
      });
      toast.success('Material published');
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form className="gc-card grid gap-3 p-5 md:grid-cols-2" onSubmit={(e: FormEvent) => e.preventDefault()}>
        <Input name="title" label="Title" required />
        <Select name="type" label="Type" defaultValue="pdf_notes">
          <option value="pdf_notes">PDF notes</option>
          <option value="class_notes">Class notes</option>
          <option value="revision_notes">Revision notes</option>
          <option value="formula_sheet">Formula sheet</option>
          <option value="question_bank">Question bank</option>
          <option value="assignment">Assignment</option>
          <option value="pyq">PYQ</option>
        </Select>
        <Input name="course" label="Course id" />
        <div className="md:col-span-2">
          <FileUploader
            label={busy ? 'Uploading…' : 'Upload file'}
            onSelect={(file) => {
              const form = (document.querySelector('form.gc-card') as HTMLFormElement | null);
              if (form) void onFile(file, form);
            }}
          />
        </div>
      </form>
      <ResourceManager
        title="Materials"
        path="/api/learning/materials"
        empty="No materials yet"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type', kind: 'status' },
          { key: 'status', label: 'Status', kind: 'status' },
        ]}
        actions={[
          {
            label: 'Unpublish',
            variant: 'danger',
            path: (row) => `/api/learning/materials/${row._id}`,
            method: 'PATCH',
            body: () => ({ status: 'hidden' }),
            confirm: { title: 'Unpublish?', body: 'Students will no longer see this file.' },
          },
        ]}
      />
    </div>
  );
}
