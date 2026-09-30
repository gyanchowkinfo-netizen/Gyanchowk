/**
 * setup-next-dir.mjs
 *
 * Run automatically via "predev" npm script before `next dev`.
 *
 * On Windows + OneDrive: Creates apps/web/.next with Hidden+System attributes so
 * OneDrive does NOT sync it. This keeps:
 *   - Next.js writing to .next as normal (distDir stays default)
 *   - Node.js module resolution working (node_modules is still an ancestor)
 *   - OneDrive from locking the build files (it skips Hidden+System folders)
 *
 * On any other OS or in Vercel CI (VERCEL=1), this is a no-op.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const dotNextPath = path.join(webRoot, '.next');

// Skip on non-Windows or Vercel CI
if (process.platform !== 'win32' || process.env.VERCEL) {
  process.exit(0);
}

// Ensure .next directory exists
fs.mkdirSync(dotNextPath, { recursive: true });

// Set Hidden+System attributes so OneDrive skips this folder.
// We use attrib.exe (the /D flag applies to directories).
try {
  execSync(`attrib +H +S "${dotNextPath}" /D`, { stdio: 'pipe' });
  console.log('[setup-next-dir] .next marked as Hidden+System (OneDrive will not sync it)');
} catch {
  // attrib may fail in some environments — not fatal, just warn
  console.warn('[setup-next-dir] Could not set Hidden+System on .next (non-fatal)');
}
