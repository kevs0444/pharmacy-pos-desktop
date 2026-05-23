
const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  const db = new Database(dbPath);
  db.prepare('DELETE FROM purchase_order_items').run();
  db.prepare('DELETE FROM purchase_orders').run();
  console.log('Cleared orders');

  // Let's seed by loading the actual backend seed script
  // But wait, it's typescript, so I can't require it directly.
  // I will just let the app reseed it on the next launch if we clear it? 
  // Wait, backend/db/seed.ts only seeds if the DB is empty (i.e. products table is empty).
  // I should just compile the seed and run it.
  app.quit();
});

