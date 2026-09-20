import webpush from 'web-push';
import { env } from '../config/env.js';
import { UserModel } from '../models/index.js';

export function isPushConfigured() {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
}

function configure() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  return true;
}

export async function sendPush(userId: string, payload: { title: string; body?: string; href?: string }) {
  if (!configure()) return { skipped: true as const };
  const user = await UserModel.findById(userId).select('pushSubscriptions').lean();
  const subs = (user as { pushSubscriptions?: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }> } | null)
    ?.pushSubscriptions;
  if (!subs?.length) return { skipped: true as const };
  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await UserModel.updateOne({ _id: userId }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } });
        }
      }
    }),
  );
  return { skipped: false as const };
}

export async function savePushSubscription(
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  await UserModel.updateOne(
    { _id: userId },
    {
      $pull: { pushSubscriptions: { endpoint: sub.endpoint } },
    },
  );
  await UserModel.updateOne(
    { _id: userId },
    {
      $push: { pushSubscriptions: { ...sub, createdAt: new Date() } },
    },
  );
}

export async function removePushSubscription(userId: string, endpoint: string) {
  await UserModel.updateOne({ _id: userId }, { $pull: { pushSubscriptions: { endpoint } } });
}
