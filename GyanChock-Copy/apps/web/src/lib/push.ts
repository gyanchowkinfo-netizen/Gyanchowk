import { api } from './api';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export async function subscribeWebPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push is not supported in this browser');
  }
  const { publicKey } = await api<{ publicKey: string }>('/api/notifications/push/public-key');
  if (!publicKey) throw new Error('Push is not configured on the server');
  const reg = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted');
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Push subscription was incomplete');
  }
  await api('/api/notifications/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    }),
  });
}

export async function resubscribeWebPushIfGranted() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    await subscribeWebPush();
  } catch {
    // Permission may already be granted on a machine without VAPID configured.
  }
}
