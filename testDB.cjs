const Database = require('better-sqlite3');
try {
  const dbPath = process.env.APPDATA + '/pharmacy-pos-desktop/data/botikaplus.sqlite';
  const db = new Database(dbPath);
  const count = db.prepare('SELECT count(*) as c FROM products').get().c;
  const activeCount = db.prepare('SELECT count(*) as c FROM products WHERE is_active = 1').get().c;
  const sample = db.prepare('SELECT is_active, category FROM products LIMIT 1').get();
  console.log("DB PATH:", dbPath);
  console.log("Total Products:", count);
  console.log("Active Products:", activeCount);
  console.log("Sample Item:", sample);
  
  const batchesCount = db.prepare('SELECT count(*) as c FROM product_batches').get().c;
  const sellableBatches = db.prepare(`SELECT count(*) as c FROM product_batches WHERE is_active = 1 AND stock_pieces > 0 AND date(expiry_date) >= date('now')`).get().c;
  console.log("Total Batches:", batchesCount);
  console.log("Sellable Batches:", sellableBatches);
} catch (e) {
  console.error("DB Test Error:", e);
}
