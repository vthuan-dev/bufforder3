const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const vpsScript = `
    const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
    const http = require('http');
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
    // User Nguyen Hoang Nam (9893422747) with target price 685.19
    const token = jwt.sign({ userId: 'cmuebbtra068dl65kvlfi1nvo', phoneNumber: '9893422747' }, secret);

    // Test simulated target price 1050
    http.get('http://localhost:5000/api/products', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Success:', json.success);
          console.log('Total products returned:', json.data.length);

          const catCount = {};
          json.data.forEach(p => {
            const cat = p.category || 'Khác';
            catCount[cat] = (catCount[cat] || 0) + 1;
          });

          console.log('\\n--- CATEGORY DISTRIBUTION IN RETURNED POOL ---');
          for (const [cat, cnt] of Object.entries(catCount)) {
            const pct = ((cnt / json.data.length) * 100).toFixed(1);
            console.log('  ' + cat + ': ' + cnt + ' (' + pct + '%)');
          }

          console.log('\\n--- SIMULATING 15 CONSECUTIVE ORDER PICKS (LRU ALGORITHM) ---');
          // Simulate the frontend LRU rotation logic
          let recentCategories = [];
          const products = json.data;
          
          for (let orderNum = 1; orderNum <= 15; orderNum++) {
            // Group by category
            const poolByCategory = new Map();
            for (const p of products) {
              const cat = p.category || 'Khác';
              if (!poolByCategory.has(cat)) poolByCategory.set(cat, []);
              poolByCategory.get(cat).push(p);
            }

            const availableCats = Array.from(poolByCategory.keys());
            const unusedCats = availableCats.filter(c => !recentCategories.includes(c));

            let chosenCat;
            if (unusedCats.length > 0) {
              chosenCat = unusedCats[Math.floor(Math.random() * unusedCats.length)];
            } else {
              const sortedByLRU = [...availableCats].sort((a, b) => {
                return recentCategories.indexOf(a) - recentCategories.indexOf(b);
              });
              chosenCat = sortedByLRU[0];
            }

            const catList = poolByCategory.get(chosenCat);
            const picked = catList[Math.floor(Math.random() * catList.length)];
            recentCategories = [...recentCategories.slice(-4), chosenCat];

            console.log('  Order #' + String(orderNum).padStart(2, '0') + ': [' + chosenCat + '] ' + picked.brand + ' - ' + picked.name.substring(0, 35) + ' ($' + picked.price + ')');
          }

        } catch (e) {
          console.log('Error parsing response:', e.message, data);
        }
        process.exit(0);
      });
    });
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
