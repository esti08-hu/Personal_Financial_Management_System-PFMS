import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { databaseSchema } from './database-schema'
import 'dotenv/config'

import { faker } from '@faker-js/faker'

import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'

const configService = new ConfigService()

const main = async () => {
  const pool = new Pool({
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    user: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
  })

  const db = drizzle(pool)

  const users = await db.select().from(databaseSchema.user)

  const transactionData = []

  // Seed transactions
  console.log('Seeding transactions...')
  for (let i = 0; i < 50; i++) {
    const randomUser = faker.helpers.arrayElement(users)

    // Fetch accounts for the selected user
    const userAccounts = await db
      .select()
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, randomUser.id))

    const randomAccount = faker.helpers.arrayElement(userAccounts)

    transactionData.push({
      userId: randomUser.id,
      accountId: randomAccount.id,
      type: faker.helpers.arrayElement(['Deposit', 'Withdrawal', 'Transfer']),
      amount: faker.number.int({ min: 1, max: 100000 }),
      createdAt: new Date(faker.date.recent()).toISOString(),
      description: faker.lorem.sentence(),
    })
  }

  await db
    .insert(databaseSchema.transaction) // Ensure you have the correct reference to your transaction schema
    .values(transactionData)
    .returning()

  console.log('Seeding completed!')
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
