import webpush from 'web-push';

// Validate environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:noreply@example.com';

if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn(
        'VAPID keys are not configured. Run: pnpm run generate:vapid'
    );
}

// Configure web-push
if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export { webpush };

export function getVapidPublicKey() {
    if (!vapidPublicKey) {
        throw new Error('VAPID_PUBLIC_KEY is not configured');
    }
    return vapidPublicKey;
}

