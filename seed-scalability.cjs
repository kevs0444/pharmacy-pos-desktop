const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pharmacy-pos-desktop', 'data', 'botikaplus.sqlite');
console.log('Connecting to database:', dbPath);

try {
  const db = new Database(dbPath, { timeout: 8000 });
  db.pragma('journal_mode = WAL');

  console.log('Clearing old mock purchase orders...');
  db.prepare('DELETE FROM purchase_order_items').run();
  db.prepare('DELETE FROM purchase_orders').run();

  const statuses = ['Processing', 'In Transit', 'Delivered', 'Cancelled']
  const priorities = ['Normal', 'Urgent']
  const manufacturers = [
    { id: 1, name: 'Unilab', contact: 'Mr. Cruz' },
    { id: 2, name: 'Pfizer', contact: 'Ms. Tan' },
    { id: 3, name: 'TGP Generics', contact: 'Mr. Garcia' },
    { id: 4, name: 'PharmaTech', contact: 'Mr. Cruz' },
    { id: 5, name: 'Vitamins Plus', contact: 'Ms. Bautista' },
    { id: 6, name: 'Bayer', contact: 'Mr. Lim' }
  ];

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
      purchase_order_id, stock_no, stock_name, order_unit, pkg_qty, quantity, unit_cost,
      disc_percent, net_ucost, ext_cost, recvd, pr_num, remarks
    ) VALUES (
      @purchaseOrderId, @stockNo, @stockName, @orderUnit, @pkgQty, @quantity, @unitCost,
      @discPercent, @netUcost, @extCost, @recvd, @prNum, @remarks
    )
  `);

  const nowIso = () => new Date().toISOString();

  console.log('Generating 100 new purchase orders with varying items...');
  db.transaction(() => {
    for (let i = 1; i <= 100; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const mfg = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const user = '01-MAIN';

      let itemsCount = 10;
      const r = Math.random();
      if (r < 0.05) itemsCount = 1000;
      else if (r < 0.20) itemsCount = Math.floor(Math.random() * 200) + 100;
      else itemsCount = Math.floor(Math.random() * 11) + 10;

      const items = [];
      let total = 0;

      const prefixes = ['Amoxi', 'Ceti', 'Para', 'Ibu', 'Losar', 'Omepra', 'Salbu', 'Metfor', 'Amlodi', 'Vitam', 'Aspi'];
      const suffixes = ['cillin', 'rizine', 'cetamol', 'profen', 'tan', 'zole', 'tamol', 'min', 'pine', 'in C', 'rin'];

      for (let j = 0; j < itemsCount; j++) {
        const quantity = Math.floor(Math.random() * 50) + 10;
        const unitCost = Math.floor(Math.random() * 500) + 50;
        const extCost = quantity * unitCost;
        total += extCost;

        const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suff = suffixes[Math.floor(Math.random() * suffixes.length)];
        const dose = [50, 100, 250, 500][Math.floor(Math.random() * 4)];
        const stockNo = String(Math.floor(Math.random() * 90000) + 10000);

        items.push({
          stockNo,
          stockName: `${pref}${suff} ${dose}mg Tablet`,
          orderUnit: 'boxes',
          pkgQty: 1,
          quantity,
          unitCost,
          discPercent: 0,
          netUcost: unitCost,
          extCost,
          recvd: 0,
          prNum: null,
          remarks: null
        });
      }

      const padI = String(i).padStart(4, '0');
      const now = new Date();
      now.setMonth(now.getMonth() - (i % 4));
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const placedDate = `${y}-${m}-${d}`;
      const etaDate = `${y}-${m}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;

      const timestamp = nowIso();
      const orderResult = insertOrder.run({
        orderCode: `PO-${y}-MOCK${padI}`,
        manufacturerId: mfg.id,
        manufacturerName: mfg.name,
        contactPerson: mfg.contact,
        total,
        status,
        etaDate,
        placedDate,
        priority,
        orderedByUserId: 1,
        orderedByName: user,
        remarks: null,
        faxEmailRemarks: null,
        notedBy: null,
        approvedBy: null,
        qtyToOrder: '1 month',
        sysGen: 0,
        termsDays: 30,
        payDueDate: null,
        isClosed: 0,
        isLocked: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const purchaseOrderId = orderResult.lastInsertRowid;

      for (const item of items) {
        insertItem.run({
          purchaseOrderId,
          stockNo: item.stockNo,
          stockName: item.stockName,
          orderUnit: item.orderUnit,
          pkgQty: item.pkgQty,
          quantity: item.quantity,
          unitCost: item.unitCost,
          discPercent: item.discPercent,
          netUcost: item.netUcost,
          extCost: item.extCost,
          recvd: item.recvd,
          prNum: item.prNum,
          remarks: item.remarks
        });
      }
    }
  })();

  console.log('Successfully re-seeded 100 fully scalable purchase orders directly into the database!');
  db.close();
} catch (e) {
  console.error('Failed to run seed script:', e);
}
