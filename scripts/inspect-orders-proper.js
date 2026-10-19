const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  const qOrders = "SELECT id, userId, orderNumber, productName, productPrice, status, orderDate, createdAt FROM \\`order\\` WHERE status = 'suspended' OR productPrice >= 50000 ORDER BY id DESC LIMIT 10;";
  c.exec(`mysql -u root -p0904521297t greeting_message -e "${qOrders}"`, (err, s) => {
    let out = '';
    s.on('data', d => out += d);
    s.on('close', () => {
      console.log('SUSPENDED / EXPENSIVE ORDERS:');
      console.log(out);

      const qRecent = "SELECT id, userId, orderNumber, productName, productPrice, status, orderDate, createdAt FROM \\`order\\` WHERE userId = 'cmueb8xkx0686l65kj1aoya0j' ORDER BY id DESC LIMIT 10;";
      c.exec(`mysql -u root -p0904521297t greeting_message -e "${qRecent}"`, (err2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d);
        s2.on('close', () => {
          console.log('USER cmueb8xkx0686l65kj1aoya0j ORDERS:');
          console.log(out2);
          c.end();
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
