const luxuryMapping = {
  // Watches (11 items)
  2101: { name: "Rolex Submariner Date 41mm Steel", url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" },
  2102: { name: "Patek Philippe Calatrava 5227G White Gold", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80" },
  2103: { name: "Audemars Piguet Royal Oak 41mm Steel", url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80" },
  2104: { name: "IWC Portugieser Automatic 40mm", url: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80" },
  2105: { name: "Vacheron Constantin Overseas", url: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80" },
  2106: { name: "A. Lange & Söhne Lange 1", url: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80" },
  2107: { name: "Jaeger-LeCoultre Reverso Grande", url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80" },
  2108: { name: "Blancpain Fifty Fathoms", url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80" },
  2109: { name: "Girard-Perregaux Laureato", url: "https://images.unsplash.com/photo-1526045478516-99145907023c?w=800&q=80" },
  2110: { name: "Ulysse Nardin Marine Chronometer", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80" },
  2147: { name: "Rolex Daytona Vintage 1970s", url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" },

  // Handbags (5 items)
  2111: { name: "Hermès Birkin 30 Togo Leather", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80" },
  2112: { name: "Hermès Kelly 32 Epsom Leather", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80" },
  2113: { name: "Chanel Grand Shopping Tote Caviar", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80" },
  2114: { name: "Louis Vuitton Capucines MM", url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80" },
  2148: { name: "Hermès Vintage Kelly Bag 1960s", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80" },

  // Jewelry (6 items)
  2115: { name: "Tiffany & Co. Soleste Diamond Ring 1.5ct", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80" },
  2116: { name: "Harry Winston Diamond Stud Earrings 2ct", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" },
  2117: { name: "Cartier Juste un Clou Diamond Bracelet", url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80" },
  2118: { name: "Van Cleef & Arpels Vintage Alhambra Long Necklace", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" },
  2119: { name: "Buccellati Macri Cuff Bracelet", url: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80" },
  2120: { name: "Graff Diamond Pendant Necklace", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" },

  // Audio & Electronics (8 items)
  2121: { name: "Bowers & Wilkins 800 D4 Diamond Speakers", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" },
  2122: { name: "McIntosh MC462 Stereo Power Amplifier", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
  2123: { name: "Mark Levinson No.5805 Integrated Amplifier", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
  2124: { name: "Wilson Audio Sasha DAW Speakers", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" },
  2125: { name: "Focal Sopra No2 Floor Standing Speakers", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" },
  2126: { name: "Naim Statement NAP S1 Power Amplifier", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
  2127: { name: "Burmester 911 MK3 Power Amplifier", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
  2128: { name: "Meridian DSP8000 SE Digital Active Speakers", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" },

  // Camera & Lenses (6 items)
  2129: { name: "Leica M11 Rangefinder Digital Camera", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" },
  2130: { name: "Hasselblad X2D 100C Medium Format", url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80" },
  2131: { name: "Phase One XF IQ4 150MP Camera System", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" },
  2132: { name: "Canon EF 400mm f/2.8L IS III USM Lens", url: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80" },
  2133: { name: "Nikon AF-S 600mm f/4E FL ED VR Lens", url: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80" },
  2134: { name: "Sony FE 400mm f/2.8 GM OSS Lens", url: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80" },

  // Luxury Appliances (4 items)
  2135: { name: "Sub-Zero PRO 48 Built-In Refrigerator", url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80" },
  2136: { name: "Wolf 60 Dual Fuel Range", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80" },
  2137: { name: "Miele Complete C3 Brilliant Vacuum", url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80" },
  2138: { name: "La Cornue Château 150 Range", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80" },

  // Furniture (4 items)
  2139: { name: "Herman Miller Eames Lounge Chair & Ottoman", url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80" },
  2140: { name: "Knoll Barcelona Couch", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80" },
  2141: { name: "B&B Italia Charles Sofa", url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80" },
  2142: { name: "Cassina LC4 Chaise Lounge", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80" },

  // Musical Instruments (4 items)
  2143: { name: "Steinway & Sons Model M Grand Piano", url: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80" },
  2144: { name: "Yamaha CFX Concert Grand Piano", url: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80" },
  2145: { name: "Gibson Custom Shop 1959 Les Paul", url: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80" },
  2146: { name: "Fender Custom Shop Stratocaster", url: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&q=80" }
};

async function testAll() {
  console.log('🧪 Testing all 48 luxury mapping images...');
  const entries = Object.entries(luxuryMapping);
  let passed = 0;
  let failed = 0;

  for (const [id, item] of entries) {
    try {
      const res = await fetch(item.url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok && (res.headers.get('content-type') || '').includes('image')) {
        passed++;
      } else {
        console.error(`❌ [${id}] ${item.name} FAILED: ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`❌ [${id}] ${item.name} ERROR: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Verification result: ${passed} PASSED / ${failed} FAILED out of ${entries.length}`);
}

testAll().catch(console.error);
module.exports = luxuryMapping;
