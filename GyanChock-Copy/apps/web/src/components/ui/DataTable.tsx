'use client';

import { StatusBadge } from './Badge';

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRow,
}: {
  columns: Array<{ key: string; label: string; render?: (row: T) => React.ReactNode }>;
  rows: T[];
  onRow?: (row: T) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-gc-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[color:var(--gyan-primary-soft)] text-gc-mute">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={String(row._id ?? row.id ?? i)}
                className="border-t border-gc-line/60 hover:bg-gc-ink/60"
                onClick={() => onRow?.(row)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((row, i) => {
          const actions = columns.filter((c) => c.key === '_actions');
          const rest = columns.filter((c) => c.key !== '_actions').slice(0, 4);
          return (
            <li key={String(row._id ?? row.id ?? i)} className="gc-card p-4 text-sm">
              {rest.map((c) => (
                <p key={c.key} className="flex justify-between gap-3 py-1">
                  <span className="text-gc-mute">{c.label}</span>
                  <span className="text-right">{c.render ? c.render(row) : String(row[c.key] ?? '—')}</span>
                </p>
              ))}
              {actions.map((c) => (
                <div key={c.key} className="mt-3 border-t border-gc-line pt-3">
                  {c.render ? c.render(row) : null}
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function statusCell(value: unknown) {
  return <StatusBadge status={String(value ?? '')} />;
}
