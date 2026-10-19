const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  const qUsers = `SELECT id, phoneNumber, fullName, balance, freezeBalance, isFrozen, frozenReason, frozenAt, unfrozenAt, dailyEarnings, commissionConfig FROM user WHERE phoneNumber LIKE '%9893422%';`;
  c.exec(`mysql -u root -p0904521297t greeting_message -e "${qUsers}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('USERS:');
      console.log(out);

      const qOrders = `SELECT id, userId, orderNumber, productName, productPrice, status, orderDate, createdAt FROM \`order\` WHERE status = 'suspended' OR productPrice >= 50000 ORDER BY id DESC LIMIT 10;`;
      c.exec(`mysql -u root -p0904521297t greeting_message -e "${qOrders}"`, (err2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d);
        s2.on('close', () => {
          console.log('\nSUSPENDED / EXPENSIVE ORDERS:');
          console.log(out2);

          const qRecentOrders = `SELECT id, userId, orderNumber, productName, productPrice, status, orderDate, createdAt FROM \`order\` ORDER BY id DESC LIMIT 10;`;
          c.exec(`mysql -u root -p0904521297t greeting_message -e "${qRecentOrders}"`, (err3, s3) => {
            let out3 = '';
            s3.on('data', d => out3 += d);
            s3.on('close', () => {
              console.log('\nMOST RECENT ORDERS:');
              console.log(out3);
              c.end();
            });
          });
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
