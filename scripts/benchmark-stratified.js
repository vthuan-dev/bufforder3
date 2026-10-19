const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const vpsCode = `
    const { PrismaClient } = require('/opt/bufforder/backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();

    async function benchmark() {
      console.time('fetch_all_in_range');
      const prods = await prisma.product.findMany({
        where: { isActive: true, price: { gte: 582, lte: 788 } },
        select: { id: true, name: true, brand: true, category: true, price: true, image: true }
      });
      console.timeEnd('fetch_all_in_range');
      console.log('Total products in range:', prods.length);

      // Group by category
      const byCategory = {};
      for (const p of prods) {
        const cat = p.category || 'Khác';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      }

      console.log('Categories found:', Object.keys(byCategory));
      for (const [cat, list] of Object.entries(byCategory)) {
        console.log('  ' + cat + ': ' + list.length + ' items');
      }

      // Stratified round-robin sample up to 100 items
      const sampled = [];
      const cats = Object.keys(byCategory);
      // Shuffle items within each category first
      cats.forEach(c => {
        for (let i = byCategory[c].length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [byCategory[c][i], byCategory[c][j]] = [byCategory[c][j], byCategory[c][i]];
        }
      });

      let added = true;
      let round = 0;
      while (sampled.length < 100 && added) {
        added = false;
        // Shuffle category order per round for fairness
        const shuffledCats = [...cats].sort(() => Math.random() - 0.5);
        for (const cat of shuffledCats) {
          if (byCategory[cat] && byCategory[cat].length > round) {
            sampled.push(byCategory[cat][round]);
            added = true;
            if (sampled.length >= 100) break;
          }
        }
        round++;
      }

      console.log('\\nSampled 100 items category distribution:');
      const sampleCount = {};
      sampled.forEach(p => sampleCount[p.category] = (sampleCount[p.category] || 0) + 1);
      for (const [cat, cnt] of Object.entries(sampleCount)) {
        console.log('  ' + cat + ': ' + cnt + '%');
      }

      await prisma.$disconnect();
    }
    benchmark();
  `;
  conn.exec('node', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
    stream.write(vpsCode);
    stream.end();
  });
}).connect({ host: '223.130.11.200', port: 22, username: 'root', password: '0904521297t' });
