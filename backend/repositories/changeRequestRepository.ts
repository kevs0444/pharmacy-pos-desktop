import type Database from 'better-sqlite3'
import type { ChangeRequestRecord, ChangeRequestStatus } from '../types/domain'
import type { ReviewChangeRequestInput, SubmitChangeRequestInput } from '../types/api'

interface ChangeRequestRow {
  id: number
  request_type: string
  status: string
  product_id: number | null
  payload: string
  submitted_by_name: string | null
  submitted_at: string
  reviewed_by_name: string | null
  reviewed_at: string | null
  reviewer_note: string | null
}

function mapRow(row: ChangeRequestRow): ChangeRequestRecord {
  return {
    id: row.id,
    requestType: row.request_type as ChangeRequestRecord['requestType'],
    status: row.status as ChangeRequestRecord['status'],
    productId: row.product_id,
    payload: row.payload,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
    reviewedByName: row.reviewed_by_name,
    reviewedAt: row.reviewed_at,
    reviewerNote: row.reviewer_note,
  }
}

export class ChangeRequestRepository {
  constructor(private readonly db: Database.Database) {}

  insert(input: SubmitChangeRequestInput): ChangeRequestRecord {
    const now = new Date().toISOString()
    const result = this.db.prepare(`
      INSERT INTO inventory_change_requests
        (request_type, status, product_id, payload, submitted_by_name, submitted_at)
      VALUES
        (@requestType, 'PENDING', @productId, @payload, @submittedByName, @submittedAt)
    `).run({
      requestType: input.requestType,
      productId: input.productId ?? null,
      payload: JSON.stringify(input.payload),
      submittedByName: input.submittedByName ?? null,
      submittedAt: now,
    })
    return this.getById(Number(result.lastInsertRowid))!
  }

  listByStatus(status?: ChangeRequestStatus): ChangeRequestRecord[] {
    const rows = status
      ? (this.db.prepare(
          'SELECT * FROM inventory_change_requests WHERE status = ? ORDER BY submitted_at DESC'
        ).all(status) as ChangeRequestRow[])
      : (this.db.prepare(
          'SELECT * FROM inventory_change_requests ORDER BY submitted_at DESC'
        ).all() as ChangeRequestRow[])
    return rows.map(mapRow)
  }

  getById(id: number): ChangeRequestRecord | null {
    const row = this.db.prepare(
      'SELECT * FROM inventory_change_requests WHERE id = ?'
    ).get(id) as ChangeRequestRow | undefined
    return row ? mapRow(row) : null
  }

  markReviewed(id: number, input: ReviewChangeRequestInput): void {
    const now = new Date().toISOString()
    this.db.prepare(`
      UPDATE inventory_change_requests
      SET status = @status,
          reviewed_by_name = @reviewedByName,
          reviewed_at = @reviewedAt,
          reviewer_note = @reviewerNote
      WHERE id = @id
    `).run({
      id,
      status: input.approved ? 'APPROVED' : 'REJECTED',
      reviewedByName: input.reviewedByName ?? null,
      reviewedAt: now,
      reviewerNote: input.reviewerNote ?? null,
    })
  }

  countPending(): number {
    const row = this.db.prepare(
      "SELECT COUNT(*) AS count FROM inventory_change_requests WHERE status = 'PENDING'"
    ).get() as { count: number }
    return row.count
  }
}
