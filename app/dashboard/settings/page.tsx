"use client";

import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWebPush } from "@/hooks/useWebPush";
import { Bell, BellOff, Loader2, Send, Save, BarChart } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/user/useProfile";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/AppInputFields/InputField";
import { Form } from "@/components/ui/form";
import { PremiumLoader } from "@/components/premium-loader";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  avatar: z.union([z.string(), z.instanceof(File)]).optional(),
});

// Password form schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const {
    isSubscribed,
    subscriptions,
    isLoading,
    subscribe,
    unsubscribe,
    sendTest,
  } = useWebPush();

  const { data: profileData, isLoading: isProfileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // Profile form - initialize with data from query
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData?.user?.name || "",
      email: profileData?.user?.email || "",
      avatar: profileData?.user?.image || undefined,
    },
    values: profileData?.user
      ? {
        name: profileData.user.name || "",
        email: profileData.user.email || "",
        avatar: profileData.user.image || undefined,
      }
      : undefined,
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      name: data.name,
      email: data.email,
      avatar: data.avatar instanceof File ? data.avatar : undefined,
    });
  };

  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormData) => {
    await updateProfile.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    passwordForm.reset();
  };

  const isOAuthUser = profileData?.user?.isOAuthUser || false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProfileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <PremiumLoader
                    marathiText="तुमची माहिती उघडत आहे..."
                    englishText="Accessing Your Profile"
                  />
                </div>
              ) : (
                <FormProvider {...profileForm}>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-4"
                    >
                      {/* Avatar Upload */}
                      <InputField
                        name="avatar"
                        label="Profile Picture"
                        type="avatar"
                        description="Upload a profile picture (JPG, PNG, or GIF)"
                      />

                      {/* Name Field */}
                      <InputField
                        name="name"
                        label="Name"
                        type="text"
                        placeholder="Your full name"
                        description="This is how your name will be displayed"
                      />

                      {/* Email Field */}
                      <InputField
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        description={
                          /* eslint-disable react-hooks/incompatible-library */
                          profileData?.user?.email !==
                            profileForm.watch("email")
                            ? "⚠️ Changing email will require verification via OTP"
                            : "Your email address for notifications and login"
                          /* eslint-enable react-hooks/incompatible-library */
                        }
                      />

                      <Button
                        type="submit"
                        disabled={
                          updateProfile.isPending ||
                          !profileForm.formState.isDirty
                        }
                        className="w-full sm:w-auto"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </FormProvider>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed visitor analytics and performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full sm:w-auto">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Manage your browser push notifications to stay updated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Status:{" "}
                    {isLoading
                      ? "Checking..."
                      : isSubscribed
                        ? "✅ Enabled"
                        : "❌ Disabled"}
                  </p>
                  {subscriptions.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Active on {subscriptions.length} device
                      {subscriptions.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {isSubscribed ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTest.mutate()}
                        disabled={sendTest.isPending}
                      >
                        {sendTest.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span className="ml-2">Test</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => unsubscribe.mutate()}
                        disabled={unsubscribe.isPending}
                      >
                        {unsubscribe.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                        <span className="ml-2">Disable</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => subscribe.mutate()}
                      disabled={subscribe.isPending}
                    >
                      {subscribe.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      <span className="ml-2">Enable Notifications</span>
                    </Button>
                  )}
                </div>
              </div>

              {subscriptions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Active Devices:
                  </p>
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="rounded-md border p-3 text-xs">
                      <p className="font-medium">
                        {sub.userAgent?.includes("Mobile")
                          ? "📱 Mobile"
                          : "💻 Desktop"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {sub.userAgent && sub.userAgent.length > 50
                          ? sub.userAgent.substring(0, 50) + "..."
                          : sub.userAgent || "Unknown device"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Registered: {new Date(sub.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what email notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and updates
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about account security events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {isOAuthUser ? (
            <Card>
              <CardHeader>
                <CardTitle>OAuth Account</CardTitle>
                <CardDescription>
                  You signed in with an external provider.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your account is managed by{" "}
                  {profileData?.user?.accounts?.[0]?.provider ||
                    "an external provider"}
                  . Password changes are not available for OAuth accounts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormProvider {...passwordForm}>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      {/* Current Password */}
                      <InputField
                        name="currentPassword"
                        label="Current Password"
                        type="password"
                        placeholder="Enter your current password"
                        description="Required to verify your identity"
                      />

                      {/* New Password */}
                      <InputField
                        name="newPassword"
                        label="New Password"
                        type="password"
                        placeholder="Enter your new password"
                        description="At least 8 characters with uppercase, number, and special character"
                      />

                      {/* Confirm Password */}
                      <InputField
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm your new password"
                        description="Re-enter your new password"
                      />

                      <Button
                        type="submit"
                        disabled={
                          updateProfile.isPending ||
                          !passwordForm.formState.isDirty
                        }
                        className="w-full sm:w-auto"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </FormProvider>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
