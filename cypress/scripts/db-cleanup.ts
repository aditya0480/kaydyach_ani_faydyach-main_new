import { PrismaClient } from "../../lib/generated/prisma";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up test database...");

  const testEmails = [
    process.env.CYPRESS_ADMIN_EMAIL || "admin@test.com",
    process.env.CYPRESS_USER_EMAIL || "user@test.com",
  ];

  // Delete test users and their related data
  for (const email of testEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.account.deleteMany({ where: { userId: user.id } });
      await prisma.pushSubscription.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`Deleted test user: ${email}`);
    }
  }

  console.log("Test database cleanup complete");
  await prisma.$disconnect();
}

cleanup().catch((e) => {
  console.error("Cleanup failed:", e);
  process.exit(1);
});
