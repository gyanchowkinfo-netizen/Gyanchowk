'use client';

import { FormEvent, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatPaise } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { DataTable, statusCell } from '@/components/ui/DataTable';
import { ConfirmDialog, Modal } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState, Pagination } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { useDebounce } from '@/lib/hooks';

export type ManagerColumn = {
  key: string;
  label: string;
  kind?: 'text' | 'status' | 'date' | 'paise' | 'bool';
  render?: (row: Record<string, unknown>) => ReactNode;
};

export type ManagerField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'datetime';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export type ManagerAction = {
  label: string;
  variant?: 'ghost' | 'danger' | 'primary';
  confirm?: { title: string; body: string; confirmLabel?: string };
  href?: (row: Record<string, unknown>) => string;
  path?: (row: Record<string, unknown>) => string;
  method?: string;
  body?: (row: Record<string, unknown>) => unknown;
  success?: string;
};

function cell(col: ManagerColumn, row: Record<string, unknown>) {
  if (col.render) return col.render(row);
  const value = row[col.key];
  if (col.kind === 'status') return statusCell(value);
  if (col.kind === 'date') return formatDate(typeof value === 'string' ? value : undefined) ?? '—';
  if (col.kind === 'paise') return formatPaise(Number(value ?? 0));
  if (col.kind === 'bool') return value ? 'Yes' : 'No';
  if (value && typeof value === 'object' && 'name' in (value as object)) return String((value as { name?: string }).name);
  if (value && typeof value === 'object' && 'title' in (value as object)) return String((value as { title?: string }).title);
  if (value && typeof value === 'object' && 'email' in (value as object)) return String((value as { email?: string }).email);
  return value == null || value === '' ? '—' : String(value);
}

