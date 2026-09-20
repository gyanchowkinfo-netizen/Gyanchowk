export function isUnauthorizedError(error: unknown) {
  return error instanceof Error && (/\b401\b/i.test(error.message) || /unauthorized/i.test(error.message));
}

export function apiQueryRetry(failureCount: number, error: unknown) {
  if (isUnauthorizedError(error)) return false;
  return failureCount < 1;
}
