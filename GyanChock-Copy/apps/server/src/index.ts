import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';
import { startScheduledJobs } from './jobs/cron.js';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Gyan Chowk API listening on :${env.PORT}`);
    startScheduledJobs();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
