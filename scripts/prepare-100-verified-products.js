const fs = require('fs');

async function testUrl(url) {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('image') && !ct.includes('octet-stream') && !ct.includes('webp')) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 1000;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Fetching DummyJSON and FakeStore products...');
  
  // 1. Fetch DummyJSON
  const djRes = await fetch('https://dummyjson.com/products?limit=194');
  const djData = await djRes.json();
  
  // 2. Fetch FakeStore
  const fsRes = await fetch('https://fakestoreapi.com/products');
  const fsData = await fsRes.json();

  const candidates = [];

  // Group 1: Electronics (25 items)
  // Group 2: Watches (25 items)
  // Group 3: Clothing (25 items)
  // Group 4: Jewelry (25 items)

  // From DummyJSON:
  for (const p of djData.products) {
    if (p.price < 10) continue;
    let cat = null;
    if (['smartphones', 'laptops', 'tablets', 'mobile-accessories'].includes(p.category)) {
      cat = 'Electronics';
    } else if (['mens-watches', 'womens-watches'].includes(p.category)) {
      cat = 'Watches';
    } else if (['mens-shirts', 'womens-dresses', 'tops', 'sunglasses', 'womens-bags', 'mens-shoes', 'womens-shoes'].includes(p.category)) {
      cat = 'Clothing';
    } else if (p.category === 'womens-jewellery') {
      cat = 'Jewelry';
    }

    if (cat) {
      // Trim title to max 5 words
      const words = p.title.trim().split(/\s+/);
      const shortName = words.slice(0, 5).join(' ');
      candidates.push({
        name: shortName,
        brand: p.brand || 'Generic',
        category: cat,
        price: Math.round(p.price),
        image: p.thumbnail,
        productUrl: `https://dummyjson.com/products/${p.id}`
      });
    }
  }

  // From FakeStore:
  for (const p of fsData) {
    if (p.price < 10) continue;
    let cat = null;
    let brand = 'Generic';
    if (p.category === 'jewelery') {
      cat = 'Jewelry';
      brand = 'Luxury Jewelry';
    } else if (p.category === 'electronics') {
      cat = 'Electronics';
      brand = 'Tech Brand';
    } else if (p.category.includes('clothing')) {
      cat = 'Clothing';
      brand = 'Fashion Brand';
    }

    if (cat) {
      const words = p.title.trim().replace(/['",.-]/g, ' ').split(/\s+/).filter(Boolean);
      const shortName = words.slice(0, 4).join(' ');
      candidates.push({
        name: shortName,
        brand,
        category: cat,
        price: Math.round(p.price),
        image: p.image,
        productUrl: `https://fakestoreapi.com/products/${p.id}`
      });
    }
  }

  // Additional curated verified Jewelry and Watches items from Unsplash direct CDN:
  const extraItems = [
    // Jewelry (Trang sức)
    { name: "Tiffany Diamond Solitaire Ring", brand: "Tiffany & Co", category: "Jewelry", price: 4200, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" },
    { name: "Swarovski Crystal Heart Necklace", brand: "Swarovski", category: "Jewelry", price: 149, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80" },
    { name: "Pandora Silver Sparkling Earrings", brand: "Pandora", category: "Jewelry", price: 89, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80" },
    { name: "Bvlgari Serpenti Viper Ring", brand: "Bvlgari", category: "Jewelry", price: 3800, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80" },
    { name: "Van Cleef Alhambra Necklace", brand: "Van Cleef", category: "Jewelry", price: 2900, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80" },
    { name: "Pearl Drop Wedding Earrings", brand: "Mikimoto", category: "Jewelry", price: 320, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80" },
    { name: "Gold Twisted Rope Chain", brand: "Mejuri", category: "Jewelry", price: 195, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&auto=format&fit=crop&q=80" },
    { name: "Cartier White Gold Band", brand: "Cartier", category: "Jewelry", price: 1850, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80" },
    { name: "Sapphire Halo Diamond Pendant", brand: "Blue Nile", category: "Jewelry", price: 1250, image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&auto=format&fit=crop&q=80" },
    { name: "Rose Gold Tennis Bracelet", brand: "Swarovski", category: "Jewelry", price: 280, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80" },
    { name: "Diamond Eternity Wedding Band", brand: "Harry Winston", category: "Jewelry", price: 5400, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&auto=format&fit=crop&q=80" },
    { name: "Emerald Cut Gemstone Necklace", brand: "Chopard", category: "Jewelry", price: 3200, image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80" },
    { name: "Sterling Silver Bangle Bracelet", brand: "Pandora", category: "Jewelry", price: 75, image: "https://images.unsplash.com/photo-1611591475871-3c4ff192938b?w=600&auto=format&fit=crop&q=80" },
    { name: "Vintage Floral Diamond Brooch", brand: "Cartier", category: "Jewelry", price: 4600, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80" },
    { name: "Yellow Gold Huggie Earrings", brand: "Mejuri", category: "Jewelry", price: 160, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80" },
    { name: "Platinum Solitaire Engagement Ring", brand: "Tiffany & Co", category: "Jewelry", price: 6800, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" },
    { name: "Cubic Zirconia Tennis Choker", brand: "Swarovski", category: "Jewelry", price: 210, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80" },
    { name: "Akoya Cultured Pearl Necklace", brand: "Mikimoto", category: "Jewelry", price: 3800, image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&auto=format&fit=crop&q=80" },
    { name: "Chopard Happy Diamonds Ring", brand: "Chopard", category: "Jewelry", price: 2150, image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80" },
    { name: "David Yurman Cable Bracelet", brand: "David Yurman", category: "Jewelry", price: 750, image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&auto=format&fit=crop&q=80" },
    
    // Luxury Watches (Đồng hồ cao cấp)
    { name: "Panerai Luminor Marina Automatic", brand: "Panerai", category: "Watches", price: 7900, image: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80" },
    { name: "Rolex Submariner Date Watch", brand: "Rolex", category: "Watches", price: 12500, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" },
    { name: "Omega Seamaster Diver 300M", brand: "Omega", category: "Watches", price: 5800, image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80" },
    { name: "TAG Heuer Carrera Chronograph", brand: "TAG Heuer", category: "Watches", price: 4200, image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80" },
    { name: "Cartier Santos Automatic Watch", brand: "Cartier", category: "Watches", price: 7200, image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80" },
    { name: "Patek Philippe Calatrava Rose", brand: "Patek Philippe", category: "Watches", price: 28000, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80" },
    { name: "Seiko Prospex Diver Automatic", brand: "Seiko", category: "Watches", price: 475, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80" },
    { name: "Tissot PRX Powermatic 80", brand: "Tissot", category: "Watches", price: 695, image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80" },
    { name: "Casio G-Shock Carbon Core", brand: "Casio", category: "Watches", price: 120, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80" },
    { name: "Fossil Townsman Automatic Skeleton", brand: "Fossil", category: "Watches", price: 240, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" },
    { name: "Citizen Eco-Drive Promaster Diver", brand: "Citizen", category: "Watches", price: 325, image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80" },
    { name: "Breitling Navitimer B01 Chronograph", brand: "Breitling", category: "Watches", price: 8900, image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80" },
    { name: "Audemars Piguet Royal Oak", brand: "Audemars Piguet", category: "Watches", price: 29500, image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80" },
    { name: "Hamilton Khaki Field Mechanical", brand: "Hamilton", category: "Watches", price: 550, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80" },
    { name: "Longines HydroConquest Automatic Ceramic", brand: "Longines", category: "Watches", price: 1700, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80" },

    // Clothing (Quần áo / Thời trang)
    { name: "Nike Sportswear Club Hoodie", brand: "Nike", category: "Clothing", price: 65, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80" },
    { name: "Adidas Originals Trefoil Tee", brand: "Adidas", category: "Clothing", price: 35, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80" },
    { name: "Zara Slim Fit Oxford", brand: "Zara", category: "Clothing", price: 49, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80" },
    { name: "Uniqlo Ultra Light Down", brand: "Uniqlo", category: "Clothing", price: 89, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80" },
    { name: "Levi's 501 Original Jeans", brand: "Levi's", category: "Clothing", price: 79, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80" },
    { name: "Gucci GG Jacquard Cardigan", brand: "Gucci", category: "Clothing", price: 1650, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80" },
    { name: "The North Face Nuptse", brand: "The North Face", category: "Clothing", price: 330, image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80" },
    { name: "Tommy Hilfiger Classic Polo", brand: "Tommy Hilfiger", category: "Clothing", price: 60, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80" },
    { name: "Ralph Lauren Oxford Shirt", brand: "Ralph Lauren", category: "Clothing", price: 115, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80" },
    { name: "Champion Reverse Weave Sweatshirt", brand: "Champion", category: "Clothing", price: 55, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80" },

    // Electronics (Đồ điện tử)
    { name: "Sony WH-1000XM5 Noise Canceling", brand: "Sony", category: "Electronics", price: 398, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
    { name: "Apple AirPods Max Wireless", brand: "Apple", category: "Electronics", price: 549, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80" },
    { name: "JBL Flip 6 Waterproof", brand: "JBL", category: "Electronics", price: 129, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80" },
    { name: "Logitech MX Master 3S", brand: "Logitech", category: "Electronics", price: 99, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80" },
    { name: "Apple iPad Air M2", brand: "Apple", category: "Electronics", price: 599, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80" },
    { name: "Canon EOS R50 Mirrorless", brand: "Canon", category: "Electronics", price: 679, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" },
    { name: "Fujifilm X-T30 II Digital", brand: "Fujifilm", category: "Electronics", price: 899, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80" },
    { name: "Nintendo Switch OLED Model", brand: "Nintendo", category: "Electronics", price: 349, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80" },
    { name: "PlayStation 5 DualSense Controller", brand: "Sony", category: "Electronics", price: 69, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80" },
    { name: "Bose SoundLink Flex Bluetooth", brand: "Bose", category: "Electronics", price: 149, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80" }
  ];

  candidates.push(...extraItems);

  console.log(`Total raw candidates: ${candidates.length}`);

  // Test every single candidate image
  console.log('🧪 Testing each image URL for 200 OK and valid image data...');
  const verified = [];
  const byCat = { Jewelry: [], Watches: [], Clothing: [], Electronics: [] };

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    process.stdout.write(`\r[${i + 1}/${candidates.length}] Testing: ${item.name.slice(0, 30)}...`);
    
    // Check word count <= 5
    const wc = item.name.trim().split(/\s+/).length;
    if (wc < 1 || wc > 5) continue;
    if (item.price < 10) continue;

    const ok = await testUrl(item.image);
    if (ok) {
      if (byCat[item.category]) {
        // avoid duplicate names
        if (!byCat[item.category].some(x => x.name.toLowerCase() === item.name.toLowerCase())) {
          byCat[item.category].push(item);
        }
      }
    }
  }

  console.log('\n\n✅ Verified counts by category:');
  console.log(`   💎 Jewelry:     ${byCat.Jewelry.length}`);
  console.log(`   ⌚ Watches:     ${byCat.Watches.length}`);
  console.log(`   👕 Clothing:    ${byCat.Clothing.length}`);
  console.log(`   📱 Electronics: ${byCat.Electronics.length}`);

  // Select 25 from each category to form exactly 100 products
  const selected = [
    ...byCat.Jewelry.slice(0, 25),
    ...byCat.Watches.slice(0, 25),
    ...byCat.Clothing.slice(0, 25),
    ...byCat.Electronics.slice(0, 25)
  ];

  console.log(`\n🎉 Total Selected Products: ${selected.length}`);

  fs.writeFileSync('scripts/100-verified-products.json', JSON.stringify(selected, null, 2));
  console.log('💾 Saved to scripts/100-verified-products.json');
}

main().catch(console.error);
