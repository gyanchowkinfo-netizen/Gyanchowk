import Link from 'next/link';

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="gc-heading font-display text-3xl md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-gc-mute">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gc-mute">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 ? <span className="mx-2">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-gc-gold">
              {item.label}
            </Link>
          ) : (
            <span className="text-gc-mist">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="gc-heading font-display text-2xl">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm text-gc-blue hover:underline">
          {action ?? 'View all'}
        </Link>
      ) : null}
    </div>
  );
}
