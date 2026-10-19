const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  const query = `
    SELECT t.id as threadId, t.userId, u.fullName, u.phoneNumber, t.lastMessageText, t.lastMessageAt,
           (SELECT count(*) FROM chatmessage WHERE threadId = t.id) as totalMsg,
           (SELECT count(*) FROM chatmessage WHERE threadId = t.id AND isDeletedForUser = 1) as deletedForUser
    FROM chatthread t
    JOIN user u ON t.userId = u.id
    ORDER BY t.lastMessageAt DESC LIMIT 10;
  `;
  c.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('THREADS:');
      console.log(out);

      // Check messages of the latest thread
      const qMsg = `SELECT id, threadId, senderType, text, isDeletedForUser, createdAt FROM chatmessage ORDER BY createdAt DESC LIMIT 20;`;
      c.exec(`mysql -u root -p0904521297t greeting_message -e "${qMsg}"`, (err2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d);
        s2.on('close', () => {
          console.log('\nLATEST MESSAGES:');
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
