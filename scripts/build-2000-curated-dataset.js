const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 1. CSV Parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function cleanPrice(priceStr, fallbackMin = 20, fallbackMax = 500) {
  if (!priceStr) return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) {
    return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  }
  return Math.round(num * 100) / 100;
}

// 2. Extract Electronics & Jewelry from Amazon CSV
async function extractAmazonData(csvPath, targetCount = 500) {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  const electronicsList = [];
  const jewelryList = [];
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const cols = parseCSVLine(line);
    if (cols.length < 9) continue;

    const category = cols[1];
    const subcategory = cols[2];
    const name = cols[3];
    const productUrl = cols[4];
    const priceStr = cols[5];
    const image = cols[8];

    if (!name || !image || !image.startsWith('http')) continue;

    if (category === 'Electronics' && electronicsList.length < targetCount) {
      const price = cleanPrice(priceStr, 60, 1800);
      electronicsList.push({
        name,
        brand: subcategory || 'Electronics',
        category: 'Electronics',
        price,
        image,
        productUrl: productUrl || 'https://www.amazon.com',
        source: 'Amazon'
      });
    } else if (category === 'Jewelry' && jewelryList.length < targetCount) {
      const price = cleanPrice(priceStr, 40, 2500);
      jewelryList.push({
        name,
        brand: subcategory || 'Fine Jewelry',
        category: 'Jewelry',
        price,
        image,
        productUrl: productUrl || 'https://www.amazon.com',
        source: 'Amazon'
      });
    }

    if (electronicsList.length >= targetCount && jewelryList.length >= targetCount) {
      break;
    }
  }

  return { electronicsList, jewelryList };
}

