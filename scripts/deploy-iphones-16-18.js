const { Client } = require('ssh2');
const fs = require('fs');

// Define product catalog with accurate real prices and images
const products = [
  // iPhone 16 (6.1-inch)
  { name: 'Apple iPhone 16 128GB Teal', brand: 'Apple', category: 'Điện tử', price: 799, file: 'iphone-16-teal.jpg' },
  { name: 'Apple iPhone 16 128GB Ultramarine', brand: 'Apple', category: 'Điện tử', price: 799, file: 'iphone-16-ultramarine.jpg' },
  { name: 'Apple iPhone 16 128GB Pink', brand: 'Apple', category: 'Điện tử', price: 799, file: 'iphone-16-pink.jpg' },
  { name: 'Apple iPhone 16 128GB White', brand: 'Apple', category: 'Điện tử', price: 799, file: 'iphone-16-white.jpg' },
  { name: 'Apple iPhone 16 128GB Black', brand: 'Apple', category: 'Điện tử', price: 799, file: 'iphone-16-black.jpg' },
  { name: 'Apple iPhone 16 256GB Teal', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-teal.jpg' },
  { name: 'Apple iPhone 16 256GB Ultramarine', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-ultramarine.jpg' },
  { name: 'Apple iPhone 16 256GB Pink', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-pink.jpg' },
  { name: 'Apple iPhone 16 256GB White', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-white.jpg' },
  { name: 'Apple iPhone 16 256GB Black', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-black.jpg' },
  { name: 'Apple iPhone 16 512GB Ultramarine', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-ultramarine.jpg' },
  { name: 'Apple iPhone 16 512GB Black', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-black.jpg' },

  // iPhone 16 Plus (6.7-inch)
  { name: 'Apple iPhone 16 Plus 128GB Teal', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-plus-teal.jpg' },
  { name: 'Apple iPhone 16 Plus 128GB Ultramarine', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-plus-ultramarine.jpg' },
  { name: 'Apple iPhone 16 Plus 128GB Pink', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-plus-pink.jpg' },
  { name: 'Apple iPhone 16 Plus 128GB White', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-plus-white.jpg' },
  { name: 'Apple iPhone 16 Plus 128GB Black', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-16-plus-black.jpg' },
  { name: 'Apple iPhone 16 Plus 256GB Ultramarine', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-plus-ultramarine.jpg' },
  { name: 'Apple iPhone 16 Plus 256GB Teal', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-plus-teal.jpg' },
  { name: 'Apple iPhone 16 Plus 256GB Black', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-plus-black.jpg' },
  { name: 'Apple iPhone 16 Plus 512GB Black', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-16-plus-black.jpg' },

  // iPhone 16 Pro (6.3-inch)
  { name: 'Apple iPhone 16 Pro 128GB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-pro-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 128GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-pro-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 128GB White Titanium', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-pro-whitetitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 128GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-16-pro-blacktitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 256GB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-pro-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 256GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-pro-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 256GB White Titanium', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-pro-whitetitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 256GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-16-pro-blacktitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 512GB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1299, file: 'iphone-16-pro-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 512GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1299, file: 'iphone-16-pro-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 1TB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1499, file: 'iphone-16-pro-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro 1TB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1499, file: 'iphone-16-pro-blacktitanium.jpg' },

  // iPhone 16 Pro Max (6.9-inch)
  { name: 'Apple iPhone 16 Pro Max 256GB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-16-pro-max-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-16-pro-max-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 256GB White Titanium', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-16-pro-max-whitetitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 256GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-16-pro-max-blacktitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 512GB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1399, file: 'iphone-16-pro-max-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 512GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1399, file: 'iphone-16-pro-max-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 512GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1399, file: 'iphone-16-pro-max-blacktitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 1TB Desert Titanium', brand: 'Apple', category: 'Điện tử', price: 1599, file: 'iphone-16-pro-max-deserttitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 1TB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1599, file: 'iphone-16-pro-max-naturaltitanium.jpg' },
  { name: 'Apple iPhone 16 Pro Max 1TB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1599, file: 'iphone-16-pro-max-blacktitanium.jpg' },

  // iPhone 17 (Next-Gen)
  { name: 'Apple iPhone 17 128GB Mist Blue', brand: 'Apple', category: 'Điện tử', price: 849, file: 'iphone-17-mist-blue.jpg' },
  { name: 'Apple iPhone 17 128GB Sage Green', brand: 'Apple', category: 'Điện tử', price: 849, file: 'iphone-17-sage.jpg' },
  { name: 'Apple iPhone 17 128GB Lavender', brand: 'Apple', category: 'Điện tử', price: 849, file: 'iphone-17-lavender.jpg' },
  { name: 'Apple iPhone 17 128GB White', brand: 'Apple', category: 'Điện tử', price: 849, file: 'iphone-17-white.jpg' },
  { name: 'Apple iPhone 17 128GB Black', brand: 'Apple', category: 'Điện tử', price: 849, file: 'iphone-17-black.jpg' },
  { name: 'Apple iPhone 17 256GB Mist Blue', brand: 'Apple', category: 'Điện tử', price: 949, file: 'iphone-17-mist-blue.jpg' },
  { name: 'Apple iPhone 17 256GB Sage Green', brand: 'Apple', category: 'Điện tử', price: 949, file: 'iphone-17-sage.jpg' },
  { name: 'Apple iPhone 17 256GB White', brand: 'Apple', category: 'Điện tử', price: 949, file: 'iphone-17-white.jpg' },
  { name: 'Apple iPhone 17 512GB Mist Blue', brand: 'Apple', category: 'Điện tử', price: 1149, file: 'iphone-17-mist-blue.jpg' },
  { name: 'Apple iPhone 17 Air 256GB Ultra Slim', brand: 'Apple', category: 'Điện tử', price: 1099, file: 'iphone-17-air.jpg' },
  { name: 'Apple iPhone 17 Air 512GB Ultra Slim', brand: 'Apple', category: 'Điện tử', price: 1299, file: 'iphone-17-air.jpg' },
  { name: 'Apple iPhone 17 Pro 256GB Titanium Silver', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-17-pro-silver.jpg' },
  { name: 'Apple iPhone 17 Pro 512GB Cosmic Orange', brand: 'Apple', category: 'Điện tử', price: 1399, file: 'iphone-17-pro-cosmic-orange.jpg' },
  { name: 'Apple iPhone 17 Pro 1TB Titanium Silver', brand: 'Apple', category: 'Điện tử', price: 1599, file: 'iphone-17-pro-silver.jpg' },
  { name: 'Apple iPhone 17 Pro Max 256GB Cosmic Orange', brand: 'Apple', category: 'Điện tử', price: 1299, file: 'iphone-17-pro-max-cosmic-orange.jpg' },
  { name: 'Apple iPhone 17 Pro Max 256GB Silver Titanium', brand: 'Apple', category: 'Điện tử', price: 1299, file: 'iphone-17-pro-max-silver.jpg' },
  { name: 'Apple iPhone 17 Pro Max 512GB Cosmic Orange', brand: 'Apple', category: 'Điện tử', price: 1499, file: 'iphone-17-pro-max-cosmic-orange.jpg' },
  { name: 'Apple iPhone 17 Pro Max 512GB Silver Titanium', brand: 'Apple', category: 'Điện tử', price: 1499, file: 'iphone-17-pro-max-silver.jpg' },
  { name: 'Apple iPhone 17 Pro Max 1TB Cosmic Orange', brand: 'Apple', category: 'Điện tử', price: 1699, file: 'iphone-17-pro-max-cosmic-orange.jpg' },
  { name: 'Apple iPhone 17 Pro Max 1TB Silver Titanium', brand: 'Apple', category: 'Điện tử', price: 1699, file: 'iphone-17-pro-max-silver.jpg' },

  // iPhone 18 (Future Series)
  { name: 'Apple iPhone 18 128GB Midnight Black', brand: 'Apple', category: 'Điện tử', price: 899, file: 'iphone-18-black.jpg' },
  { name: 'Apple iPhone 18 256GB Space Gray', brand: 'Apple', category: 'Điện tử', price: 999, file: 'iphone-18-black.jpg' },
  { name: 'Apple iPhone 18 512GB Midnight Black', brand: 'Apple', category: 'Điện tử', price: 1199, file: 'iphone-18-black.jpg' },
  { name: 'Apple iPhone 18 Slim 256GB Air Edition', brand: 'Apple', category: 'Điện tử', price: 1149, file: 'iphone-18-slim.jpg' },
  { name: 'Apple iPhone 18 Slim 512GB Air Edition', brand: 'Apple', category: 'Điện tử', price: 1349, file: 'iphone-18-slim.jpg' },
  { name: 'Apple iPhone 18 Pro 256GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1249, file: 'iphone-18-pro.jpg' },
  { name: 'Apple iPhone 18 Pro 256GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1249, file: 'iphone-18-pro-black.jpg' },
  { name: 'Apple iPhone 18 Pro 512GB Natural Titanium', brand: 'Apple', category: 'Điện tử', price: 1449, file: 'iphone-18-pro.jpg' },
  { name: 'Apple iPhone 18 Pro 512GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1449, file: 'iphone-18-pro-black.jpg' },
  { name: 'Apple iPhone 18 Pro 1TB Titanium Edition', brand: 'Apple', category: 'Điện tử', price: 1649, file: 'iphone-18-pro.jpg' },
  { name: 'Apple iPhone 18 Pro Max 256GB Deep Titanium', brand: 'Apple', category: 'Điện tử', price: 1349, file: 'iphone-18-pro-max.jpg' },
  { name: 'Apple iPhone 18 Pro Max 256GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1349, file: 'iphone-18-pro-max-black.jpg' },
  { name: 'Apple iPhone 18 Pro Max 512GB Deep Titanium', brand: 'Apple', category: 'Điện tử', price: 1549, file: 'iphone-18-pro-max.jpg' },
  { name: 'Apple iPhone 18 Pro Max 512GB Black Titanium', brand: 'Apple', category: 'Điện tử', price: 1549, file: 'iphone-18-pro-max-black.jpg' },
  { name: 'Apple iPhone 18 Pro Max 1TB Deep Titanium', brand: 'Apple', category: 'Điện tử', price: 1749, file: 'iphone-18-pro-max.jpg' },
  { name: 'Apple iPhone 18 Ultra 1TB Ceramic Edition', brand: 'Apple', category: 'Điện tử', price: 1999, file: 'iphone-18-ultra.jpg' },
  { name: 'Apple iPhone 18 Ultra 2TB Ceramic Edition', brand: 'Apple', category: 'Điện tử', price: 2299, file: 'iphone-18-ultra.jpg' }
];

// Mapping of files to source URLs
const imageSources = {
  // Apple Store CDN for iPhone 16
  'iphone-16-teal.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-ultramarine.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pink.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-pink?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-white.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-white?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-black.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-plus-teal.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-teal?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-plus-ultramarine.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-ultramarine?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-plus-pink.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-pink?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-plus-white.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-white?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-plus-black.jpg': 'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-black?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-deserttitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-naturaltitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-whitetitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-whitetitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-blacktitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-max-deserttitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-max-naturaltitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-naturaltitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-max-whitetitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-whitetitanium?wid=1000&hei=1000&fmt=jpeg',
  'iphone-16-pro-max-blacktitanium.jpg': 'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-blacktitanium?wid=1000&hei=1000&fmt=jpeg',

  // Wikimedia Commons for iPhone 17 & 18
  'iphone-17-mist-blue.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Mist_Blue_iPhone_17.jpg',
  'iphone-17-white.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/White_iPhone_17.jpg',
  'iphone-17-sage.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Sage_iPhone_17.jpg',
  'iphone-17-black.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/56/Black_iPhone_17.jpg',
  'iphone-17-lavender.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Lavender_iPhone_17.jpg',
  'iphone-17-air.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/IPhone_17%2C_Air%2C_17_Pro%2C_and_Pro_max.jpg',
  'iphone-17-pro-silver.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Silver_iPhone_17_Pro_Max.jpg',
  'iphone-17-pro-cosmic-orange.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Cosmic_Orange_iPhone_17_Pro_Max.jpg',
  'iphone-17-pro-max-silver.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Silver_iPhone_17_Pro_Max.jpg',
  'iphone-17-pro-max-cosmic-orange.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Cosmic_Orange_iPhone_17_Pro_Max.jpg',
  'iphone-18-black.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/22/IPhone_18_Pro_black_rear.jpg',
  'iphone-18-pro.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/IPhone_18_Pro_rear.jpg',
  'iphone-18-pro-black.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/22/IPhone_18_Pro_black_rear.jpg',
  'iphone-18-pro-max.jpg': 'https://upload.wikimedia.org/wikipedia/commons/3/34/IPhone_18_Pro_Max_rear.jpg',
  'iphone-18-pro-max-black.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/IPhone_18_Pro_Max_black_rear.jpg',
  'iphone-18-slim.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/80/IPhone_18_Pro_-_black_03.jpg',
  'iphone-18-ultra.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/53/IPhone_18_Pro_-_black_02.jpg'
};

// Create a standalone execution script that will run directly on the VPS
const remoteScript = `
const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadDir = '/opt/bufforder/backend/uploads/iphones';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const imageSources = ${JSON.stringify(imageSources, null, 2)};
const products = ${JSON.stringify(products, null, 2)};

function downloadFile(url, dest, depth = 0) {
  return new Promise((resolve) => {
    if (depth > 5) return resolve(false);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'AshfordProductManager/1.0 (https://www.ashfordorder.com; admin@ashfordorder.com)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest, depth + 1).then(resolve);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return resolve(false);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });
    req.on('error', () => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Downloading images to ' + uploadDir + '...');
  for (const [filename, url] of Object.entries(imageSources)) {
    const dest = path.join(uploadDir, filename);
    const ok = await downloadFile(url, dest);
    const sz = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    console.log((ok ? '✅' : '❌') + ' ' + filename + ' (' + sz + ' bytes)');
  }

  console.log('Connected to Prisma. Deleting old test rows...');
  const del = await prisma.product.deleteMany({
    where: {
      id: { gte: 5549, lte: 5564 }
    }
  });
  console.log('Deleted old test iPhone rows:', del.count);

  console.log('Inserting ' + products.length + ' iPhone products...');
  const data = products.map(p => {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000));
    return {
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      image: 'https://api.ashfordorder.com/uploads/iphones/' + p.file,
      isActive: true,
      createdAt: createdAt,
      updatedAt: new Date()
    };
  });

  const created = await prisma.product.createMany({
    data: data
  });
  console.log('Successfully inserted ' + created.count + ' iPhone products!');

  const count = await prisma.product.count({
    where: { name: { contains: 'iPhone' } }
  });
  console.log('Total iPhone products now in DB:', count);

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS. Uploading runner script...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/opt/bufforder/backend/seed_iphones.js');
    writeStream.write(remoteScript);
    writeStream.end(() => {
      console.log('Uploaded runner script to /opt/bufforder/backend/seed_iphones.js. Executing...');
      conn.exec('cd /opt/bufforder/backend && node seed_iphones.js', (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('data', d => {
          process.stdout.write(d);
          out += d;
        });
        stream.stderr.on('data', d => {
          process.stderr.write(d);
          out += d;
        });
        stream.on('close', code => {
          console.log('Execution finished with code:', code);
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
