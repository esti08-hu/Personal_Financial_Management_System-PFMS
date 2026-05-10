import 'dotenv/config'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DrizzleService } from '../src/database/drizzle.service'
import { AggregationService } from '../src/ai/aggregation/aggregation.service'
import { databaseSchema } from '../src/database/database-schema'

async function main() {
  const config = new ConfigService()
  const pool = new Pool({
    host: config.get('POSTGRES_HOST'),
    port: Number(config.get('POSTGRES_PORT')) || 5432,
    user: config.get('POSTGRES_USER'),
    password: String(config.get('POSTGRES_PASSWORD')), // ensure string
    database: config.get('POSTGRES_DB'),
  })

  const db = drizzle(pool)
  // Create a minimal DrizzleService-like object used by AggregationService
  const drizzleService: any = { db }

  // AnomalyDetectionService is required in constructor; create a minimal stub
  const anomalyStub: any = { detectAnomalies: async () => null }

  const agg = new AggregationService(drizzleService as any, anomalyStub)

  // We need to call the private method getTransactionCount. Cast to any to access it.
  const anyAgg: any = agg

  const testUserId = process.argv[2] || ''
  const start = process.argv[3] ? new Date(process.argv[3]) : undefined
  const end = process.argv[4] ? new Date(process.argv[4]) : undefined

  const dateFilter = start && end ? { gte: start, lte: end } : undefined

  try {
    const count: number = await anyAgg.getTransactionCount(testUserId, dateFilter)
    console.log('Transaction count for user', testUserId, 'is', count)
  } catch (err) {
    console.error('Error calling getTransactionCount:', err)
    process.exit(1)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

main()
