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

/**
 * Legacy compound indexes with sparse: true in MongoDB do NOT omit documents
 * unless all indexed keys are absent. Since user is always present, enrollments
 * with batch: null conflict on user_1_batch_1 for subsequent course enrollments.
 * Ensure partialFilterExpression is used instead of sparse.
 */
async function repairEnrollmentIndexes() {
  try {
    const col = mongoose.connection.collection('enrollments');
    const indexes = await col.indexes();
    for (const idx of indexes) {
      if (idx.name === 'user_1_batch_1' || idx.name === 'user_1_course_1') {
        const hasPartial = Boolean(idx.partialFilterExpression);
        if (!hasPartial || idx.sparse) {
          await col.dropIndex(idx.name);
          console.log(`[db] dropped legacy index enrollments.${idx.name}`);
        }
      }
    }
    const updatedIndexes = await col.indexes();
    if (!updatedIndexes.some((idx) => idx.name === 'user_1_batch_1')) {
      await col.createIndex(
        { user: 1, batch: 1 },
        {
          name: 'user_1_batch_1',
          unique: true,
          partialFilterExpression: { batch: { $exists: true, $type: 'objectId' } },
        },
      );
      console.log('[db] created partial unique index enrollments.user_1_batch_1');
    }
    if (!updatedIndexes.some((idx) => idx.name === 'user_1_course_1')) {
      await col.createIndex(
        { user: 1, course: 1 },
        {
          name: 'user_1_course_1',
          unique: true,
          partialFilterExpression: { course: { $exists: true, $type: 'objectId' } },
        },
      );
      console.log('[db] created partial unique index enrollments.user_1_course_1');
    }
  } catch (err) {
    console.warn('[db] enrollment index repair skipped:', err instanceof Error ? err.message : err);
  }
}

export async function connectDb(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: false,
  });
  await repairTextIndexes();
  await repairEnrollmentIndexes();
  return mongoose;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
