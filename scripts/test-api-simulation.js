
async function test() {
  try {
    const API = 'http://223.130.11.200:5000';
    console.log('1. Logging in as 98934222747...');
    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '98934222747',
        password: 'hoangnam01'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login result:', loginData.success, loginData.message || '');
    if (!loginData.success) return;

    const token = loginData.data?.token || loginData.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    console.log('\n2. Fetching /api/orders/stats...');
    const statsRes = await fetch(`${API}/api/orders/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log('Stats status:', statsRes.status);
    console.log('Stats data:', JSON.stringify(statsData, null, 2));

    console.log('\n3. Fetching /api/products...');
    const prodRes = await fetch(`${API}/api/products`, { headers: authHeaders });
    const prodData = await prodRes.json();
    console.log('Products status:', prodRes.status);
    console.log('Products count:', prodData.data?.length);
    if (prodData.data?.length > 0) {
      console.log('Sample product 0:', prodData.data[0]);
    }

    console.log('\n4. Fetching /api/orders/history?limit=40...');
    const histRes = await fetch(`${API}/api/orders/history?limit=40`, { headers: authHeaders });
    const histData = await histRes.json();
    console.log('History status:', histRes.status);
    console.log('History count:', histData.data?.orders?.length);
    if (histData.data?.orders?.length > 0) {
      console.log('Sample history 0:', histData.data.orders[0]);
    }

  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
