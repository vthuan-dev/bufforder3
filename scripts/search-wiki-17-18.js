const https = require('https');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ProductBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function searchWiki(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15&format=json`;
  const res = await fetchJson(url);
  console.log(`Results for ${query}:`);
  if (res && res.query && res.query.search) {
    res.query.search.forEach(s => console.log(' - ', s.title));
  } else {
    console.log('None found');
  }
}

async function run() {
  await searchWiki('iPhone 17');
  await searchWiki('iPhone 18');
}

run();
