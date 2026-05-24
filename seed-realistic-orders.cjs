const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pharmacy-pos-desktop', 'data', 'botikaplus.sqlite');
  console.log('Opening database at:', dbPath);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const products = db.prepare(`
    SELECT id, code, name, packaging_unit, manufacturer_id, unit_price_cost 
    FROM products 
    WHERE is_active = 1
  `).all();

  const mfgRows = db.prepare('SELECT id, name, contact_person, email, phone FROM manufacturers').all();
  
  if (products.length === 0) {
    console.error('No products found in the database. Please run seed-products.js first.');
    app.quit();
    return;
  }

  const productsByMfg = {};
  const unassignedProducts = [];
  for (const p of products) {
    if (p.manufacturer_id) {
      if (!productsByMfg[p.manufacturer_id]) productsByMfg[p.manufacturer_id] = [];
      productsByMfg[p.manufacturer_id].push(p);
    } else {
      unassignedProducts.push(p);
    }
  }

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
      purchase_order_id, product_id, stock_no, stock_name, order_unit, pkg_qty, quantity, unit_cost,
      disc_percent, net_ucost, ext_cost, recvd, pr_num, remarks
    ) VALUES (
      @purchaseOrderId, @productId, @stockNo, @stockName, @orderUnit, @pkgQty, @quantity, @unitCost,
      @discPercent, @netUcost, @extCost, @recvd, @prNum, @remarks
    )
  `);

  const seedAll = db.transaction(() => {
    let counter = 1;
    const managers = ['Alice Johnson (Branch Manager)', 'Bob Smith (Purchasing)', 'System Administrator'];
    const staff = ['Cha (Pharmacist)', 'David (Inventory)', 'Eva (Sales)'];
    const faxRemarks = ['Please confirm receipt via email.', 'Fax confirmation back ASAP.', 'Email invoice to accounting.', 'Do not replace out-of-stock items without approval.', 'Urgent delivery required.'];
    const orderRemarks = ['Regular monthly restock.', 'Low stock alert replenishment.', 'Promotional stock up.', 'Special order for bulk client.', 'Seasonal flu restock.', 'Emergency fill.'];

    // Generate exactly 100 POs
    const totalOrders = 100;
    for (let i = 0; i < totalOrders; i++) {
      const monthOffset = Math.floor(Math.random() * 12); // Random month within last year
        // Pick a manufacturer that has products
        let mfg = null;
        let mfgProdList = [];
        let attempts = 0;
        while (attempts < 10) {
          mfg = mfgRows[Math.floor(Math.random() * mfgRows.length)];
          if (productsByMfg[mfg.id] && productsByMfg[mfg.id].length > 0) {
            mfgProdList = productsByMfg[mfg.id];
            break;
          }
          attempts++;
        }
        
        // Fallback to unassigned if the chosen mfg has no products
        if (mfgProdList.length === 0 && unassignedProducts.length > 0) {
          mfgProdList = unassignedProducts;
          mfg = { id: null, name: 'General Supplier', contact_person: 'Sales Dept', phone: 'N/A', email: 'sales@general.local' };
        }
        
        if (mfgProdList.length === 0) continue; // Skip if no products available at all

        // Determine dates
        const dateObj = new Date();
        dateObj.setMonth(dateObj.getMonth() - monthOffset);
        dateObj.setDate(Math.floor(Math.random() * 28) + 1);
        const placedDate = dateObj.toISOString().split('T')[0];

        const termsDays = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
        const dueDate = new Date(dateObj);
        dueDate.setDate(dueDate.getDate() + termsDays);
        const payDueDate = dueDate.toISOString().split('T')[0];
        
        // Determine status based on age
        let status;
        const roll = Math.random();
        if (monthOffset >= 3) {
          status = roll < 0.7 ? 'Delivered' : roll < 0.85 ? 'Cancelled' : 'Processing';
        } else if (monthOffset >= 1) {
          status = roll < 0.4 ? 'Delivered' : roll < 0.65 ? 'In Transit' : roll < 0.85 ? 'Processing' : 'Cancelled';
        } else {
          status = roll < 0.5 ? 'Processing' : roll < 0.75 ? 'In Transit' : roll < 0.9 ? 'Delivered' : 'Cancelled';
        }

        // Set exactly 1000 items per PO for the demo
        const itemsCount = 1000;
        const items = [];
        let total = 0;

        // Ensure unique products in the order if possible, otherwise repeat
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());

        for (let i = 0; i < itemsCount; i++) {
          const p = shuffledProducts[i % shuffledProducts.length];
          const quantity = (Math.floor(Math.random() * 20) + 1) * 10; // 10, 20, ... 200
          const unitCost = p.unit_price_cost > 0 ? p.unit_price_cost : (Math.random() * 500 + 10);
          const discPercent = Math.random() < 0.3 ? [5, 10, 15, 20][Math.floor(Math.random() * 4)] : 0;
          const netUcost = +(unitCost * (1 - discPercent / 100)).toFixed(2);
          const extCost = +(quantity * netUcost).toFixed(2);
          total += extCost;

          items.push({
            productId: p.id,
            stockNo: p.code,
            stockName: p.name,
            orderUnit: p.packaging_unit || 'EACH',
            pkgQty: 1,
            quantity,
            unitCost: +unitCost.toFixed(2),
            discPercent,
            netUcost,
            extCost,
            recvd: status === 'Delivered' ? quantity : (status === 'In Transit' ? Math.floor(quantity * Math.random()) : 0),
            prNum: Math.random() < 0.3 ? `PR-26-${counter}-${Math.floor(Math.random()*100)}` : null,
            remarks: Math.random() < 0.2 ? 'Check expiry date upon receiving' : null,
          });
        }

        const padI = String(counter).padStart(4, '0');
        const timestamp = new Date().toISOString();

        const orderResult = insertOrder.run({
          orderCode: `PO-2026-${padI}`,
          manufacturerId: mfg.id,
          manufacturerName: mfg.name,
          contactPerson: mfg.contact_person || 'Sales Rep',
          total: +total.toFixed(2),
          status,
          etaDate: placedDate,
          placedDate,
          priority: Math.random() < 0.15 ? 'Urgent' : 'Normal',
          orderedByUserId: null,
          orderedByName: staff[Math.floor(Math.random() * staff.length)],
          remarks: orderRemarks[Math.floor(Math.random() * orderRemarks.length)],
          faxEmailRemarks: faxRemarks[Math.floor(Math.random() * faxRemarks.length)],
          notedBy: managers[Math.floor(Math.random() * managers.length)],
          approvedBy: Math.random() < 0.8 ? managers[Math.floor(Math.random() * managers.length)] : null,
          qtyToOrder: ['1 week supply', '1 month supply', 'Quarterly stock'][Math.floor(Math.random() * 3)],
          sysGen: Math.random() < 0.1 ? 1 : 0,
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
    return counter - 1;
  });

  const totalInserted = seedAll();
  console.log(`Successfully seeded ${totalInserted} realistic purchase orders linked to actual inventory.`);

  db.close();
  app.quit();
});
