const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  const db = new Database(path.join(os.homedir(), 'AppData', 'Roaming', 'pharmacy-pos-desktop', 'data', 'botikaplus.sqlite'));
  const prodCount = db.prepare('SELECT COUNT(*) as cnt FROM products').get();
  const mfgCount = db.prepare('SELECT COUNT(*) as cnt FROM manufacturers').get();
  console.log('Products:', prodCount.cnt, 'Manufacturers:', mfgCount.cnt);
  app.quit();
});
