'use client';

import { useRef, useState } from 'react';
import { Button } from './Button';

export function FileUploader({
  label,
  accept,
  onSelect,
}: {
  label: string;
  accept?: string;
  onSelect: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  return (
    <div className="gc-card p-4">
      <p className="text-sm text-gc-mist">{label}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setName(`${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB`);
          onSelect(f);
        }}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button variant="ghost" type="button" onClick={() => ref.current?.click()}>
          Choose file
        </Button>
        <span className="text-xs text-gc-mute">{name || 'No file selected'}</span>
      </div>
    </div>
  );
}
