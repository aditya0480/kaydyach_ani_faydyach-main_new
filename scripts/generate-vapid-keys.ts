import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.info('\n=================================');
console.info('VAPID Keys Generated Successfully!');
console.info('=================================\n');
console.info('Add these to your .env file:\n');
console.info(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.info(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.info(`VAPID_SUBJECT=mailto:your-email@example.com\n`);
console.info('=================================\n');
