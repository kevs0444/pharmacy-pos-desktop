// Run with: npx electron seed-realistic-orders-electron.cjs
const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

app.whenReady().then(() => {
  const os = require('os');
  const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pharmacy-pos-desktop', 'database.sqlite');
  console.log('Opening database at:', dbPath);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const manufacturers = [
    { name: 'Unilab', contact: 'Mr. Cruz' },
    { name: 'Pfizer', contact: 'Ms. Tan' },
    { name: 'TGP Generics', contact: 'Mr. Garcia' },
    { name: 'PharmaTech', contact: 'Mr. Cruz' },
    { name: 'Vitamins Plus', contact: 'Ms. Bautista' },
    { name: 'Bayer', contact: 'Mr. Lim' },
    { name: 'GSK', contact: 'Ms. Reyes' },
    { name: 'Generic Pharma', contact: 'Mr. Lim' },
  ];

  const productsByMfg = {
    'Unilab': ['Biogesic 500mg', 'Neozep Forte', 'Alaxan FR', 'Diatabs 2mg', 'Medicol Advance', 'Solmux 500mg', 'Decolgen Forte', 'Tuseran Forte'],
    'Pfizer': ['Advil 200mg', 'Centrum Silver', 'Caltrate Plus', 'Lipitor 20mg', 'Norvasc 5mg', 'Zithromax 500mg', 'Xanax 0.5mg', 'Celebrex 200mg'],
    'TGP Generics': ['Losartan 50mg', 'Metformin 500mg', 'Amlodipine 5mg', 'Omeprazole 20mg', 'Cetirizine 10mg', 'Simvastatin 20mg', 'Atorvastatin 10mg', 'Ciprofloxacin 500mg'],
    'PharmaTech': ['Ascorbic Acid 500mg', 'Mefenamic Acid 500mg', 'Ambroxol 30mg', 'Salbutamol 2mg', 'Ranitidine 150mg', 'Domperidone 10mg', 'Loperamide 2mg', 'Clindamycin 300mg'],
    'Vitamins Plus': ['Vitamin C 1000mg', 'Vitamin B Complex', 'Multivitamins + Iron', 'Zinc 10mg', 'Calcium + D3', 'Fish Oil 1000mg', 'Folic Acid 5mg', 'Vitamin E 400IU'],
    'Bayer': ['Aspirin 80mg', 'Aleve 220mg', 'Claritin 10mg', 'Canesten Cream', 'Berocca', 'Redoxon 1000mg', 'Bepanthen Ointment', 'Supradyn'],
    'GSK': ['Panadol Extra', 'Sensodyne Toothpaste', 'Voltaren Gel', 'Tums Antacid', 'Theraflu', 'Augmentin 625mg', 'Ventolin Inhaler', 'Amoxil 500mg'],
    'Generic Pharma': ['Amoxicillin 500mg', 'Cotrimoxazole 400mg', 'Cephalexin 500mg', 'Phenylephrine 10mg', 'Carbocisteine 500mg', 'Ibuprofen 200mg', 'Tramadol 50mg', 'Diclofenac 50mg'],
  };

  const orderUnits = ['Box', 'Bottle', 'Pack', 'Carton', 'Blister'];

  // Look up manufacturer IDs
  const mfgRows = db.prepare('SELECT id, name FROM manufacturers').all();
  const mfgLookup = {};
  for (const row of mfgRows) {
    mfgLookup[row.name] = row.id;
  }
  console.log('Found manufacturers:', Object.keys(mfgLookup).join(', '));

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
    let counter = 1;

    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const ordersThisMonth = 15 + Math.floor(Math.random() * 6);

      for (let i = 0; i < ordersThisMonth; i++) {
        const mfg = manufacturers[counter % manufacturers.length];
        const mfgProducts = productsByMfg[mfg.name];

        let status;
        const roll = Math.random();
        if (monthOffset >= 3) {
          status = roll < 0.7 ? 'Delivered' : roll < 0.85 ? 'Cancelled' : 'Processing';
        } else if (monthOffset >= 1) {
          status = roll < 0.4 ? 'Delivered' : roll < 0.65 ? 'In Transit' : roll < 0.85 ? 'Processing' : 'Cancelled';
        } else {
          status = roll < 0.5 ? 'Processing' : roll < 0.75 ? 'In Transit' : roll < 0.9 ? 'Delivered' : 'Cancelled';
        }

        const priority = Math.random() < 0.15 ? 'Urgent' : 'Normal';

        const dateObj = new Date();
        dateObj.setMonth(dateObj.getMonth() - monthOffset);
        dateObj.setDate(Math.floor(Math.random() * 28) + 1);
        const placedDate = dateObj.toISOString().split('T')[0];

        const termsDays = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
        const dueDate = new Date(dateObj);
        dueDate.setDate(dueDate.getDate() + termsDays);
        const payDueDate = dueDate.toISOString().split('T')[0];

        const itemsCount = Math.floor(Math.random() * 5) + 2;
        const items = [];
        let total = 0;

        for (let j = 0; j < itemsCount; j++) {
          const stockName = mfgProducts[j % mfgProducts.length];
          const quantity = (Math.floor(Math.random() * 20) + 5) * 5;
          const unitCost = Math.floor(Math.random() * 800) + 100;
          const discPercent = Math.random() < 0.3 ? [5, 10, 15][Math.floor(Math.random() * 3)] : 0;
          const netUcost = +(unitCost * (1 - discPercent / 100)).toFixed(2);
          const extCost = +(quantity * netUcost).toFixed(2);
          total += extCost;

          items.push({
            stockName,
            orderUnit: orderUnits[j % orderUnits.length],
            pkgQty: 1,
            quantity,
            unitCost,
            discPercent,
            netUcost,
            extCost,
            recvd: status === 'Delivered' ? quantity : 0,
            prNum: Math.random() < 0.3 ? `PR-${counter}-${j + 1}` : null,
            remarks: null,
          });
        }

        const padI = String(counter).padStart(4, '0');
        const timestamp = new Date().toISOString();
        const orderedByNames = ['CHA', 'System Administrator', 'Branch Manager'];

        const orderResult = insertOrder.run({
          orderCode: `PO-2026-${padI}`,
          manufacturerId: mfgLookup[mfg.name] || null,
          manufacturerName: mfg.name,
          contactPerson: mfg.contact,
          total: +total.toFixed(2),
          status,
          etaDate: placedDate,
          placedDate,
          priority,
          orderedByUserId: null,
          orderedByName: orderedByNames[counter % 3],
          remarks: Math.random() < 0.4 ? `Restock order for ${mfg.name} products` : null,
          faxEmailRemarks: null,
          notedBy: Math.random() < 0.5 ? 'Branch Manager' : null,
          approvedBy: Math.random() < 0.4 ? 'System Administrator' : null,
          qtyToOrder: ['1 week', '2 weeks', '1 month'][Math.floor(Math.random() * 3)],
          sysGen: 0,
          termsDays,
          payDueDate,
          isClosed: status === 'Delivered' ? 1 : 0,
          isLocked: status === 'Delivered' || status === 'Cancelled' ? 1 : 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        const purchaseOrderId = orderResult.lastInsertRowid;

        for (const item of items) {
          insertItem.run({ purchaseOrderId, ...item });
        }

        counter++;
      }
    }
    return counter - 1;
  });

  const totalInserted = seedAll();
  console.log(`\nSuccessfully seeded ${totalInserted} purchase orders with realistic data across 6 months.`);

  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM purchase_orders').get();
  const itemCountRow = db.prepare('SELECT COUNT(*) as cnt FROM purchase_order_items').get();
  console.log(`Database now has ${countRow.cnt} orders and ${itemCountRow.cnt} line items.`);

  // Show status breakdown
  const statusBreakdown = db.prepare('SELECT status, COUNT(*) as cnt FROM purchase_orders GROUP BY status').all();
  console.log('\nStatus breakdown:');
  for (const row of statusBreakdown) {
    console.log(`  ${row.status}: ${row.cnt}`);
  }

  db.close();
  app.quit();
});
