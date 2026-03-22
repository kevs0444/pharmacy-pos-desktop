import { createRequire } from 'node:module'
import type { App } from 'electron'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import type Database from 'better-sqlite3'
import { migrations } from './migrations'
import { seedDatabase } from './seed'

const require = createRequire(import.meta.url)
const BetterSqlite3 = require('better-sqlite3') as typeof import('better-sqlite3')

export class DatabaseManager {
  private readonly database: Database.Database
  readonly dbPath: string
  readonly backupDir: string

  private constructor(dbPath: string, backupDir: string) {
    this.dbPath = dbPath
    this.backupDir = backupDir
    this.database = new BetterSqlite3(dbPath)
    this.configure()
    this.runMigrations()
    seedDatabase(this.database)
  }

  static bootstrap(electronApp: App): DatabaseManager {
    const dataDir = path.join(electronApp.getPath('userData'), 'data')
    const backupDir = path.join(electronApp.getPath('userData'), 'backups')

    mkdirSync(dataDir, { recursive: true })
    mkdirSync(backupDir, { recursive: true })

    const dbPath = path.join(dataDir, 'botikaplus.sqlite')
    return new DatabaseManager(dbPath, backupDir)
  }

  get db(): Database.Database {
    return this.database
  }

  close(): void {
    if (this.database.open) {
      this.database.close()
    }
  }

  getAppliedMigrationCount(): number {
    const row = this.database.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get() as { count: number }
    return row.count
  }

  private configure(): void {
    this.database.pragma('journal_mode = WAL')
    this.database.pragma('foreign_keys = ON')
    this.database.pragma('synchronous = NORMAL')
    this.database.pragma('temp_store = MEMORY')
  }

  private runMigrations(): void {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `)

    const getMigration = this.database.prepare('SELECT id FROM schema_migrations WHERE id = ?')
    const insertMigration = this.database.prepare(`
      INSERT INTO schema_migrations (id, name, applied_at)
      VALUES (?, ?, ?)
    `)

    for (const migration of migrations) {
      const existing = getMigration.get(migration.id)

      if (existing) {
        continue
      }

      const applyMigration = this.database.transaction(() => {
        this.database.exec(migration.up)
        insertMigration.run(migration.id, migration.name, new Date().toISOString())
      })

      applyMigration()
    }
  }
}
