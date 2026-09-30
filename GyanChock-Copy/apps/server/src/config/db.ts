import mongoose from 'mongoose';
import { env } from './env.js';

type TextRepair = {
  collection: string;
  keep: string;
  keys: Record<string, 'text'>;
};

const TEXT_REPAIRS: TextRepair[] = [
  {
    collection: 'courses',
    keep: 'course_text_search',
    keys: { title: 'text', subtitle: 'text', description: 'text' },
  },
  {
    collection: 'batches',
    keep: 'batch_text_search',
    keys: { name: 'text', description: 'text' },
  },
  {
    collection: 'users',
    keep: 'user_text_search',
    keys: { name: 'text', email: 'text', headline: 'text' },
  },
];

/**
 * Course/user/batch docs store a product `language` field (English/Hindi/Hinglish).
 * MongoDB text indexes use `language` as search-language override by default, which
 * rejects Hindi/Hinglish on save. Rebuild text indexes with a dummy override field.
 */
async function repairTextIndexes() {
  for (const { collection, keep, keys } of TEXT_REPAIRS) {
    try {
      const col = mongoose.connection.collection(collection);
      const indexes = await col.indexes();
      for (const idx of indexes) {
        const isText = Object.values(idx.key ?? {}).includes('text');
        if (!isText || !idx.name) continue;
        const overrideOk = idx.name === keep && idx.language_override === '_searchLang';
        if (overrideOk) continue;
        await col.dropIndex(idx.name);
        console.log(`[db] dropped text index ${collection}.${idx.name}`);
      }
      const hasKeep = (await col.indexes()).some(
        (idx) => idx.name === keep && idx.language_override === '_searchLang',
      );
      if (!hasKeep) {
        await col.createIndex(keys, {
          name: keep,
          default_language: 'none',
          language_override: '_searchLang',
        });
        console.log(`[db] created text index ${collection}.${keep}`);
      }
    } catch (err) {
      console.warn(`[db] text index repair skipped for ${collection}:`, err instanceof Error ? err.message : err);
    }
  }
}

export async function connectDb(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: false,
  });
  await repairTextIndexes();
  return mongoose;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
