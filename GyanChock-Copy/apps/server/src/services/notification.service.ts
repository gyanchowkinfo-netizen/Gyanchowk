import { NotificationModel, NotificationPreferenceModel, UserModel } from '../models/index.js';
import { sendAnnouncementEmail } from './email.service.js';
import { sendPush } from './push.service.js';

export type NotifyChannel = 'inApp' | 'email' | 'push';

export async function notify(input: {
  userId: string;
  title: string;
  body?: string;
  type: string;
  href?: string;
  meta?: unknown;
  channels?: NotifyChannel[];
}) {
  const prefs = await NotificationPreferenceModel.findOne({ user: input.userId }).lean();
  if (prefs?.mutedTypes?.includes(input.type)) return;

  const requested = input.channels ?? (['inApp', 'email', 'push'] as NotifyChannel[]);
  const user = requested.some((c) => c !== 'inApp')
    ? await UserModel.findById(input.userId).select('email name').lean()
    : null;

  if (requested.includes('inApp') && prefs?.inApp !== false) {
    await NotificationModel.create({
      user: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      href: input.href,
      meta: input.meta,
    });
  }

  if (requested.includes('email') && prefs?.email !== false && user?.email) {
    await sendAnnouncementEmail(user.email, input.title, input.body ?? '');
  }

  if (requested.includes('push') && prefs?.push !== false) {
    await sendPush(input.userId, { title: input.title, body: input.body, href: input.href });
  }
}

export async function notifyMany(
  userIds: string[],
  payload: Omit<Parameters<typeof notify>[0], 'userId'>,
) {
  const unique = [...new Set(userIds)];
  await Promise.all(unique.map((userId) => notify({ ...payload, userId })));
}
