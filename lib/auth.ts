import NextAuth from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma_db } from "./prisma";

// Extend session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isVerified: boolean;
      provider?: string;
    };
  }

  interface User {
    role: string;
    isVerified: boolean;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma_db) as Adapter,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = loginSchema.parse(credentials);

          // Check for Admin via Environment Variables
          console.info("Login attempt:", { email });

          if (
            process.env.ADMIN_EMAIL &&
            process.env.ADMIN_PASSWORD &&
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
          ) {
            console.info("Admin logging in via environment variables");

            // Check if admin exists in DB
            let adminUser = await prisma_db.user.findUnique({
              where: { email },
            });

            if (!adminUser) {
              console.info("Creating admin user from environment variables");
              const hashedPassword = await bcrypt.hash(password, 10);
              adminUser = await prisma_db.user.create({
                data: {
                  email,
                  password: hashedPassword,
                  name: "Admin",
                  role: "ADMIN",
                  isVerified: true,
                },
              });
            } else {
              // Ensure existing user has ADMIN role
              if (adminUser.role !== "ADMIN") {
                adminUser = await prisma_db.user.update({
                  where: { id: adminUser.id },
                  data: { role: "ADMIN", isVerified: true }
                });
              }
            }

            return {
              id: adminUser.id,
              email: adminUser.email || "",
              name: adminUser.name,
              image: adminUser.image,
              role: adminUser.role,
              isVerified: adminUser.isVerified,
            };
          }

          // Find user by email
          const user = await prisma_db.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // DEV MODE: bypass password check
          if (process.env.NODE_ENV !== "development") {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
              throw new Error("Invalid credentials");
            }
          }

          // Check if user is verified
          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          // Return user object
          return {
            id: user.id,
            email: user.email || "",
            name: user.name,
            image: user.image,
            role: user.role,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      // Check for Admin Promotion based on ENV
      if (user.email && process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
        // If it's the admin email, we allow it (logic handled in authorize usually, 
        // but this is a double check if we needed it, or for promotions)
        // Since authorize handles creation, this might be redundant but harmless.
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }

      if (account) {
        token.provider = account.provider;
      }

      // Handle session updates (triggered by updateSession)
      if (trigger === "update") {
        // Fetch fresh user data from DB when session is updated
        const dbUser = await prisma_db.user.findUnique({
          where: { id: token.id as string },
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
            isVerified: true
          },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          // Add cache-busting timestamp to image URL
          token.picture = dbUser.image ? `${dbUser.image}?t=${Date.now()}` : dbUser.image;
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }

        return token;
      }

      // Fetch fresh data from DB for credentials users
      if (token.id) {
        const dbUser = await prisma_db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isVerified: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
});
