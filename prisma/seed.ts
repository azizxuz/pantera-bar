import { PrismaClient, ProductCategory } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function randomToken() {
  return randomBytes(24).toString("hex");
}

function yearFromNow() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function main() {
  const adminEmail = "admin@cafe.local";
  const existing = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    await prisma.admin.create({
      data: { email: adminEmail, password: await bcrypt.hash("admin1234", 10) },
    });
    console.log("✅ Admin created:", adminEmail);
  } else {
    console.log("✅ Admin already exists:", adminEmail);
  }

  const computerCount = await prisma.computer.count();
  if (computerCount === 0) {
    await prisma.computer.createMany({
      data: Array.from({ length: 51 }, (_, i) => ({
        number: i + 1,
        token: randomToken(),
        tokenExpiresAt: yearFromNow(),
      })),
    });
    console.log("✅ 51 computers created");
  } else {
    console.log("✅ Computers already exist:", computerCount);
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Coca-Cola 0.5L",
          price: 12000,
          emoji: "🥤",
          category: ProductCategory.DRINK,
        },
        {
          name: "Red Bull",
          price: 25000,
          emoji: "⚡",
          category: ProductCategory.DRINK,
        },
        {
          name: "Coffee",
          price: 15000,
          emoji: "☕",
          category: ProductCategory.DRINK,
        },
        {
          name: "Lay's Chips",
          price: 14000,
          emoji: "🍟",
          category: ProductCategory.SNACK,
        },
        {
          name: "Snickers",
          price: 10000,
          emoji: "🍫",
          category: ProductCategory.SNACK,
        },
        {
          name: "Hamburger",
          price: 35000,
          emoji: "🍔",
          category: ProductCategory.FOOD,
        },
        {
          name: "Pizza slice",
          price: 20000,
          emoji: "🍕",
          category: ProductCategory.FOOD,
        },
      ],
    });
    console.log("✅ 7 products created");
  } else {
    console.log("✅ Products already exist:", productCount);
  }

  console.log("🌱 Seed done.");
  await prisma.$disconnect();
}

if (require.main === module) {
  main();
}
