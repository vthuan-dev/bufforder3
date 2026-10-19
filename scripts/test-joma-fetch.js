const https = require('https');

async function testJoma() {
  const url = 'https://www.jomashop.com/watches.html';
  console.log('Fetching', url);
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status code:', res.statusCode);
      console.log('Data length:', data.length);
      
      // Look for product JSON-LD or Next data
      const jsonLdMatches = data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        console.log('JSON-LD blocks found:', jsonLdMatches.length);
        jsonLdMatches.forEach((block, idx) => {
          const content = block.replace(/<\/?script.*?>/gi, '').trim();
          try {
            const parsed = JSON.parse(content);
            console.log(`Block ${idx} type:`, parsed['@type'] || (Array.isArray(parsed) ? 'Array' : typeof parsed));
            if (parsed.itemListElement) {
              console.log('Item count in list:', parsed.itemListElement.length);
              console.log('First item sample:', JSON.stringify(parsed.itemListElement[0], null, 2));
            }
          } catch (e) {
            // console.log(`Block ${idx} parse error`);
          }
        });
      }
    });
  }).on('error', err => console.error(err));
}

testJoma();
