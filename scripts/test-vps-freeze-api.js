const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const vpsScript = `
    const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
    const http = require('http');
    const prisma = require('/opt/bufforder/backend/lib/prisma');

    async function run() {
      try {
        const user = await prisma.user.findFirst({ where: { phoneNumber: '9893422747' } });
        if (!user) {
          console.log('User not found');
          process.exit(1);
        }
        
        const env = require('/opt/bufforder/backend/node_modules/dotenv').config({ path: '/opt/bufforder/backend/.env' });
        const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
        const token = jwt.sign({ userId: user.id }, secret);

        // 1. Test /api/orders/stats
        http.get('http://localhost:5000/api/orders/stats', {
          headers: { 'Authorization': 'Bearer ' + token }
        }, (res1) => {
          let d1 = '';
          res1.on('data', c => d1 += c);
          res1.on('end', () => {
            const stats = JSON.parse(d1);
            console.log('=== STATS API ===');
            console.log('ordersGrabbed:', stats.data?.ordersGrabbed);
            console.log('balance:', stats.data?.balance);
            console.log('freezeThreshold:', stats.data?.freezeThreshold);
            console.log('freezeTargetProductId:', stats.data?.freezeTargetProductId);

            // 2. Test /api/products
            http.get('http://localhost:5000/api/products', {
              headers: { 'Authorization': 'Bearer ' + token }
            }, (res2) => {
              let d2 = '';
              res2.on('data', c => d2 += c);
              res2.on('end', () => {
                const prod = JSON.parse(d2);
                console.log('\\n=== PRODUCTS API ===');
                console.log('Total products returned:', prod.data?.length);
                const target = prod.data?.find(p => p.id === 2118);
                console.log('Product 2118 (Van Cleef) included?', target ? ('YES -> ' + target.name + ' ($' + target.price + ')') : 'NO');
                const expensive = prod.data?.filter(p => p.price > (stats.data?.balance || 5199));
                console.log('Total expensive products (> balance) returned:', expensive?.length);
                process.exit(0);
              });
            });
          });
        });
      } catch (e) {
        console.error('Error:', e);
        process.exit(1);
      }
    }
    run();
  `;

  conn.exec(`node -e "${vpsScript.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
