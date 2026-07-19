const http = require('http');
const SLUG = 'amgen-1784395795531';
const BASE = 'http://localhost:5000/api/v1/companies';

const tabs = ['pipeline', 'contacts', 'publications'];

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const tab of tabs) {
    const url = `${BASE}/${SLUG}/${tab}?limit=50`;
    const { status, body } = await get(url);
    console.log(`\n=== TAB: ${tab.toUpperCase()} ===`);
    console.log('Status:', status);
    if (body && body.data) {
      if (Array.isArray(body.data)) {
        console.log('data is array, length:', body.data.length);
        if (body.data.length > 0) console.log('First item keys:', Object.keys(body.data[0]));
        if (body.data.length > 0) console.log('First item:', JSON.stringify(body.data[0]).substring(0, 300));
      } else if (typeof body.data === 'object') {
        console.log('data is object, keys:', Object.keys(body.data));
        for (const [k, v] of Object.entries(body.data)) {
          if (Array.isArray(v)) console.log(`  data.${k} length:`, v.length);
          else console.log(`  data.${k}:`, typeof v === 'string' ? v.slice(0,80) : v);
        }
      }
    }
    if (body && body.metadata) {
      console.log('pagination:', JSON.stringify(body.metadata.pagination));
    }
  }
}
main().catch(e => { console.error('FATAL:', e.message); });
