import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from "crypto";

// Load environment variables
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

// Fixed test user ID for development
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create test user if it doesn't exist
  const existingUser = await prisma.user.findUnique({
    where: { id: DEV_USER_ID },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: DEV_USER_ID,
        email: "dev@example.com",
        username: "devuser",
        passwordHash: hashPassword("password123"),
      },
    });
    console.log("✅ Created test user: dev@example.com / password123");
  } else {
    console.log("✅ Test user already exists");
  }

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