function extractItems(data: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
  const tx = data.transactions as { items?: Record<string, unknown>[] } | undefined;
  if (Array.isArray(tx?.items)) return tx.items;
  return [];
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl text-gc-black">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-gc-mute">{subtitle}</p> : null}
      </div>
      {action ? (
        <Button type="button" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function ResourceManager({
  title,
  subtitle,
  path,
  columns,
  empty,
  emptyCta,
  create,
  edit,
  actions = [],
  filters = [],
}: {
  title: string;
  subtitle?: string;
  path: string;
  columns: ManagerColumn[];
  empty: string;
  emptyCta?: string;
  create?: {
    label: string;
    path: string;
    method?: string;
    fields: ManagerField[];
    success?: string;
    transform?: (form: FormData) => unknown;
  };
  edit?: {
    label: string;
    path: (row: Record<string, unknown>) => string;
    fields: ManagerField[];
    success?: string;
    transform?: (form: FormData, row: Record<string, unknown>) => unknown;
    fromRow: (row: Record<string, unknown>) => Record<string, string | number | boolean>;
  };
  actions?: ManagerAction[];
  filters?: Array<{ name: string; label: string; options: Array<{ value: string; label: string }> }>;
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const dq = useDebounce(q, 400);
  const [openCreate, setOpenCreate] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ action: ManagerAction; row: Record<string, unknown> } | null>(null);
  const sep = path.includes('?') ? '&' : '?';
  const filterQs = Object.entries(filterState)
    .filter(([, v]) => v)
    .map(([k, v]) => `&${k}=${encodeURIComponent(v)}`)
    .join('');
  const url = `${path}${sep}page=${page}&limit=20&q=${encodeURIComponent(dq)}${filterQs}`;
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [url],
    queryFn: () => api<{ items?: Record<string, unknown>[]; total?: number; pages?: number } & Record<string, unknown>>(url),
  });
  const items = extractItems(data as Record<string, unknown> | undefined);
  const cols = columns.map((c) => ({
    key: c.key,
    label: c.label,
    render: (row: Record<string, unknown>) => cell(c, row),
  }));
  if (edit || actions.length) {
    cols.push({
      key: '_actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => (
        <div className="flex flex-wrap justify-end gap-2">
          {edit ? (
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditRow(row)}>
              {edit.label}
            </Button>
          ) : null}
          {actions.map((action) =>
            action.href ? (
              <a key={action.label} href={action.href(row)} className="gc-btn-ghost text-xs">
                {action.label}
              </a>
            ) : (
              <Button
                key={action.label}
                type="button"
                variant={action.variant ?? 'ghost'}
                className="text-xs"
                aria-label={action.label}
                onClick={() => {
                  if (action.confirm) setPending({ action, row });
                  else void runAction(action, row);
                }}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      ),
    });
  }

  async function runAction(action: ManagerAction, row: Record<string, unknown>) {
    if (!action.path) return;
    setBusy(true);
    try {
      await api(action.path(row), {
        method: action.method ?? 'POST',
        body: action.body ? JSON.stringify(action.body(row)) : undefined,
      });
      toast.success(action.success ?? `${action.label} saved`);
      setPending(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  function fieldDefault(defaults: Record<string, string | number | boolean> | undefined, name: string) {
    const raw = defaults?.[name];
    if (raw === undefined || raw === null) return '';
    if (typeof raw === 'boolean') return raw ? 'true' : '';
    return raw;
  }

  function renderFields(fields: ManagerField[], defaults?: Record<string, string | number | boolean>) {
    return fields.map((field) => {
      const valueProp = defaults ? { defaultValue: fieldDefault(defaults, field.name) } : {};
      if (field.type === 'textarea') {
        return (
          <Textarea key={field.name} name={field.name} label={field.label} required={field.required} {...valueProp} />
        );
      }
      if (field.type === 'select') {
        return (
          <Select key={field.name} name={field.name} label={field.label} required={field.required} {...valueProp}>
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        );
      }
      if (field.type === 'checkbox') {
        return (
          <label key={field.name} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={field.name} defaultChecked={Boolean(defaults?.[field.name])} /> {field.label}
          </label>
        );
      }
      return (
        <Input
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type === 'datetime' ? 'datetime-local' : field.type ?? 'text'}
          required={field.required}
          placeholder={field.placeholder}
          {...valueProp}
        />
      );
    });
  }

  async function onEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit || !editRow) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const body = edit.transform
        ? edit.transform(form, editRow)
        : Object.fromEntries(
            [...form.entries()].map(([k, v]) => {
              if (v === 'on') return [k, true];
              const n = Number(v);
              return [k, String(v).trim() !== '' && !Number.isNaN(n) && String(v) === String(n) ? n : v];
            }),
          );
      await api(edit.path(editRow), { method: 'PATCH', body: JSON.stringify(body) });
      toast.success(edit.success ?? 'Updated');
      setEditRow(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!create) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const body = create.transform
        ? create.transform(form)
        : Object.fromEntries(
            [...form.entries()].map(([k, v]) => {
              if (v === 'on') return [k, true];
              const n = Number(v);
              return [k, String(v).trim() !== '' && !Number.isNaN(n) && String(v) === String(n) ? n : v];
            }),
          );
      await api(create.path, { method: create.method ?? 'POST', body: JSON.stringify(body) });
      toast.success(create.success ?? 'Created');
      setOpenCreate(false);
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={create ? { label: create.label, onClick: () => setOpenCreate(true) } : undefined}
      />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input aria-label="Search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        {filters.map((f) => (
          <Select
            key={f.name}
            label={f.label}
            value={filterState[f.name] ?? ''}
            onChange={(e) => setFilterState((s) => ({ ...s, [f.name]: e.target.value }))}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        ))}
      </div>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState
          title={empty}
          body="When data is available it will appear here."
          action={create ? { label: emptyCta ?? create.label, onClick: () => setOpenCreate(true) } : undefined}
        />
      ) : null}
      {items.length > 0 ? <DataTable columns={cols} rows={items} /> : null}
      <Pagination page={page} pages={data?.pages ?? 1} onPage={setPage} />
      <Modal open={openCreate} title={create?.label ?? 'Create'} onClose={() => setOpenCreate(false)}>
        {create ? (
          <form onSubmit={(e) => void onCreate(e)} className="grid gap-3">
            {renderFields(create.fields)}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>
                Cancel
              </Button>
              <Button loading={busy} type="submit">
                Save
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
      <Modal open={Boolean(editRow)} title={edit?.label ?? 'Edit'} onClose={() => setEditRow(null)}>
        {edit && editRow ? (
          <form key={String(editRow._id)} onSubmit={(e) => void onEdit(e)} className="grid gap-3">
            {renderFields(edit.fields, edit.fromRow(editRow))}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditRow(null)}>
                Cancel
              </Button>
              <Button loading={busy} type="submit">
                Update
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.action.confirm?.title ?? 'Confirm'}
        body={pending?.action.confirm?.body ?? ''}
        confirmLabel={pending?.action.confirm?.confirmLabel ?? pending?.action.label}
        loading={busy}
        onClose={() => setPending(null)}
        onConfirm={() => pending && void runAction(pending.action, pending.row)}
      />
    </section>
  );
}
