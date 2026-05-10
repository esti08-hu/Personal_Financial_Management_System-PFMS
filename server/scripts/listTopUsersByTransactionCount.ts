import 'dotenv/config'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { databaseSchema } from '../src/database/database-schema'

async function main() {
  const config = new ConfigService()
  const pool = new Pool({
    host: config.get('POSTGRES_HOST'),
    port: Number(config.get('POSTGRES_PORT')) || 5432,
    user: config.get('POSTGRES_USER'),
    password: String(config.get('POSTGRES_PASSWORD')),
    database: config.get('POSTGRES_DB'),
  })

  const db = drizzle(pool)

  try {
    const rows = await db
      .select({ userId: databaseSchema.transaction.userId, count: sql<number>`COUNT(*)` })
      .from(databaseSchema.transaction)
      .groupBy(databaseSchema.transaction.userId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10)

    console.log('Top users by transaction count:')
    rows.forEach((r) => {
      console.log(`${r.userId} -> ${r.count}`)
    })
  } catch (err) {
    console.error('Error listing top users:', err)
    process.exit(1)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

main()
