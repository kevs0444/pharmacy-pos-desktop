import type Database from 'better-sqlite3'
import type { CheckoutPayload } from '../types/api'

export class SalesRepository {
  constructor(private readonly db: Database.Database) {}

  createSale(payload: CheckoutPayload): void {
    const timestamp = new Date().toISOString()
    
    const txn = this.db.transaction(() => {
      // 1. Generate unique transaction code
      const txnCode = `TXN-${Date.now()}`

      // 2. Insert into sales_transactions
      const insertSalesTxn = this.db.prepare(`
        INSERT INTO sales_transactions (
          transaction_code, cashier_user_id, customer_name, subtotal, discount_type,
          discount_value, discount_amount, total, cash_tendered, change_amount,
          payment_status, requires_prescription, doctor_name, doctor_license, created_at
        ) VALUES (
          @txnCode, @cashierUserId, @customerName, @subtotal, @discountType,
          @discountValue, @discountAmount, @total, @cashTendered, @changeAmount,
          'COMPLETED', @requiresPrescription, @doctorName, @doctorLicense, @createdAt
        )
      `)

      const salesResult = insertSalesTxn.run({
        txnCode,
        cashierUserId: payload.cashierUserId ?? null,
        customerName: payload.customerName ?? null,
        subtotal: payload.subtotal,
        discountType: payload.discountType ?? null,
        discountValue: payload.discountValue ?? null,
        discountAmount: payload.discountAmount,
        total: payload.total,
        cashTendered: payload.cashTendered,
        changeAmount: payload.changeAmount,
        requiresPrescription: payload.requiresPrescription ? 1 : 0,
        doctorName: payload.doctorName ?? null,
        doctorLicense: payload.doctorLicense ?? null,
        createdAt: timestamp
      })

      const salesTxnId = Number(salesResult.lastInsertRowid)

      // 3. Insert into payments
      const insertPayment = this.db.prepare(`
        INSERT INTO payments (
          sales_transaction_id, method, amount, received_by_user_id, created_at
        ) VALUES (
          @salesTxnId, @method, @amount, @receivedByUserId, @createdAt
        )
      `)

      insertPayment.run({
        salesTxnId,
        method: payload.paymentMethod,
        amount: payload.total, // Store the actual amount paid for the sale
        receivedByUserId: payload.cashierUserId ?? null,
        createdAt: timestamp
      })

      // 4. Insert items, update inventory, record movements
      const insertItem = this.db.prepare(`
        INSERT INTO sales_transaction_items (
          sales_transaction_id, product_id, product_batch_id, product_name,
          lot_number, expiry_date, quantity, sell_by_piece, unit_label,
          unit_price, discount_amount, line_total, created_at
        ) VALUES (
          @salesTxnId, @productId, @productBatchId, @productName,
          @lotNumber, @expiryDate, @quantity, @sellByPiece, @unitLabel,
          @unitPrice, @discountAmount, @lineTotal, @createdAt
        )
      `)

      const updateBatch = this.db.prepare(`
        UPDATE product_batches 
        SET stock_pieces = stock_pieces - @pieces, updated_at = @updatedAt
        WHERE id = @batchId
      `)

      const updateProduct = this.db.prepare(`
        UPDATE products
        SET total_stock_pieces = total_stock_pieces - @pieces, sales_count = sales_count + @quantity, updated_at = @updatedAt
        WHERE id = @productId
      `)

      const insertMovement = this.db.prepare(`
        INSERT INTO inventory_movements (
          product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
          reference_id, reason, performed_by_user_id, created_at
        ) VALUES (
          @productId, @productBatchId, 'SALE', @pieces, 'SALES_TRANSACTION',
          @referenceId, 'Sold via POS', @userId, @createdAt
        )
      `)

      for (const item of payload.items) {
        insertItem.run({
          salesTxnId,
          productId: item.productId,
          productBatchId: item.productBatchId ?? null,
          productName: item.productName,
          lotNumber: item.lotNumber ?? null,
          expiryDate: item.expiryDate ?? null,
          quantity: item.quantity,
          sellByPiece: item.sellByPiece ? 1 : 0,
          unitLabel: item.unitLabel,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          lineTotal: item.lineTotal,
          createdAt: timestamp
        })

        if (item.productBatchId) {
          const p = this.db.prepare('SELECT pieces_per_unit FROM products WHERE id = ?').get(item.productId) as { pieces_per_unit: number }
          const pieces = item.sellByPiece ? item.quantity : (item.quantity * p.pieces_per_unit)

          updateBatch.run({ pieces, updatedAt: timestamp, batchId: item.productBatchId })
          
          updateProduct.run({ pieces, quantity: item.quantity, updatedAt: timestamp, productId: item.productId })

          insertMovement.run({
            productId: item.productId,
            productBatchId: item.productBatchId,
            pieces, // Positive value for quantity
            referenceId: txnCode,
            userId: payload.cashierUserId ?? null,
            createdAt: timestamp
          })
          
          // Re-compute status for product
          const updatedP = this.db.prepare('SELECT total_stock_pieces, pieces_per_unit FROM products WHERE id = ?').get(item.productId) as { total_stock_pieces: number, pieces_per_unit: number }
          let status = 'In Stock'
          if (updatedP.total_stock_pieces <= 0) status = 'Out of Stock'
          else if (updatedP.total_stock_pieces <= updatedP.pieces_per_unit) status = 'Low Stock'
          
          this.db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, item.productId)
        }
      }
    })

    txn()
  }
}
