import Link from 'next/link';
import type { ReactNode } from 'react';

export function SystemPage({
  code,
  title,
  body,
  action,
}: {
  code: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-gc-gold">{code}</p>
      <h1 className="mt-2 font-display text-3xl">{title}</h1>
      {body ? <p className="mt-3 text-sm text-gc-mute">{body}</p> : null}
      <div className="mt-6">{action}</div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <SystemPage
      code="404"
      title="This page is off the chowk."
      body="The link may be expired or the content was unpublished."
      action={
        <Link href="/" className="gc-btn-gold inline-flex">
          Back home
        </Link>
      }
    />
  );
}

export function UnauthorizedPage() {
  return (
    <SystemPage
      code="401"
      title="Sign in required"
      body="This area is private. Student, teacher and admin panels are not indexed."
      action={
        <Link href="/login" className="gc-btn-gold inline-flex">
          Log in
        </Link>
      }
    />
  );
}

export function ForbiddenPage() {
  return (
    <SystemPage
      code="403"
      title="You cannot open this"
      body="Your role does not include this page. Ask an administrator if you need access."
      action={
        <Link href="/" className="gc-btn-ghost inline-flex">
          Home
        </Link>
      }
    />
  );
}

export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <SystemPage
      code="500"
      title="Something went wrong"
      body="The server could not complete this request. No stack traces are shown here."
      action={
        onRetry ? (
          <button className="gc-btn-blue" onClick={onRetry}>
            Try again
          </button>
        ) : (
          <Link href="/" className="gc-btn-blue inline-flex">
            Home
          </Link>
        )
      }
    />
  );
}

export function MaintenancePage() {
  return (
    <SystemPage
      code="503"
      title="Gyan Chowk is under maintenance"
      body="Recorded lessons will return shortly. Payments are not accepted during maintenance."
    />
  );
}

export function NetworkErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <SystemPage
      code="Offline"
      title="Network error"
      body="We could not reach the Gyan Chowk API. Check your connection, then retry."
      action={
        onRetry ? (
          <button className="gc-btn-gold" onClick={onRetry}>
            Retry
          </button>
        ) : null
      }
    />
  );
}

export function OfflinePage() {
  return (
    <SystemPage
      code="Offline"
      title="You are offline"
      body="Video playback and tests need a connection so progress can be saved on the server."
    />
  );
}
