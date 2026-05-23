const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  const db = new Database(dbPath);

  console.log('Inserting 1000 mock products...');
  
  const prefixes = ['Amoxi', 'Ceti', 'Para', 'Ibu', 'Losar', 'Omepra', 'Salbu', 'Metfor', 'Amlodi', 'Vitam', 'Aspi', 'Doxa', 'Lisin', 'Simva', 'Azythro', 'Cipro', 'Flucon', 'Gabapen', 'Levothy', 'Predni'];
  const suffixes = ['cillin', 'rizine', 'cetamol', 'profen', 'tan', 'zole', 'tamol', 'min', 'pine', 'in C', 'rin', 'zosin', 'pril', 'statin', 'mycin', 'floxacin', 'azole', 'tin', 'roxine', 'sone'];
  const types = ['TAB', 'CAP', 'SYR', 'DROP', 'CREAM', 'OINT', 'INJ', 'VIAL', 'SUSP'];
  const dosages = ['10MG', '20MG', '50MG', '100MG', '200MG', '250MG', '500MG', '1G', '60ML', '120ML', '15G'];
  const brands = ['(Generic)', '(Pfizer)', '(Unilab)', '(RiteMed)', '(Bayer)', '(GSK)', '(Novartis)', '(Sanofi)', '(Abbott)', '(TGP)'];

  db.transaction(() => {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        barcode, stock_no, name, category,
        base_unit, unit_cost, selling_price,
        current_stock, min_stock, status
      ) VALUES (
        @barcode, @stockNo, @name, @category,
        @baseUnit, @unitCost, @sellingPrice,
        @currentStock, @minStock, @status
      )
    `);

    for (let i = 1; i <= 1000; i++) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const dose = dosages[Math.floor(Math.random() * dosages.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      const name = `${p}${s} ${dose} ${type} ${brand}`.toUpperCase();
      const cost = parseFloat((Math.random() * 500 + 2).toFixed(2));
      const price = parseFloat((cost * 1.3).toFixed(2));

      insertProduct.run({
        barcode: '480' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'),
        stockNo: '10' + i.toString().padStart(4, '0'),
        name: name,
        category: 'Medicines',
        baseUnit: type === 'SYR' || type === 'DROP' ? 'BTL' : 'TAB',
        unitCost: cost,
        sellingPrice: price,
        currentStock: Math.floor(Math.random() * 1000),
        minStock: 50,
        status: 'Active'
      });
    }
  })();
  
  console.log('Seeded 1000 products successfully');
  app.quit();
});