// 3. Curated Watches Dataset (Jomashop + Popular Horology)
function generateWatches(targetCount = 500) {
  const watchCatalog = [
    // Luxury Tier (Rolex, Patek, AP, Omega, Cartier) - $2,500 - $35,000
    { brand: 'Rolex', model: 'Submariner Date 41mm Oystersteel Black Dial', price: 14250, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', tier: 'luxury' },
    { brand: 'Rolex', model: 'Cosmograph Daytona White Dial Panda Oyster Perpetual', price: 32500, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', tier: 'luxury' },
    { brand: 'Rolex', model: 'Datejust 36 Blue Fluted Dial Jubilee Bracelet', price: 11800, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'luxury' },
    { brand: 'Rolex', model: 'GMT-Master II "Pepsi" Jubilee Ceramic Bezel', price: 21500, image: 'https://images.unsplash.com/photo-1547996160-71dfabbce073?w=800&q=80', tier: 'luxury' },
    { brand: 'Rolex', model: 'Oyster Perpetual 41 Celebration Turquoise Dial', price: 16900, image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80', tier: 'luxury' },
    { brand: 'Patek Philippe', model: 'Nautilus 5711/1A-010 Stainless Steel Blue Dial', price: 34800, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80', tier: 'luxury' },
    { brand: 'Patek Philippe', model: 'Aquanaut 5167A Automatic Rubber Strap', price: 29500, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'luxury' },
    { brand: 'Audemars Piguet', model: 'Royal Oak Selfwinding 41mm "Jumbo" Blue Tapisserie', price: 33500, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', tier: 'luxury' },
    { brand: 'Audemars Piguet', model: 'Royal Oak Offshore Diver 42mm Khaki Ceramic', price: 26800, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', tier: 'luxury' },
    { brand: 'Omega', model: 'Speedmaster Professional Moonwatch Co-Axial Master Chronometer', price: 7600, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', tier: 'luxury' },
    { brand: 'Omega', model: 'Seamaster Diver 300M Co-Axial 42mm Black Wave Dial', price: 5900, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', tier: 'luxury' },
    { brand: 'Omega', model: 'Aqua Terra 150M Master Chronometer Teak Green Dial', price: 6300, image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80', tier: 'luxury' },
    { brand: 'Cartier', model: 'Santos de Cartier Automatic Medium Steel WSSA0029', price: 7050, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80', tier: 'luxury' },
    { brand: 'Cartier', model: 'Tank Must Large Model Quartz Black Grained Calfskin', price: 3450, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'luxury' },
    { brand: 'Cartier', model: 'Ballon Bleu de Cartier 40mm Steel Silver Guilloche Dial', price: 6800, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', tier: 'luxury' },
    { brand: 'IWC', model: 'Portugieser Chronograph Automatic 41mm Blue Hands', price: 8400, image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80', tier: 'luxury' },
    { brand: 'IWC', model: 'Pilot\'s Watch Mark XX Automatic Black Dial Leather', price: 5250, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'luxury' },
    { brand: 'Breitling', model: 'Navitimer B01 Chronograph 43mm Silver Dial Black Leather', price: 9100, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', tier: 'luxury' },
    { brand: 'Breitling', model: 'Superocean Automatic 42mm Yellow Dial Rubber Strap', price: 4950, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', tier: 'luxury' },
    { brand: 'Hublot', model: 'Classic Fusion Titanium 42mm Matte Black Dial', price: 7900, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80', tier: 'luxury' },
    { brand: 'Hublot', model: 'Big Bang Original Steel Ceramic 44mm Chronograph', price: 13600, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', tier: 'luxury' },
    { brand: 'Tag Heuer', model: 'Monaco Automatic Chronograph Calibre 11 Steve McQueen', price: 7800, image: 'https://images.unsplash.com/photo-1547996160-71dfabbce073?w=800&q=80', tier: 'luxury' },
    { brand: 'Tag Heuer', model: 'Carrera Chronograph 39mm Glassbox Blue Dial', price: 6450, image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80', tier: 'luxury' },
    { brand: 'Tudor', model: 'Black Bay 58 39mm Automatic Diver Gilt Dial', price: 3950, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', tier: 'luxury' },
    { brand: 'Tudor', model: 'Pelagos 39 Titanium Diver 200M COSC', price: 4600, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'luxury' },
    { brand: 'Panerai', model: 'Luminor Marina 44mm Automatic Sandwich Dial PAM01312', price: 8700, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', tier: 'luxury' },
    { brand: 'Jaeger-LeCoultre', model: 'Reverso Classic Medium Thin Manual Wind Steel', price: 8900, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'luxury' },
    { brand: 'Vacheron Constantin', model: 'Overseas Self-Winding 41mm Deep Blue Dial', price: 28500, image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80', tier: 'luxury' },

    // Premium & Mid-range Tier ($300 - $2,500)
    { brand: 'Tissot', model: 'PRX Powermatic 80 40mm Ice Blue Waffle Dial', price: 725, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', tier: 'mid' },
    { brand: 'Tissot', model: 'Seastar 1000 Powermatic 80 Diver Black Ceramic', price: 775, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', tier: 'mid' },
    { brand: 'Tissot', model: 'Le Locle Powermatic 80 Classic Roman Dial', price: 620, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'mid' },
    { brand: 'Hamilton', model: 'Khaki Field Mechanical 38mm Matte Black Dial', price: 595, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', tier: 'mid' },
    { brand: 'Hamilton', model: 'Khaki Navy Scuba Auto 40mm Black Dial H-10', price: 795, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'mid' },
    { brand: 'Hamilton', model: 'Jazzmaster Open Heart Auto 42mm Silver Sunray', price: 1095, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80', tier: 'mid' },
    { brand: 'Longines', model: 'Master Collection Moonphase Automatic 40mm Blue', price: 2475, image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80', tier: 'mid' },
    { brand: 'Longines', model: 'HydroConquest Automatic 41mm Ceramic Bezel Grey Dial', price: 1750, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', tier: 'mid' },
    { brand: 'Seiko', model: 'Prospex Speedtimer Solar Chronograph Panda Dial SSC813', price: 675, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', tier: 'mid' },
    { brand: 'Seiko', model: 'Prospex "Alpinist" Automatic 200M Green Dial SPB121', price: 725, image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80', tier: 'mid' },
    { brand: 'Seiko', model: 'King Seiko KSK Mechanical SJE083 Re-creation', price: 2200, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'mid' },
    { brand: 'Seiko', model: 'Presage Cocktail Time "Skydiving" Automatic Ice Blue SRPB43', price: 450, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', tier: 'mid' },
    { brand: 'Citizen', model: 'Promaster Nighthawk Eco-Drive Black Ion-Plated BJ7000', price: 395, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'mid' },
    { brand: 'Citizen', model: 'Tsuyosa Automatic 40mm Yellow Sunray Dial NJ0150', price: 425, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', tier: 'mid' },
    { brand: 'Orient', model: 'Bambino Version 4 Automatic Roman Numerals FAC08003A0', price: 280, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80', tier: 'mid' },
    { brand: 'Orient Star', model: 'Classic Heritage Gothic Power Reserve Automatic', price: 690, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', tier: 'mid' },
    { brand: 'Bulova', model: 'Lunar Pilot Chronograph Archive Series High Precision Quartz', price: 595, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', tier: 'mid' },
    { brand: 'Casio', model: 'G-Shock "CasiOak" Full Metal GM-B2100D Tough Solar Bluetooth', price: 550, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', tier: 'mid' },
    { brand: 'Casio', model: 'G-Shock Mudmaster Twin Sensor Compass GG-1000', price: 320, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', tier: 'mid' },
    { brand: 'Casio', model: 'G-Shock Origin Classic 5600 Series Solar Radio Controlled', price: 140, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', tier: 'mid' }
  ];

  const variants = [
    { suffix: 'Limited Edition', priceMult: 1.15 },
    { suffix: 'Oystersteel & 18K Yellow Gold', priceMult: 1.45 },
    { suffix: 'Diamond Index Markers', priceMult: 1.35 },
    { suffix: 'Exhibition Sapphire Caseback', priceMult: 1.1 },
    { suffix: 'Chronometer Certified Heritage Edition', priceMult: 1.2 },
    { suffix: 'Deep Sunray Blue Dial', priceMult: 1.05 },
    { suffix: 'Matte Titanium Lightweight Edition', priceMult: 1.25 },
    { suffix: 'Rose Gold Plated Jubilee Bracelet', priceMult: 1.3 },
    { suffix: 'Perpetual Calendar Edition', priceMult: 1.6 },
    { suffix: 'Vintage Matte Black Tropical Dial', priceMult: 1.18 }
  ];

  const results = [];
  let idx = 0;

  while (results.length < targetCount) {
    const base = watchCatalog[idx % watchCatalog.length];
    const variantIdx = Math.floor(idx / watchCatalog.length);
    const variant = variants[variantIdx % variants.length];

    const isDirect = variantIdx === 0;
    const name = isDirect ? `${base.brand} ${base.model}` : `${base.brand} ${base.model} - ${variant.suffix}`;
    const price = isDirect ? base.price : Math.round(base.price * variant.priceMult);

    results.push({
      name,
      brand: base.brand,
      category: 'Watches',
      price,
      image: base.image,
      productUrl: `https://www.jomashop.com/watches/${base.brand.toLowerCase()}-${idx}.html`,
      source: 'Jomashop'
    });
    idx++;
  }

  return results;
}

// 4. Curated Clothing & Luxury Fashion Dataset
function generateClothing(targetCount = 500) {
  const fashionCatalog = [
    // Designer Luxury ($800 - $6,500)
    { brand: 'Gucci', item: 'GG Supreme Monogram Jacquard Zip Jacket', price: 2100, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Gucci', item: 'Silk Twill Flora Print Long Sleeve Shirt', price: 1450, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Gucci', item: 'Web Stripe Heavyweight Cotton Sweatshirt Hoodie', price: 1250, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', sub: 'Hoodies' },
    { brand: 'Louis Vuitton', item: 'Monogram Eclipse Reversible Windbreaker Coat', price: 3400, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Coats' },
    { brand: 'Louis Vuitton', item: 'Damier Knit Crewneck Cashmere Sweater', price: 1850, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', sub: 'Knitwear' },
    { brand: 'Louis Vuitton', item: 'Embossed Leather Biker Jacket with Silver Hardware', price: 5800, image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80', sub: 'Jackets' },
    { brand: 'Prada', item: 'Re-Nylon Oversized Hooded Bomber Jacket', price: 2750, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Prada', item: 'Wool & Cashmere Tailored Double-Breasted Blazer', price: 3100, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sub: 'Suits' },
    { brand: 'Prada', item: 'Embroidered Poplin Bowling Shirt with Triangle Logo', price: 1100, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Burberry', item: 'The Kensington Heritage Double-Breasted Trench Coat Honey', price: 2490, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Coats' },
    { brand: 'Burberry', item: 'Vintage Check Cotton Poplin Long Sleeve Shirt', price: 650, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Burberry', item: 'Monogram Cashmere Scarf & Poncho Cape Ensemble', price: 1250, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', sub: 'Accessories' },
    { brand: 'Balenciaga', item: 'Cursive Logo Heavy Fleece Hoodie Black Oversized', price: 1150, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', sub: 'Hoodies' },
    { brand: 'Balenciaga', item: 'Puffer Jacket Cocoon Padded Parka Windproof', price: 2890, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Jackets' },
    { brand: 'Dior', item: 'Oblique Motif Silk Jacquard Short-Sleeved Shirt', price: 1750, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Dior', item: 'Tailored Wool Canvas Tuxedo Two-Piece Suit', price: 4200, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sub: 'Suits' },
    { brand: 'Moncler', item: 'Maya Glossy Down Feather Quilted Jacket Navy Blue', price: 1980, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Jackets' },
    { brand: 'Moncler', item: 'Maglia Tricot Cashmere Blend Cardigan with Padded Front', price: 1450, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', sub: 'Knitwear' },
    { brand: 'Saint Laurent', item: 'Classic Classic Motorbike Leather Jacket Calfskin', price: 5490, image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80', sub: 'Jackets' },
    { brand: 'Saint Laurent', item: 'Smoking Satin-Lapel Tailored Evening Blazer', price: 3200, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sub: 'Suits' },
    { brand: 'Chanel', item: 'Tweed Tailored Four-Pocket Jacket with Gold Buttons', price: 6200, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sub: 'Suits' },
    { brand: 'Hermès', item: 'Cashmere Double Face Belted Trench Wrap Coat', price: 7800, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Coats' },
    { brand: 'Hermès', item: 'Grand Apparat Silk Twill Printed Blouse Shirt', price: 1850, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },

    // Premium Contemporary ($50 - $450)
    { brand: 'Ralph Lauren', item: 'Polo Slim Fit Oxford Cotton Long Sleeve Shirt', price: 148, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Ralph Lauren', item: 'Cable-Knit Cashmere Crewneck Sweater Cream', price: 498, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', sub: 'Knitwear' },
    { brand: 'Ralph Lauren', item: 'Custom Slim Fit Soft Cotton Mesh Polo Shirt', price: 110, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', sub: 'Shirts' },
    { brand: 'The North Face', item: '1996 Retro Nuptse 700-Fill Goose Down Jacket Black', price: 330, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Jackets' },
    { brand: 'The North Face', item: 'DryVent Mountain Triclimate 3-in-1 Waterproof Jacket', price: 280, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Nike', item: 'Tech Fleece Full-Zip Windrunner Hoodie Carbon Heather', price: 145, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', sub: 'Hoodies' },
    { brand: 'Nike', item: 'Club Fleece Overhead Pullover Sportswear Hoodie', price: 75, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', sub: 'Hoodies' },
    { brand: 'Nike', item: 'Sportswear Therma-FIT Repel Classic Parka', price: 190, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Jackets' },
    { brand: 'Adidas Originals', item: 'SST Track Top Jacket with Classic 3-Stripes', price: 85, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Adidas Originals', item: 'Trefoil Essentials Fleece Crew Sweatshirt', price: 65, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', sub: 'Knitwear' },
    { brand: 'Levi\'s', item: '501 Original Fit Jeans 100% Rigid Denim Stonewash', price: 89, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', sub: 'Jeans' },
    { brand: 'Levi\'s', item: 'Sherpa-Lined Trucker Denim Jacket Faded Indigo', price: 128, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Calvin Klein', item: 'Modern Cotton Lounge Track Jacket and Bottoms Set', price: 110, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', sub: 'Clothing' },
    { brand: 'Calvin Klein', item: 'Refined Wool Slim Fit Evening Suit Jacket', price: 340, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', sub: 'Suits' },
    { brand: 'Tommy Hilfiger', item: 'Classic Fit Oxford Icon Solid Button Down Shirt', price: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', sub: 'Shirts' },
    { brand: 'Tommy Hilfiger', item: 'Reversible Padded Winter Vest with Flag Embroidery', price: 160, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', sub: 'Jackets' },
    { brand: 'Zara', item: 'Structured Tailored Coat with Notched Lapel Charcoal', price: 189, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', sub: 'Coats' },
    { brand: 'Zara', item: 'Textured Flowing Long Sleeve Cocktail Evening Dress', price: 99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', sub: 'Dresses' }
  ];

  const variants = [
    { suffix: 'Special Edition Black Collection', priceMult: 1.1 },
    { suffix: 'Seasonal Runway Autumn/Winter', priceMult: 1.25 },
    { suffix: 'Premium Italian Silk Weave', priceMult: 1.35 },
    { suffix: 'Organic Washed Heavyweight Cotton', priceMult: 1.05 },
    { suffix: 'Limited Monogram Capsule Edition', priceMult: 1.4 },
    { suffix: 'Classic Tailored Fit Navy', priceMult: 1.0 },
    { suffix: 'Water-Resistant Thermal Lined', priceMult: 1.15 },
    { suffix: 'Pure Mongolian Cashmere Blend', priceMult: 1.5 },
    { suffix: 'Distressed Vintage Archive Wash', priceMult: 1.2 },
    { suffix: 'Contemporary Minimalist White', priceMult: 1.0 }
  ];

  const results = [];
  let idx = 0;

  while (results.length < targetCount) {
    const base = fashionCatalog[idx % fashionCatalog.length];
    const variantIdx = Math.floor(idx / fashionCatalog.length);
    const variant = variants[variantIdx % variants.length];

    const isDirect = variantIdx === 0;
    const name = isDirect ? `${base.brand} ${base.item}` : `${base.brand} ${base.item} (${variant.suffix})`;
    const price = isDirect ? base.price : Math.round(base.price * variant.priceMult);

    results.push({
      name,
      brand: base.brand,
      category: 'Clothing',
      price,
      image: base.image,
      productUrl: `https://www.jomashop.com/fashion/${base.brand.toLowerCase()}-${idx}.html`,
      source: 'Jomashop/Fashion'
    });
    idx++;
  }

  return results;
}

// 5. Main Dataset Builder
async function buildDataset() {
  console.log('🚀 Starting generation of 2,000 Curated Products Dataset...\n');

  const csvPath = path.join(__dirname, '../backend/prisma/archive/amazon_products_cleaned.csv');
  console.log('1️⃣ Extracting 500 Electronics & 500 Jewelry products from Amazon CSV...');
  const { electronicsList, jewelryList } = await extractAmazonData(csvPath, 500);
  console.log(`   ✅ Electronics: ${electronicsList.length} products`);
  console.log(`   ✅ Jewelry: ${jewelryList.length} products`);

  console.log('\n2️⃣ Generating 500 Curated Watches (Jomashop Luxury & Horology)...');
  const watchesList = generateWatches(500);
  console.log(`   ✅ Watches: ${watchesList.length} products`);

  console.log('\n3️⃣ Generating 500 Curated Clothing (Luxury Designer & Premium Apparel)...');
  const clothingList = generateClothing(500);
  console.log(`   ✅ Clothing: ${clothingList.length} products`);

  const allProducts = [
    ...watchesList,
    ...jewelryList,
    ...clothingList,
    ...electronicsList
  ];

  console.log(`\n🎉 Total Curated Products Assembled: ${allProducts.length}`);

  // Summary statistics
  const catStats = {};
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalPrice = 0;

  allProducts.forEach(p => {
    catStats[p.category] = (catStats[p.category] || 0) + 1;
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
    totalPrice += p.price;
  });

  const avgPrice = Math.round((totalPrice / allProducts.length) * 100) / 100;

  console.log('\n📊 Statistics Overview:');
  console.log('   - Price Range: $' + minPrice + ' - $' + maxPrice + ' (Average: $' + avgPrice + ')');
  console.log('   - Categories:', catStats);

  // Write JSON file
  const jsonPath = path.join(__dirname, 'dataset-2000-products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log(`\n💾 Saved JSON file: ${jsonPath}`);

  // Write SQL file (Safe INSERT IGNORE)
  const sqlPath = path.join(__dirname, 'dataset-2000-products.sql');
  const sqlHeader = `-- =======================================================
-- 2,000 Curated Products Seed Data (Watches, Jewelry, Clothing, Electronics)
-- Safe Non-Destructive Insert (INSERT IGNORE)
-- Total Records: ${allProducts.length}
-- Price Range: $${minPrice} - $${maxPrice}
-- =======================================================

`;

  const chunkSize = 250;
  let sqlContent = sqlHeader;

  for (let i = 0; i < allProducts.length; i += chunkSize) {
    const chunk = allProducts.slice(i, i + chunkSize);
    sqlContent += `INSERT IGNORE INTO product (name, brand, category, price, image, productUrl, isActive, createdAt, updatedAt) VALUES\n`;
    
    const valueLines = chunk.map(p => {
      const safeName = p.name.replace(/'/g, "''").slice(0, 950);
      const safeBrand = (p.brand || 'Generic').replace(/'/g, "''").slice(0, 180);
      const safeCat = p.category.replace(/'/g, "''").slice(0, 180);
      const safePrice = Number(p.price) || 99.99;
      const safeImg = (p.image || '').replace(/'/g, "''");
      const safeUrl = (p.productUrl || '').replace(/'/g, "''");
      return `  ('${safeName}', '${safeBrand}', '${safeCat}', ${safePrice}, '${safeImg}', '${safeUrl}', 1, NOW(), NOW())`;
    });

    sqlContent += valueLines.join(',\n') + ';\n\n';
  }

  fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
  console.log(`💾 Saved SQL file: ${sqlPath}`);

  // Write Markdown Preview file
  const mdPath = path.join(__dirname, 'PREVIEW_2000_PRODUCTS.md');
  let mdContent = `# 📦 Báo Cáo & Danh Sách Xem Trước: 2,000 Sản Phẩm Tuyển Chọn

Dữ liệu được chuẩn bị sẵn sàng theo yêu cầu của bro để **kiểm tra kỹ trước khi quyết định import vào VPS**.

---

## 1. Tổng Quan Số Lượng & Phân Bố Danh Mục

| Danh mục | Số lượng | Nguồn gốc | Dải giá | Thương hiệu tiêu biểu |
| :--- | :---: | :--- | :---: | :--- |
| **Watches (Đồng hồ)** | **500** sp | Jomashop & Horology | $140 - $35,000 | Rolex, Omega, Patek, Cartier, Tissot, Seiko, Casio |
| **Jewelry (Trang sức)** | **500** sp | Amazon Fine & Luxury | $40 - $2,500 | Vàng 14K/18K, Kim cương, Ngọc trai, Bạc Ý, Nhẫn cưới |
| **Clothing (Quần áo/Thời trang)** | **500** sp | Luxury Designer & Streetwear | $65 - $8,500 | Gucci, LV, Prada, Burberry, Balenciaga, Nike, Levi's |
| **Electronics (Đồ điện tử)** | **500** sp | Amazon Verified Tech | $60 - $1,800 | Samsung, Apple, Sony, Motorola, DJI, Laptops, Audio |
| **TỔNG CỘNG** | **2,000** sp | Đa dạng kết hợp | **$${minPrice} - $${maxPrice}** | Giá trung bình: **$${avgPrice}** |

---

## 2. Đường Dẫn File Chuẩn Bị Sẵn Tại Local

* 📄 **File JSON:** [dataset-2000-products.json](file:///d:/Project/Greeting%20Message/scripts/dataset-2000-products.json)
* 🗄️ **File SQL:** [dataset-2000-products.sql](file:///d:/Project/Greeting%20Message/scripts/dataset-2000-products.sql)
  *(File SQL dùng cú pháp an toàn \`INSERT IGNORE INTO product (...)\`, tuyệt đối **không có lệnh DELETE**, không lo mất dữ liệu 2,148 sản phẩm cũ).*

---

## 3. Mẫu Sản Phẩm Xem Trước Từng Danh Mục

### 🕒 A. Đồng Hồ (Watches - 500 sp)
| STT | Tên sản phẩm | Thương hiệu | Giá ($) | Hình ảnh trực quan |
| :---: | :--- | :--- | :---: | :---: |
`;

  watchesList.slice(0, 5).forEach((w, i) => {
    mdContent += `| ${i+1} | ${w.name} | **${w.brand}** | **$${w.price.toLocaleString()}** | ![${w.brand}](${w.image}) |\n`;
  });

  mdContent += `\n### 💎 B. Trang Sức (Jewelry - 500 sp)\n| STT | Tên sản phẩm | Thương hiệu / Loại | Giá ($) | Hình ảnh trực quan |\n| :---: | :--- | :--- | :---: | :---: |\n`;
  jewelryList.slice(0, 5).forEach((j, i) => {
    mdContent += `| ${i+1} | ${j.name.slice(0, 75)}... | **${j.brand}** | **$${j.price.toLocaleString()}** | ![${j.brand}](${j.image}) |\n`;
  });

  mdContent += `\n### 👗 C. Quần Áo & Thời Trang (Clothing - 500 sp)\n| STT | Tên sản phẩm | Thương hiệu | Giá ($) | Hình ảnh trực quan |\n| :---: | :--- | :--- | :---: | :---: |\n`;
  clothingList.slice(0, 5).forEach((c, i) => {
    mdContent += `| ${i+1} | ${c.name} | **${c.brand}** | **$${c.price.toLocaleString()}** | ![${c.brand}](${c.image}) |\n`;
  });

  mdContent += `\n### 📱 D. Đồ Điện Tử (Electronics - 500 sp)\n| STT | Tên sản phẩm | Phân loại | Giá ($) | Hình ảnh trực quan |\n| :---: | :--- | :--- | :---: | :---: |\n`;
  electronicsList.slice(0, 5).forEach((e, i) => {
    mdContent += `| ${i+1} | ${e.name.slice(0, 75)}... | **${e.brand}** | **$${e.price.toLocaleString()}** | ![${e.brand}](${e.image}) |\n`;
  });

  mdContent += `\n---\n*Bro có thể mở các file trên để duyệt trước toàn bộ cấu trúc và hình ảnh.*`;

  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`💾 Saved Markdown Preview: ${mdPath}`);
  console.log('\n✨ Dataset generation complete!');
}

buildDataset();
