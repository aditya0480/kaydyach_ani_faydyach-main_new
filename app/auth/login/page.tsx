"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import InputField from "@/components/AppInputFields/InputField";
import toast from "react-hot-toast";

const isDev = process.env.NODE_ENV === "development";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface DevUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "dev",
      rememberMe: true,
    },
  });

  const selectedEmail = useWatch({ control: methods.control, name: "email" });

  useEffect(() => {
    if (!isDev) return;
    fetch("/api/dev/users")
      .then((r) => r.json())
      .then((users: DevUser[]) => {
        setDevUsers(users);
        if (users.length > 0) {
          methods.setValue("email", users[0].email);
        }
      })
      .catch(() => {});
  }, [methods]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify")) {
          toast.error("Please verify your email before logging in");
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(data.email)}`,
          );
        } else {
          toast.error("Invalid email or password");
        }
      } else if (result?.ok) {
        toast.success("Successfully logged in! Redirecting...");
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        return;
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A2342] p-4">
      <Card className="w-full max-w-md border-none bg-white/95 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-3 pb-8">
          <CardTitle className="text-center text-3xl font-bold tracking-tight text-[#0A2342]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-500">
            {isDev ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800">
                ⚠ Dev mode — password bypass active
              </span>
            ) : (
              "Login to access your dashboard and manage your orders."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                {isDev ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select User <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedEmail}
                      onValueChange={(val) => methods.setValue("email", val)}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Pick a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {devUsers.map((u) => (
                          <SelectItem key={u.id} value={u.email}>
                            <span className="font-medium">
                              {u.name ?? u.email}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {u.email} · {u.role}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <InputField
                    name="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                )}

                <InputField
                  name="password"
                  label="Password"
                  placeholder={isDev ? "Any value works" : "Enter your password"}
                  type="password"
                  required
                />

                {!isDev && (
                  <div className="flex items-center justify-between pt-2">
                    <InputField
                      name="rememberMe"
                      type="checkbox"
                      label="Remember me"
                      className="flex-row items-center gap-2 space-y-0"
                    />
                  </div>
                )}

                <Button
                  className="h-12 w-full bg-[#FFD301] text-lg font-bold text-[#0A2342] hover:bg-[#FFD301]/90"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A2342] border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
