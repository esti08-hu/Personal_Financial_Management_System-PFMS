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

  // Seed Admins
  console.log('Seeding admins...')
  const adminData = []
  for (let i = 0; i < 5; i++) {
    adminData.push({
      pid: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      refreshToken: null,
    })
  }
  await db.insert(databaseSchema.admin).values(adminData).returning()

  // Seed Users
  console.log('Seeding users...')
  const userData = []
  for (let i = 0; i < 50; i++) {
    userData.push({
      pid: faker.string.uuid(),
      role: 'USER',
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password(),
      profilePicture: faker.image.avatar(),
      refreshToken: null,
      isEmailConfirmed: faker.datatype.boolean(),
      isRegisteredWithGoogle: faker.datatype.boolean(),
      confirmationSentAt: faker.date.recent(),
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      passwordResetTokenUsed: false,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    })
  }

  const insertedUsers = await db
    .insert(databaseSchema.user)
    .values(userData)
    .returning()
  const users = await db.select().from(databaseSchema.user)

  // Seed Accounts
  console.log('Seeding accounts...')
  const accountData = []
  for (let i = 0; i < 300; i++) {
    const randomUser = faker.helpers.arrayElement(users)
    accountData.push({
      userId: randomUser.id,
      title: faker.lorem.word(),
      type: faker.helpers.arrayElement(['Saving', 'Business', 'Checking']),
      balance: faker.number.int({ min: 2000, max: 10000 }),
    })
  }
  await db.insert(databaseSchema.account).values(accountData).returning()

  const accounts = await db.select().from(databaseSchema.account)

  // Seed Budgets
  console.log('Seeding budgets...')
  const budgetData = []
  for (let i = 0; i < 200; i++) {
    const randomUser = faker.helpers.arrayElement(users)
    budgetData.push({
      userId: randomUser.id,
      title: faker.lorem.word(),
      type: faker.helpers.arrayElement(['Expense', 'Income']),
      amount: faker.number.int({ min: 1, max: 1000 }),
      createdAt: new Date(faker.date.recent()),
    })
  }
  await db.insert(databaseSchema.budget).values(budgetData).returning()

  // Seed Transactions
  console.log('Seeding transactions...')
  const transactionData = []
  for (let i = 0; i < 500; i++) {
    const randomUser = faker.helpers.arrayElement(users)

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
      description: faker.lorem.sentence(),
    })
  }

  await db
    .insert(databaseSchema.transaction)
    .values(transactionData)
    .returning()

  // Seed Conversations
  console.log('Seeding conversations...')
  const conversationData = []
  for (let i = 0; i < 100; i++) {
    const randomUser = faker.helpers.arrayElement(users)
    conversationData.push({
      userId: randomUser.id,
      totalTurns: faker.number.int({ min: 0, max: 20 }),
      isActive: faker.datatype.boolean(),
      lastActivityAt: faker.date.recent(),
    })
  }
  const insertedConversations = await db
    .insert(databaseSchema.conversation)
    .values(conversationData)
    .returning()
  const conversations = await db.select().from(databaseSchema.conversation)

  // Seed Turns
  console.log('Seeding turns...')
  const turnData = []
  for (let i = 0; i < 300; i++) {
    const randomConversation = faker.helpers.arrayElement(conversations)
    turnData.push({
      conversationId: randomConversation.id,
      userMessage: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      assistantMessage: faker.datatype.boolean() ? faker.lorem.paragraphs(faker.number.int({ min: 1, max: 2 })) : null,
      intent: faker.datatype.boolean() ? {
        query: faker.lorem.words(3),
        categories: faker.helpers.arrayElements(['food', 'transport', 'entertainment', 'utilities'], faker.number.int({ min: 0, max: 3 })),
        timeframe: faker.helpers.arrayElement(['last_week', 'last_month', 'this_month', null]),
      } : null,
      aggregates: faker.datatype.boolean() ? {
        totalIncome: faker.number.int({ min: 1000, max: 10000 }),
        totalExpenses: faker.number.int({ min: 500, max: 5000 }),
        transactionCount: faker.number.int({ min: 5, max: 50 }),
      } : null,
      isProcessed: faker.datatype.boolean(),
      isFallback: faker.datatype.boolean(),
      processedAt: faker.datatype.boolean() ? faker.date.recent() : null,
    })
  }
  await db.insert(databaseSchema.turn).values(turnData).returning()

  // Seed Rate Limit Usage
  console.log('Seeding rate limit usage...')
  const rateLimitData = []
  for (let i = 0; i < 200; i++) {
    const randomUser = faker.helpers.arrayElement(users)
    rateLimitData.push({
      userId: randomUser.id,
      date: faker.date.recent(),
      geminiCallsUsed: faker.number.int({ min: 0, max: 50 }),
      minuteCallsUsed: faker.number.int({ min: 0, max: 100 }),
      cacheHits: faker.number.int({ min: 0, max: 200 }),
      lastResetAt: faker.datatype.boolean() ? faker.date.recent() : null,
    })
  }
  await db.insert(databaseSchema.rateLimitUsage).values(rateLimitData).returning()

  // Seed Anomaly Threshold
  console.log('Seeding anomaly threshold...')
  await db.insert(databaseSchema.anomalyThreshold).values({
    id: faker.string.uuid(),
    rateLimitMultiplier: faker.number.int({ min: 1, max: 5 }),
    anomalyScoreThreshold: faker.number.int({ min: 5, max: 20 }),
    consecutiveFailuresThreshold: faker.number.int({ min: 3, max: 10 }),
  }).returning()

  console.log('Seeding completed!')
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
