import { auth } from '@/lib/auth';
import { prisma_db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
    endpoint: z.string().url(),
    p256dh: z.string(),
    auth: z.string(),
    userAgent: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const data = subscribeSchema.parse(body);

        // Verify user exists in DB to prevent P2003 (Foreign key constraint violated)
        // This can happen if the database was reset but the user still has an active session
        const userExists = await prisma_db.user.findUnique({
            where: { id: session.user.id },
            select: { id: true }
        });

        if (!userExists) {
            console.error(`Subscribe error: User ${session.user.id} not found in database. This usually happens after a DB reset with active session.`);
            return NextResponse.json(
                { error: 'User account not found. Please log out and log in again.' },
                { status: 401 }
            );
        }

        // Use upsert to handle potential race conditions
        const subscription = await prisma_db.pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: session.user.id,
                    endpoint: data.endpoint,
                },
            },
            update: {
                p256dh: data.p256dh,
                auth: data.auth,
                userAgent: data.userAgent,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                endpoint: data.endpoint,
                p256dh: data.p256dh,
                auth: data.auth,
                userAgent: data.userAgent,
            },
        });

        return NextResponse.json({
            message: 'Subscribed successfully',
            subscription,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe to notifications' },
            { status: 500 }
        );
    }
}
