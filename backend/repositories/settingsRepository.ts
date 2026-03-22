import type Database from 'better-sqlite3'
import type { ReceiptSettingsRecord } from '../types/domain'

type ReceiptSettingsRow = Omit<ReceiptSettingsRecord, 'showTxnId' | 'showCashier' | 'showDate'> & {
  showTxnId: number
  showCashier: number
  showDate: number
}

export class SettingsRepository {
  constructor(private readonly db: Database.Database) {}

  getReceiptSettings(): ReceiptSettingsRecord {
    const row = this.db
      .prepare(`
        SELECT
          id,
          store_name AS storeName,
          address,
          contact,
          tin,
          footer_message AS footerMessage,
          paper_size AS paperSize,
          show_txn_id AS showTxnId,
          show_cashier AS showCashier,
          show_date AS showDate,
          updated_at AS updatedAt
        FROM receipt_settings
        WHERE id = 1
      `)
      .get() as ReceiptSettingsRow | undefined

    if (!row) {
      throw new Error('Receipt settings not found')
    }

    return {
      ...row,
      showTxnId: Boolean(row.showTxnId),
      showCashier: Boolean(row.showCashier),
      showDate: Boolean(row.showDate),
    }
  }
}
