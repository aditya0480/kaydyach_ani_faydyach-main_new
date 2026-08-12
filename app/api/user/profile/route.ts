import { auth } from '@/lib/auth';
import { prisma_db } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema for profile update
const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Please enter a valid email address').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
        .optional(),
});

// GET: Fetch current user profile
export async function GET(_req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma_db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isVerified: true,
                createdAt: true,
                accounts: {
                    select: {
                        provider: true,
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user is OAuth (has external accounts)
        const isOAuthUser = user.accounts.length > 0;

        // Add cache-busting timestamp to image URL
        const imageWithTimestamp = user.image
            ? `${user.image}?t=${Date.now()}`
            : user.image;

        return NextResponse.json({
            user: {
                ...user,
                image: imageWithTimestamp,
                isOAuthUser,
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

// PATCH: Update user profile
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const name = formData.get('name') as string | null;
        const email = formData.get('email') as string | null;
        const currentPassword = formData.get('currentPassword') as string | null;
        const newPassword = formData.get('newPassword') as string | null;
        const avatar = formData.get('avatar') as File | null;

        // Get current user
        const currentUser = await prisma_db.user.findUnique({
            where: { id: session.user.id },
            include: {
                accounts: true,
            }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const isOAuthUser = currentUser.accounts.length > 0;

        // Build update data
        interface ProfileUpdateData {
            name?: string;
            email?: string;
            emailVerified?: Date | null;
            isVerified?: boolean;
            password?: string;
            image?: string;
        }
        const updateData: ProfileUpdateData = {};

        // Handle name update
        if (name && name !== currentUser.name) {
            updateProfileSchema.pick({ name: true }).parse({ name });
            updateData.name = name;
        }

        // Handle email update
        if (email && email !== currentUser.email) {
            updateProfileSchema.pick({ email: true }).parse({ email });

            // Check if email is already taken
            const emailExists = await prisma_db.user.findUnique({
                where: { email },
            });

            if (emailExists && emailExists.id !== session.user.id) {
                return NextResponse.json(
                    { error: 'Email is already in use' },
                    { status: 400 }
                );
            }

            // Email changed - require re-verification
            updateData.email = email;
            updateData.emailVerified = null;
            updateData.isVerified = false;

            // TODO: Trigger OTP email here
            // You can import and use your existing OTP sending logic
        }

        // Handle password update (only for credentials users)
        if (newPassword) {
            if (isOAuthUser) {
                return NextResponse.json(
                    { error: 'Cannot change password for OAuth accounts' },
                    { status: 400 }
                );
            }

            updateProfileSchema.pick({ newPassword: true }).parse({ newPassword });

            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to change password' },
                    { status: 400 }
                );
            }

            // Verify current password
            if (!currentUser.password) {
                return NextResponse.json(
                    { error: 'No password set for this account' },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                currentUser.password
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        // Handle avatar upload
        if (avatar && avatar.size > 0) {
            try {
                const buffer = Buffer.from(await avatar.arrayBuffer());
                const fileName = `avatar-${session.user.id}-${Date.now()}.${avatar.type.split('/')[1]}`;

                const imageUrl = await uploadToS3(buffer, fileName);
                updateData.image = imageUrl;
            } catch (error) {
                console.error('Avatar upload error:', error);
                return NextResponse.json(
                    { error: 'Failed to upload avatar' },
                    { status: 500 }
                );
            }
        }

        // If no updates, return success
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                message: 'No changes to update',
                user: currentUser,
            });
        }

        // Update user
        const updatedUser = await prisma_db.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });

        // Build response message
        let message = 'Profile updated successfully';
        if (updateData.email) {
            message += '. Please verify your new email address.';
        }

        // Add cache-busting timestamp to image URL
        const imageWithTimestamp = updatedUser.image
            ? `${updatedUser.image}?t=${Date.now()}`
            : updatedUser.image;

        return NextResponse.json({
            message,
            user: {
                ...updatedUser,
                image: imageWithTimestamp,
            },
            requiresEmailVerification: !!updateData.email,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
