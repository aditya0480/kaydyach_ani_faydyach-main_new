import { PrismaClient } from "../../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setup() {
  console.log("Setting up test database...");

  // Create test admin user
  const adminEmail = process.env.CYPRESS_ADMIN_EMAIL || "admin@test.com";
  const adminPassword = process.env.CYPRESS_ADMIN_PASSWORD || "test-password-123";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedAdminPassword, role: "ADMIN", isVerified: true },
    create: {
      email: adminEmail,
      name: "Test Admin",
      password: hashedAdminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // Create test regular user
  const userEmail = process.env.CYPRESS_USER_EMAIL || "user@test.com";
  const userPassword = process.env.CYPRESS_USER_PASSWORD || "test-password-123";
  const hashedUserPassword = await bcrypt.hash(userPassword, 10);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: { password: hashedUserPassword, role: "USER", isVerified: true },
    create: {
      email: userEmail,
      name: "Test User",
      password: hashedUserPassword,
      role: "USER",
      isVerified: true,
    },
  });

  console.log("Test database setup complete");
  await prisma.$disconnect();
}

setup().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
