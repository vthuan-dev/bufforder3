const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ProductBot/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:IPhone_16&gcmlimit=25&prop=imageinfo&iiprop=url&format=json';
  const data = await fetchJson(url);
  if (data && data.query && data.query.pages) {
    for (const id in data.query.pages) {
      const p = data.query.pages[id];
      if (p.imageinfo && p.imageinfo[0]) {
        console.log(p.title, '-->', p.imageinfo[0].url);
      }
    }
  } else {
    console.log('No data:', data);
  }
}

run();
