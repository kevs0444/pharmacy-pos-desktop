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
        // Automatically upgrade any old mock items missing stock_nos (for scalability test)
    try {
      const missingStockNoCount = this.database.prepare(`SELECT count(*) as c FROM purchase_order_items WHERE stock_no IS NULL`).get() as {c: number};
      if (missingStockNoCount && missingStockNoCount.c > 0) {
        console.log(`[DB] Upgrading ${missingStockNoCount.c} items with missing SKUs...`);
        const items = this.database.prepare(`SELECT id FROM purchase_order_items WHERE stock_no IS NULL`).all() as {id: number}[];
        const update = this.database.prepare(`UPDATE purchase_order_items SET stock_no = @stockNo WHERE id = @id`);
        this.database.transaction(() => {
          items.forEach(item => {
            update.run({ id: item.id, stockNo: String(Math.floor(Math.random() * 90000) + 10000) });
          });
        })();
        console.log(`[DB] Successfully generated SKUs for ${items.length} items!`);
      }
    } catch (err) {
      console.warn('[DB] SKU upgrade skipped:', err);
    }
  }

      const applyMigration = this.database.transaction(() => {
        this.database.exec(migration.up)
        insertMigration.run(migration.id, migration.name, new Date().toISOString())
      })

      applyMigration()
    }
  }
}
