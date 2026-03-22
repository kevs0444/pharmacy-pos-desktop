import type Database from 'better-sqlite3'
import type { DatabaseStatus } from '../types/domain'

export class SystemRepository {
  constructor(
    private readonly db: Database.Database,
    private readonly dbPath: string,
    private readonly backupDir: string,
    private readonly migrationCount: number,
  ) {}

  getStatus(): DatabaseStatus {
    const productRow = this.db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number }
    const userRow = this.db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }

    return {
      dbPath: this.dbPath,
      backupDir: this.backupDir,
      isInitialized: true,
      migrationCount: this.migrationCount,
      seededProductCount: productRow.count,
      seededUserCount: userRow.count,
    }
  }
}
