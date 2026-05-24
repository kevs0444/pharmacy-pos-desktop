// Run with: npx electron seed-mock-orders.cjs
const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pharmacy-pos-desktop', 'data', 'botikaplus.sqlite');
  console.log('Opening database at:', dbPath);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Clear existing orders
  db.prepare('DELETE FROM purchase_order_items').run();
  db.prepare('DELETE FROM purchase_orders').run();
  console.log('Cleared existing orders.');

  const insertOrder = db.prepare(`
    INSERT INTO purchase_orders (
      order_code, manufacturer_id, manufacturer_name, contact_person, total, status,
      eta_date, placed_date, priority, ordered_by_user_id, ordered_by_name, remarks,
      fax_email_remarks, noted_by, approved_by, qty_to_order, sys_gen, terms_days,
      pay_due_date, is_closed, is_locked, created_at, updated_at
    ) VALUES (
      @orderCode, @manufacturerId, @manufacturerName, @contactPerson, @total, @status,
      @etaDate, @placedDate, @priority, @orderedByUserId, @orderedByName, @remarks,
      @faxEmailRemarks, @notedBy, @approvedBy, @qtyToOrder, @sysGen, @termsDays,
      @payDueDate, @isClosed, @isLocked, @createdAt, @updatedAt
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO purchase_order_items (
      purchase_order_id, stock_name, order_unit, pkg_qty, quantity, unit_cost,
      disc_percent, net_ucost, ext_cost, recvd, pr_num, remarks
    ) VALUES (
      @purchaseOrderId, @stockName, @orderUnit, @pkgQty, @quantity, @unitCost,
      @discPercent, @netUcost, @extCost, @recvd, @prNum, @remarks
    )
  `);

  const seedAll = db.transaction(() => {
    let count = 0;
    // Current month, today
    const placedDate = new Date().toISOString().split('T')[0];
    
    // Terms due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const payDueDate = dueDate.toISOString().split('T')[0];
    
    for (let i = 1; i <= 100; i++) {
      const padI = String(i).padStart(4, '0');
      const orderCode = `PO-2026-MOCK${padI}`;
      
      const quantity = 50;
      const unitCost = 10;
      const total = quantity * unitCost;

      const timestamp = new Date().toISOString();

      const orderResult = insertOrder.run({
        orderCode,
        manufacturerId: null,
        manufacturerName: 'Generic Pharma',
        contactPerson: 'Mr. Mock',
        total: total,
        status: 'Processing',
        etaDate: placedDate,
        placedDate,
        priority: 'Normal',
        orderedByUserId: null,
        orderedByName: 'CHA',
        remarks: `Mock order #${i} for UI testing`,
        faxEmailRemarks: null,
        notedBy: 'System Administrator',
        approvedBy: 'Branch Manager',
        qtyToOrder: '1 month',
        sysGen: 0,
        termsDays: 30,
        payDueDate,
        isClosed: 0,
        isLocked: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const purchaseOrderId = orderResult.lastInsertRowid;

      // Add a single item
      insertItem.run({
        purchaseOrderId,
        stockName: 'Amoxicillin 500mg',
        orderUnit: 'EACH',
        pkgQty: 1,
        quantity,
        unitCost,
        discPercent: 0,
        netUcost: unitCost,
        extCost: total,
        recvd: 0,
        prNum: `PR-MOCK-${padI}`,
        remarks: null,
      });

      count++;
    }
    return count;
  });

  const totalInserted = seedAll();
  console.log(`\nSuccessfully seeded ${totalInserted} purchase orders (PO-2026-MOCK0001 to MOCK0100) all in current month.`);

  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM purchase_orders').get();
  console.log(`Database now has ${countRow.cnt} orders.`);

  db.close();
  app.quit();
});
