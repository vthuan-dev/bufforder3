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

async function run() {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=iPhone+18+Pro&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetchJson(url);
  if (res && res.query && res.query.pages) {
    for (const k in res.query.pages) {
      const p = res.query.pages[k];
      if (p.imageinfo && p.imageinfo[0]) {
        console.log(p.title, '-->', p.imageinfo[0].url);
      }
    }
  }
}

run();
