const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const vpsScript = `
    const config = require('/opt/bufforder/backend/config');
    const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
    const http = require('http');
    const { PrismaClient } = require('/opt/bufforder/backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();
    const secret = config.JWT_SECRET;

    async function test() {
      // Find a user without targetProductPrice or create mock token
      const user = await prisma.user.findFirst({
        where: { NOT: { phoneNumber: '9893422747' } },
        select: { id: true, phoneNumber: true }
      });
      const token = jwt.sign({ userId: user.id, phoneNumber: user.phoneNumber }, secret);

      http.get('http://localhost:5000/api/products', {
        headers: { 'Authorization': 'Bearer ' + token }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (!json.data) {
              console.log('Response JSON:', json);
              prisma.$disconnect();
              process.exit(0);
            }
            console.log('User:', user.phoneNumber, 'Total returned:', json.data.length);
            const catCount = {};
            json.data.forEach(p => {
              const cat = p.category || 'Khác';
              catCount[cat] = (catCount[cat] || 0) + 1;
            });
            console.log('Category breakdown for general user:');
            for (const [cat, cnt] of Object.entries(catCount)) {
              console.log('  ' + cat + ': ' + cnt);
            }
          } catch(e) {
            console.log(e.message);
          }
          prisma.$disconnect();
          process.exit(0);
        });
      });
    }
    test();
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
    stream.write(vpsScript);
    stream.end();
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
