import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The demo seed is disabled in production.");
  }

  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword) throw new Error("Set SEED_PASSWORD before running the demo seed.");
  const passwordHash = await hashPassword(seedPassword);

  await prisma.user.upsert({
    where: { email: "super@example.com" },
    update: { passwordHash },
    create: {
      name: "Super Admin",
      email: "super@example.com",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  const existingBusiness = await prisma.business.findFirst({ where: { name: "ABC Solar" } });
  const business = existingBusiness
    ? existingBusiness
    : await prisma.business.create({
        data: {
          name: "ABC Solar",
          website: "https://example.com",
          agentName: "Sarah AI",
          agentInstructions: "",
          agentLanguage: "English",
          agentTone: "Friendly"
        }
      });

  await prisma.user.upsert({
    where: { email: "admin@abcsolar.test" },
    update: { passwordHash, businessId: business.id },
    create: {
      name: "ABC Solar Admin",
      email: "admin@abcsolar.test",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
    }
  });

  const existingUpmatchBusiness = await prisma.business.findFirst({ where: { name: "UpMatch Recruitment" } });
  const upmatchBusiness = existingUpmatchBusiness
    ? existingUpmatchBusiness
    : await prisma.business.create({
        data: {
          name: "UpMatch Recruitment",
          website: "http://localhost:3002",
          agentName: "UpMatch AI",
          agentInstructions: "",
          agentLanguage: "English",
          agentTone: "Professional and friendly"
        }
      });

  await prisma.user.upsert({
    where: { email: "admin@upmatch.test" },
    update: {
      name: "UpMatch Admin",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: upmatchBusiness.id
    },
    create: {
      name: "UpMatch Admin",
      email: "admin@upmatch.test",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: upmatchBusiness.id
    }
  });

}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
