import { auth } from '@/lib/auth';
import { prisma_db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const subscriptions = await prisma_db.pushSubscription.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                endpoint: true,
                userAgent: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            subscribed: subscriptions.length > 0,
            subscriptions,
        });
    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check subscription status' },
            { status: 500 }
        );
    }
}
