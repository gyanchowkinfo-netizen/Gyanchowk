'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#f6f8fc', color: '#1e3d7a', fontFamily: 'sans-serif', margin: 0 }}>
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#f8b000', letterSpacing: '0.2em' }}>500</p>
          <h1 style={{ fontSize: '1.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#4d6490', fontSize: '0.9rem' }}>The server could not complete this request. Try again, or go back home.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              border: 0,
              borderRadius: 12,
              padding: '10px 20px',
              background: '#003898',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
