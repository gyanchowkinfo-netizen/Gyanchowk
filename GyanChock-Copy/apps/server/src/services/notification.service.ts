import { NotificationModel, NotificationPreferenceModel } from '../models/index.js';

export async function notify(input: {
  userId: string;
  title: string;
  body?: string;
  type: string;
  href?: string;
  meta?: unknown;
}) {
  const prefs = await NotificationPreferenceModel.findOne({ user: input.userId }).lean();
  if (prefs?.mutedTypes?.includes(input.type)) return;
  if (prefs && prefs.inApp === false) return;
  await NotificationModel.create({
    user: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    href: input.href,
    meta: input.meta,
  });
}

export async function notifyMany(
  userIds: string[],
  payload: Omit<Parameters<typeof notify>[0], 'userId'>,
) {
  const unique = [...new Set(userIds)];
  await Promise.all(unique.map((userId) => notify({ ...payload, userId })));
}
