import Link from 'next/link';

export function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`gc-container py-8 md:py-12 lg:py-16 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="gc-heading font-display text-[2rem] font-normal tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gc-mute">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">{actions}</div> : null}
    </header>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto text-sm text-gc-mute">
      <ol className="flex min-w-max items-center">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center">
            {i > 0 ? <span className="mx-2 text-gc-line">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-gc-blue">
                {item.label}
              </Link>
            ) : (
              <span className="text-gc-black">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeader({ title, href, action, subtitle }: { title: string; href?: string; action?: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="gc-heading font-display text-2xl font-normal tracking-tight sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-gc-mute">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm text-gc-mute hover:text-gc-black">
          {action ?? 'View all'}
        </Link>
      ) : null}
    </div>
  );
}
