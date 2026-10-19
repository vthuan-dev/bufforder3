const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const q = `SELECT id, fullName, phoneNumber, balance, freezeBalance, dailyEarnings, commissionConfig FROM user WHERE phoneNumber = '9893422747'`;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${q}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('USER DETAILS:');
      console.log(out);

      // Also check orders today for this user
      const qOrders = "SELECT id, productName, productPrice, status, orderDate, createdAt FROM \\`order\\` WHERE userId = 'cmuebbtra068dl65kvlfi1nvo' ORDER BY id DESC LIMIT 5";
      conn.exec(`mysql -u root -p0904521297t greeting_message -e "${qOrders}"`, (err2, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('close', () => {
          console.log('\nRECENT ORDERS:');
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
