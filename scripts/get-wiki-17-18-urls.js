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

const titles = [
  'File:Mist Blue iPhone 17.jpg',
  'File:White iPhone 17.jpg',
  'File:Sage iPhone 17.jpg',
  'File:Black iPhone 17.jpg',
  'File:Lavender iPhone 17.jpg',
  'File:IPhone 17, Air, 17 Pro, and Pro max.jpg',
  'File:Silver iPhone 17 Pro Max.jpg',
  'File:Cosmic Orange iPhone 17 Pro Max.jpg',
  'File:Deep Blue iPhone 17 Pro Max.jpg',
  'File:IPhone 18 Pro black rear.jpg',
  'File:IPhone 18 Pro rear.jpg',
  'File:IPhone 18 Pro Max black rear.jpg',
  'File:IPhone 18 Pro Max rear.jpg'
];

async function run() {
  for (const t of titles) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetchJson(url);
    if (res && res.query && res.query.pages) {
      for (const id in res.query.pages) {
        const p = res.query.pages[id];
        if (p.imageinfo && p.imageinfo[0]) {
          console.log(`"${t.replace('File:', '')}": "${p.imageinfo[0].url}",`);
        }
      }
    }
  }
}

run();
