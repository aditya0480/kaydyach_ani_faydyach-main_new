import { getVapidPublicKey } from '@/lib/web-push';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const publicKey = getVapidPublicKey();

        return NextResponse.json({ publicKey });
    } catch (error) {
        console.error('VAPID public key error:', error);
        return NextResponse.json(
            { error: 'VAPID keys not configured' },
            { status: 500 }
        );
    }
}
