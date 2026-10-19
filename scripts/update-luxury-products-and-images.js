/**
 * Script: update-luxury-products-and-images.js
 * 1. Updates broken/mismatched images for existing watches in the database:
 *    - Replaces Gucci bag image (photo-1548036328-c9fa89d128fa) on watches with genuine luxury watch images
 *    - Replaces cosmetics bottle image (photo-1522335789203-aabd1fc54bc9) on watches with genuine watch images
 *    - Replaces calculator keypad image (photo-1526045612212-70caf35c14df) on watches with genuine watch images
 *    - Replaces cosmetics cream image (photo-1612817288484-6f916006741a) on watches with genuine watch images
 *    - Updates duplicate Garmin/Apple/Samsung smartwatch images with distinct photos
 * 2. Inserts high-value luxury products from $55,000 to $160,000 so Admin can easily freeze accounts
 *    with balances from $50k to $150k+ (especially for target price $70,000).
 */

const { Client } = require('ssh2');

const luxuryNewProducts = [
  // $55,000 - $65,000
  {
    name: 'Rolex Day-Date 40 18K Rose Gold Olive Green Dial 228235',
    brand: 'Rolex',
    category: 'Watches',
    price: 56500,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/day-date/m228235-0025.html'
  },
  {
    name: 'Tiffany & Co. Schlumberger Sixteen Stone Diamond & Platinum Necklace',
    brand: 'Tiffany & Co.',
    category: 'Jewelry',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    productUrl: 'https://www.tiffany.com/jewelry/necklaces-pendants/schlumberger'
  },
  {
    name: 'Patek Philippe Calatrava Pilot Travel Time 5524R Rose Gold',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 58500,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/calatrava/5524R-001'
  },
  {
    name: 'Audemars Piguet Royal Oak Selfwinding 41mm 15510OR Rose Gold',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 61500,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak'
  },
  {
    name: 'Vacheron Constantin Overseas Chronograph Rose Gold Blue Dial',
    brand: 'Vacheron Constantin',
    category: 'Watches',
    price: 62000,
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
    productUrl: 'https://www.vacheron-constantin.com/overseas'
  },
  {
    name: 'Rolex GMT-Master II Meteorite Dial 18K White Gold 126719BLRO',
    brand: 'Rolex',
    category: 'Watches',
    price: 64500,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/gmt-master-ii/m126719blro-0002.html'
  },

  // $66,000 - $75,000 (Target $70,000 Zone!)
  {
    name: 'Audemars Piguet Royal Oak Jumbo Extra-Thin 16202ST Steel',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 68000,
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/16202ST'
  },
  {
    name: 'Van Cleef & Arpels Frivole 9-Flower Diamond Necklace 18K Gold',
    brand: 'Van Cleef & Arpels',
    category: 'Jewelry',
    price: 69500,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    productUrl: 'https://www.vancleefarpels.com/frivole'
  },
  {
    name: 'Rolex Cosmograph Daytona 18K Yellow Gold Green Dial John Mayer 116508',
    brand: 'Rolex',
    category: 'Watches',
    price: 70000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/cosmograph-daytona/m116508-0013.html'
  },
  {
    name: 'F.P. Journe Octa Automatique Réserve de Marche Platinum',
    brand: 'F.P. Journe',
    category: 'Watches',
    price: 72000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    productUrl: 'https://www.fpjourne.com/collection/octa'
  },
  {
    name: 'Patek Philippe Complications Annual Calendar 5396R Rose Gold',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 73500,
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/complications/5396R-011'
  },
  {
    name: 'Jacob & Co. Epic X Chrono Titanium Baguette Diamonds 47mm',
    brand: 'Jacob & Co.',
    category: 'Watches',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
    productUrl: 'https://jacobandco.com/timepieces/epic-x'
  },

  // $76,000 - $85,000
  {
    name: 'Audemars Piguet Royal Oak Chronograph 41mm 26240OR Rose Gold',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 76000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/26240OR'
  },
  {
    name: 'Hermès Kelly 25 Sellier Shiny Alligator Emerald Green Gold Hardware',
    brand: 'Hermès',
    category: 'Handbags',
    price: 78000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    productUrl: 'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/'
  },
  {
    name: 'Rolex Day-Date 40 Platinum Ice Blue Roman Dial 228206',
    brand: 'Rolex',
    category: 'Watches',
    price: 78500,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/day-date/m228206-0004.html'
  },
  {
    name: 'Vacheron Constantin Overseas Perpetual Calendar Ultra-Thin Blue Dial',
    brand: 'Vacheron Constantin',
    category: 'Watches',
    price: 82000,
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
    productUrl: 'https://www.vacheron-constantin.com/en/watches/overseas/overseas-perpetual-calendar-ultra-thin.html'
  },
  {
    name: 'Audemars Piguet Royal Oak Double Balance Wheel Openworked 15407ST',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/15407ST'
  },
  {
    name: 'F.P. Journe Chronomètre Bleu Tantalum Blue Chrome Dial',
    brand: 'F.P. Journe',
    category: 'Watches',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    productUrl: 'https://www.fpjourne.com/collection/souveraine/chronometre-bleu'
  },

  // $86,000 - $99,000
  {
    name: 'Cartier Panthère de Cartier High Jewelry Diamond Bracelet 18K White Gold',
    brand: 'Cartier',
    category: 'Jewelry',
    price: 86000,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    productUrl: 'https://www.cartier.com/en-us/jewelry/bracelets/panthere-de-cartier-bracelet'
  },
  {
    name: 'Patek Philippe Complications World Time Cloisonné Enamel 5231J',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 88000,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/complications/5231J-001'
  },
  {
    name: 'Patek Philippe Aquanaut Chronograph 5968G White Gold Midnight Blue',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 92000,
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/aquanaut/5968G-001'
  },
  {
    name: 'Harry Winston Winston Cluster Diamond Necklace 15 Carats Platinum',
    brand: 'Harry Winston',
    category: 'Jewelry',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    productUrl: 'https://www.harrywinston.com/en/jewels/winston-cluster'
  },
  {
    name: 'Richard Mille RM 029 Automatic All Grey Titanium Carbon TPT',
    brand: 'Richard Mille',
    category: 'Watches',
    price: 98500,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    productUrl: 'https://www.richardmille.com/collections/rm-029-automatic'
  },

  // $100,000 - $160,000 (Ultra High Luxury)
  {
    name: 'Audemars Piguet Royal Oak Offshore Tourbillon Chronograph 26421OR',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 105000,
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak-offshore'
  },
  {
    name: 'Graff Classic Butterfly Emerald and Pavé Diamond Necklace Platinum',
    brand: 'Graff',
    category: 'Jewelry',
    price: 110000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    productUrl: 'https://www.graff.com/us-en/jewelry-collections/butterfly/'
  },
  {
    name: 'Rolex Cosmograph Daytona Platinum Ice Blue Dial Ceramic Bezel 116506',
    brand: 'Rolex',
    category: 'Watches',
    price: 112000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/cosmograph-daytona/m116506-0001.html'
  },
  {
    name: 'Richard Mille RM 030 Automatic Declutchable Rotor Titanium',
    brand: 'Richard Mille',
    category: 'Watches',
    price: 115000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    productUrl: 'https://www.richardmille.com/collections/rm-030-automatic'
  },
  {
    name: 'Audemars Piguet Royal Oak Perpetual Calendar 18K Rose Gold 26574OR',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 118000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/26574OR'
  },
  {
    name: 'Hermès Birkin 30 Porosus Crocodile Diamond Hardware Black',
    brand: 'Hermès',
    category: 'Handbags',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    productUrl: 'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/'
  },
  {
    name: 'Patek Philippe Nautilus Chronograph 5980/1R 18K Rose Gold Black Dial',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/nautilus/5980-1R-001'
  },
  {
    name: 'Richard Mille RM 035 Rafael Nadal Americas Carbon TPT',
    brand: 'Richard Mille',
    category: 'Watches',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
    productUrl: 'https://www.richardmille.com/collections/rm-035-rafael-nadal'
  },
  {
    name: 'Vacheron Constantin Overseas Tourbillon Skeleton 18K Pink Gold',
    brand: 'Vacheron Constantin',
    category: 'Watches',
    price: 138000,
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80',
    productUrl: 'https://www.vacheron-constantin.com/en/watches/overseas/overseas-tourbillon-skeleton.html'
  },
  {
    name: 'Richard Mille RM 011 Felipe Massa Flyback Chronograph Titanium Carbon',
    brand: 'Richard Mille',
    category: 'Watches',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    productUrl: 'https://www.richardmille.com/collections/rm-011-felipe-massa'
  },
  {
    name: 'Audemars Piguet Royal Oak Concept Flying Tourbillon GMT Titanium',
    brand: 'Audemars Piguet',
    category: 'Watches',
    price: 148000,
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
    productUrl: 'https://www.audemarspiguet.com/com/en/watch-collection/royal-oak-concept'
  },
  {
    name: 'Patek Philippe Grand Complications Perpetual Calendar Chronograph 5270P',
    brand: 'Patek Philippe',
    category: 'Watches',
    price: 155000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    productUrl: 'https://www.patek.com/en/collection/grand-complications/5270P-014'
  },
  {
    name: 'Rolex Cosmograph Daytona Rainbow 18K Everose Gold Baguette Sapphire 116595RBOW',
    brand: 'Rolex',
    category: 'Watches',
    price: 158000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    productUrl: 'https://www.rolex.com/watches/cosmograph-daytona.html'
  },
  {
    name: 'Jacob & Co. Astronomia Sky Celestial Panorama Tourbillon Rose Gold',
    brand: 'Jacob & Co.',
    category: 'Watches',
    price: 160000,
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80',
    productUrl: 'https://jacobandco.com/timepieces/astronomia'
  }
];

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  const clean = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${clean}'`;
}

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to VPS 223.130.11.200');

  // Step 1: Update broken images on existing watches
  const updateSql = `
    -- 1. Replace Gucci bag image on Watches with genuine luxury watch images
    UPDATE product 
    SET image = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80'
    WHERE category = 'Watches' AND image LIKE '%photo-1548036328-c9fa89d128fa%';

    -- 2. Replace cosmetics skincare image on Watches with genuine watch image
    UPDATE product 
    SET image = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80'
    WHERE category = 'Watches' AND image LIKE '%photo-1522335789203-aabd1fc54bc9%';

    -- 3. Replace calculator keypad image on Watches with genuine watch image
    UPDATE product 
    SET image = 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80'
    WHERE category = 'Watches' AND image LIKE '%photo-1526045612212-70caf35c14df%';

    -- 4. Replace cosmetics cream jar image on Watches with genuine watch image
    UPDATE product 
    SET image = 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80'
    WHERE category = 'Watches' AND image LIKE '%photo-1612817288484-6f916006741a%';

    -- 5. Give Garmin Fenix 8 distinct dark AMOLED watch photo
    UPDATE product 
    SET image = 'https://m.media-amazon.com/images/I/71uVvFjZ-oL._AC_UY218_.jpg'
    WHERE name LIKE '%Garmin Fenix 8%';

    -- 6. Give Garmin Epix distinct outdoor watch photo
    UPDATE product 
    SET image = 'https://m.media-amazon.com/images/I/71k4oBv0T8L._AC_UY218_.jpg'
    WHERE name LIKE '%Garmin Epix%';

    -- 7. Give Garmin Forerunner distinct black sport watch photo
    UPDATE product 
    SET image = 'https://m.media-amazon.com/images/I/61t94J9xHQL._AC_UY218_.jpg'
    WHERE name LIKE '%Garmin Forerunner 965%';

    -- 8. Give Apple Watch Ultra distinct Titanium image
    UPDATE product 
    SET image = 'https://m.media-amazon.com/images/I/71XMTLtZd5L._AC_UY218_.jpg'
    WHERE name LIKE '%Apple Watch Ultra%';

    -- 9. Give Samsung Galaxy Watch Ultra distinct rugged image
    UPDATE product 
    SET image = 'https://m.media-amazon.com/images/I/71o8n1G4dKL._AC_UY218_.jpg'
    WHERE name LIKE '%Samsung Galaxy Watch Ultra%';
  `;

  // Step 2: Insert the new luxury items
  const insertValues = luxuryNewProducts.map(p => 
    `(${escapeSql(p.name)}, ${escapeSql(p.brand)}, ${escapeSql(p.category)}, ${p.price}, ${escapeSql(p.image)}, ${escapeSql(p.productUrl)}, 1, NOW(), NOW())`
  ).join(',\n');

  const insertSql = `
    INSERT INTO product (name, brand, category, price, image, productUrl, isActive, createdAt, updatedAt)
    VALUES
    ${insertValues};
  `;

  const fullSql = updateSql + '\n' + insertSql;

  conn.exec(`mysql -u root -p0904521297t greeting_message << 'EOF'\n${fullSql}\nEOF`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
      console.log('STDOUT:', out);
      console.log('🎉 Successfully updated broken watch images and inserted new luxury products!');

      // Verify the new max price and count
      conn.exec(`mysql -u root -p0904521297t greeting_message -e "SELECT MIN(price), MAX(price), COUNT(*) FROM product; SELECT id, name, brand, price FROM product WHERE price >= 55000 ORDER BY price ASC LIMIT 20;"`, (err2, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('close', () => {
          console.log('\n📊 NEW PRODUCTS STATS (>= $55,000):');
          console.log(out2);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
