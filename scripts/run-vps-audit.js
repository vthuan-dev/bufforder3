const { Client } = require('ssh2');
const fs = require('fs');

const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  console.log('1. Querying active products from DB...');
  const prods = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, price: true, image: true, brand: true }
  });
  console.log('Total active products:', prods.length);

  const urlMap = new Map();
  for (const p of prods) {
    if (!p.image) continue;
    const url = p.image.trim();
    if (!urlMap.has(url)) urlMap.set(url, []);
    urlMap.get(url).push(p);
  }

  const urls = Array.from(urlMap.keys());
  console.log('Total unique URLs to test:', urls.length);

  const broken = [];
  const BATCH_SIZE = 40;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) {
          broken.push({ url, status: res.status, count: urlMap.get(url).length, sample: urlMap.get(url)[0] });
        }
      } catch (err) {
        broken.push({ url, error: err.message, count: urlMap.get(url).length, sample: urlMap.get(url)[0] });
      }
    }));

    if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= urls.length) {
      console.log('Tested ' + Math.min(i + BATCH_SIZE, urls.length) + '/' + urls.length + ' - broken found: ' + broken.length);
    }
  }

  console.log('DONE. Total broken URLs:', broken.length);
  fs.writeFileSync('/opt/bufforder/backend/broken_images.json', JSON.stringify(broken, null, 2));
  console.log('Saved to /opt/bufforder/backend/broken_images.json');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Writing audit script to VPS...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/opt/bufforder/backend/audit-images.js');
    writeStream.write(scriptContent);
    writeStream.end(() => {
      console.log('Script written to VPS. Running audit...');
      conn.exec('node /opt/bufforder/backend/audit-images.js', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d));
        stream.stderr.on('data', d => process.stderr.write(d));
        stream.on('close', code => {
          console.log('\\nAudit script finished with exit code:', code);
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
