export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, score);
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

export function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordScore(password);
  return (
    <div>
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < score ? 'bg-gc-gold' : 'bg-gc-navy'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-gc-mute" role="status">
        {LABELS[score]} — use 8+ characters with mixed case, a number and a symbol.
      </p>
    </div>
  );
}
