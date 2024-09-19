import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseSchema } from "./database-schema";
import "dotenv/config";

import { faker } from "@faker-js/faker";

import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();

const main = async () => {
  const pool = new Pool({
    host: configService.get("POSTGRES_HOST"),
    port: configService.get("POSTGRES_PORT"),
    user: configService.get("POSTGRES_USER"),
    password: configService.get("POSTGRES_PASSWORD"),
    database: configService.get("POSTGRES_DB"),
  });

  const db = drizzle(pool);
  const userData = [];
  const adminData = [];

  // Seed users
  // console.log('Seeding users...')
  // for (let i = 0; i < 50; i++) {
  //   userData.push({
  //     pid: faker.string.uuid(),
  //     role: 'USER',
  //     name: faker.person.fullName(),
  //     email: faker.internet.email(),
  //     phone: faker.phone.number(),
  //     password: faker.internet.password(),
  //     passwordInit: faker.internet.password(),
  //     profilePicture: faker.image.avatar(),
  //     refreshToken: null,
  //     isEmailConfirmed: faker.datatype.boolean(),
  //     isRegisteredWithGoogle: faker.datatype.boolean(),
  //     confirmationSentAt: faker.date.recent(),
  //     passwordResetToken: null,
  //     passwordResetTokenExpires: null,
  //     passwordResetTokenUsed: false,
  //     failedLoginAttempts: 0,
  //     accountLockedUntil: null,
  //   })
  // }

  // const insertedUsers = await db
  //   .insert(databaseSchema.user)
  //   .values(userData)
  //   .returning()

  const users = await db.select().from(databaseSchema.user);

  const budgetData = [];

  // Seed budget
  console.log("Seeding budgets...");
  for (let i = 0; i < 200; i++) {
    const randomUser = faker.helpers.arrayElement(users);

    budgetData.push({
      userId: randomUser.id,
      title: faker.lorem.word(),
      type: faker.helpers.arrayElement(["Deposit", "Withdrawal", "Transfer"]),
      amount: faker.number.int({ min: 1, max: 1000 }),
      date: new Date(faker.date.recent()).toISOString(),
    });
  }

  await db
    .insert(databaseSchema.budget)
    .values(budgetData)
    .returning();


    const accountData = [];

    // Seed budget
    console.log("Seeding account...");
    for (let i = 0; i < 300; i++) {
      const randomUser = faker.helpers.arrayElement(users);
  
      accountData.push({
        userId: randomUser.id,
        title: faker.lorem.word(),
        type: faker.helpers.arrayElement(["Saving", "Business", "Checking"]),
        balance: faker.number.int({ min: 2000, max: 10000 }),
      });
    }
  
    await db
      .insert(databaseSchema.account)
      .values(accountData)
      .returning();

  // Seed admins
  // console.log('Seeding admins...')
  // for (let i = 0; i < 3; i++) {
  //   adminData.push({
  //     pid: faker.string.uuid(),
  //     name: faker.person.fullName(),
  //     email: faker.internet.email(),
  //     role: 'ADMIN',
  //     password: faker.internet.password(),
  //     refreshToken: null,
  //   })
  // }

  // const insertedAdmins = await db
  //   .insert(databaseSchema.admin)
  //   .values(adminData)
  //   .returning()

  console.log("Seeding completed!");
  process.exit(0);
};

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
