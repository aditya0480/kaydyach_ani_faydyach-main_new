import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Account {
    provider: string;
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
    isOAuthUser?: boolean;
    accounts?: Account[];
}

interface ProfileResponse {
    user: User;
}

interface UpdateProfileData {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    avatar?: File;
}

// Fetch user profile
export const useProfile = () => {
    return useQuery<ProfileResponse>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await axios.get('/api/user/profile');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Update user profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { update: updateSession } = useSession();

    return useMutation({
        mutationFn: async (updateData: UpdateProfileData) => {
            const formData = new FormData();

            if (updateData.name) formData.append('name', updateData.name);
            if (updateData.email) formData.append('email', updateData.email);
            if (updateData.currentPassword) formData.append('currentPassword', updateData.currentPassword);
            if (updateData.newPassword) formData.append('newPassword', updateData.newPassword);
            if (updateData.avatar) formData.append('avatar', updateData.avatar);

            const { data } = await axios.patch('/api/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return data;
        },
        onSuccess: async (data) => {
            // Show success message first
            toast.success(data.message || 'Profile updated successfully');

            // If email verification required, show additional info
            if (data.requiresEmailVerification) {
                toast.success('Please check your email to verify your new address', {
                    duration: 6000,
                });
            }

            // Invalidate and refetch profile
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });

            // Force session update - this triggers JWT callback with trigger='update'
            // The JWT callback will fetch fresh data from DB including new avatar
            if (updateSession) {
                await updateSession();
            }

            // Force a hard refresh of the page to ensure all components update
            // Small delay to allow toasts to show and session to update
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        onError: (error: unknown) => {
            const errorMessage = axios.isAxiosError(error)
                ? (error.response?.data?.error || 'Failed to update profile')
                : 'Failed to update profile';
            toast.error(errorMessage);
        },
    });
};
