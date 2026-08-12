import { auth } from '@/lib/auth';
import { prisma_db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const unsubscribeSchema = z.object({
    endpoint: z.string().url(),
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
        const { endpoint } = unsubscribeSchema.parse(body);

        await prisma_db.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint,
            },
        });

        return NextResponse.json({
            message: 'Unsubscribed successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe from notifications' },
            { status: 500 }
        );
    }
}
