/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import petRoutes from './routes/pets.js'
import postRoutes from './routes/posts.js'
import adminRoutes from './routes/admin.js'
import interactionRoutes from './routes/interactions.js'
import breedRoutes from './routes/breeds.js'
import aiRoutes from './routes/ai.js'
import biddingRoutes from './routes/bidding.js'
import memberRoutes from './routes/member.js'
import schedulerRoutes from './routes/scheduler.js'
import configRoutes from './routes/config.js'
import sequelize from './config/database.js'


// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

const maskValue = (raw: string): string => {
  const v = String(raw || '').trim()
  if (!v) return ''
  if (v.length <= 6) return `${v.slice(0, 1)}***`
  return `${v.slice(0, 3)}***${v.slice(-2)}`
}

const getDbTableCount = async (dialect: string): Promise<number> => {
  if (dialect === 'mysql') {
    const [rows] = await sequelize.query('SHOW TABLES')
    return Array.isArray(rows) ? rows.length : 0
  }
  if (dialect === 'sqlite') {
    const [rows] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    return Array.isArray(rows) ? rows.length : 0
  }
  return 0
}

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/cache', express.static(path.join(__dirname, 'cache'), {
  etag: true,
  maxAge: '60s',
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=60');
  },
}))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/breeds', breedRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/member', memberRoutes)
app.use('/api/config', configRoutes)

app.use('/api', interactionRoutes)
app.use('/api', biddingRoutes)
app.use('/api', schedulerRoutes)

app.get('/api/health/db', async (req: Request, res: Response): Promise<void> => {
  const dialect = sequelize.getDialect ? sequelize.getDialect() : 'unknown'
  const requireMySQL = String(process.env.REQUIRE_MYSQL || '1') !== '0'
  const host = maskValue(String(process.env.DB_HOST || ''))
  const dbName = maskValue(String(process.env.DB_NAME || ''))
  try {
    await sequelize.authenticate()
    const tableCount = await getDbTableCount(dialect)
    res.status(200).json({
      success: true,
      data: {
        dialect,
        requireMySQL,
        host,
        dbName,
        tableCount,
      },
    })
  } catch (e: any) {
    res.status(503).json({
      success: false,
      data: {
        dialect,
        requireMySQL,
        host,
        dbName,
      },
      error: String(e?.message || 'db unavailable'),
    })
  }
})

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
