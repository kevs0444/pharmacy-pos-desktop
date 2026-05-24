
const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  const db = new Database(dbPath);

  console.log('Inserting orders across multiple months...');
  
  const statuses = ['Processing', 'In Transit', 'Delivered', 'Cancelled'];
  const priorities = ['Normal', 'Urgent'];
  const manufacturers = [
    { id: 1, name: 'PharmaCorp Inc.' },
    { id: 2, name: 'MedSupply Co.' },
    { id: 3, name: 'Global Health Ltd.' },
  ];

  db.transaction(() => {
    db.prepare('DELETE FROM purchase_order_items').run();
    db.prepare('DELETE FROM purchase_orders').run();

    let counter = 1;
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      // 20 orders per month for the last 6 months
      for (let i = 1; i <= 20; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const mfg = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const user = '01-MAIN';
        
        const dateObj = new Date();
        dateObj.setMonth(dateObj.getMonth() - monthOffset);
        dateObj.setDate(Math.floor(Math.random() * 28) + 1); // Random day
        const dateStr = dateObj.toISOString().split('T')[0];
        
        const itemsCount = Math.floor(Math.random() * 5) + 1;
        const items = [];
        let total = 0;
        
        for (let j = 0; j < itemsCount; j++) {
          const qty = Math.floor(Math.random() * 100) + 10;
          const cost = Math.floor(Math.random() * 500) + 50;
          const extCost = qty * cost;
          total += extCost;
          
          items.push({
            productId: j + 1,
            stockNo: '10' + (Math.floor(Math.random() * 100) + 1),
            stockName: 'Mock Product ' + j,
            orderUnit: 'EACH',
            pkgQty: 1,
            quantity: qty,
            unitCost: cost,
            discPercent: 0,
            netUCost: cost,
            extCost: extCost,
            recvd: status === 'Delivered' ? qty : 0,
            remarks: null,
            prNum: null
          });
        }

        const poResult = db.prepare(\
          INSERT INTO purchase_orders (
            order_code, manufacturer_id, manufacturer_name, contact_person,
            total, status, eta_date, placed_date, priority, ordered_by_name,
            remarks
          ) VALUES (
            @orderCode, @manufacturerId, @manufacturerName, @contactPerson,
            @total, @status, @etaDate, @placedDate, @priority, @orderedByName,
            @remarks
          )
        \).run({
          orderCode: 'PO-2026-' + counter.toString().padStart(4, '0'),
          manufacturerId: mfg.id,
          manufacturerName: mfg.name,
          contactPerson: 'Contact ' + counter,
          total: total,
          status: status,
          etaDate: dateStr,
          placedDate: dateStr,
          priority: priority,
          orderedByName: user,
          remarks: 'Auto-generated mock order for ' + dateStr
        });

        const orderId = poResult.lastInsertRowid;
        const insertItem = db.prepare(\
          INSERT INTO purchase_order_items (
            purchase_order_id, product_id, stock_no, stock_name, order_unit,
            pkg_qty, quantity, unit_cost, disc_percent, net_ucost, ext_cost, recvd
          ) VALUES (
            @purchaseOrderId, @productId, @stockNo, @stockName, @orderUnit,
            @pkgQty, @quantity, @unitCost, @discPercent, @netUCost, @extCost, @recvd
          )
        \);

        for (const item of items) {
          insertItem.run({ ...item, purchaseOrderId: orderId });
        }
        counter++;
      }
    }
  })();
  
  console.log('Seeded 120 orders across 6 months successfully');
  app.quit();
});

