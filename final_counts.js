const http = require('http');
const SLUG = 'amgen-1784395795531';
const BASE = 'http://localhost:5000/api/v1/companies';

const allTabs = [
  'products', 'clinical-trials', 'leadership', 'financials',
  'news', 'documents', 'regulatory', 'patents', 'publications',
  'pipeline', 'contacts'
];

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data.slice(0,200) }); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('\n=== STEP 11 COUNTS: ALL TABS ===\n');
  console.log('Tab'.padEnd(20), 'HTTP'.padEnd(6), 'API Count'.padEnd(12), 'Pagination Total');
  console.log('-'.repeat(65));
  
  for (const tab of allTabs) {
    const url = `${BASE}/${SLUG}/${tab}?limit=200`;
    const { status, body } = await get(url);
    
    let apiCount = '?';
    let paginationTotal = '?';
    
    if (body && body.data) {
      if (Array.isArray(body.data)) {
        apiCount = body.data.length;
      } else if (typeof body.data === 'object') {
        // Could be { drugs: [], products: [] }
        const arrays = Object.values(body.data).filter(v => Array.isArray(v));
        if (arrays.length > 0) {
          apiCount = arrays[0].length + ` (in .${Object.keys(body.data).find(k => Array.isArray(body.data[k]))})`;
        } else {
          apiCount = Object.keys(body.data).length + ' keys';
        }
      }
    }
    
    if (body && body.metadata && body.metadata.pagination) {
      paginationTotal = body.metadata.pagination.total;
    }
    
    const statusStr = status === 200 ? '✅ 200' : `❌ ${status}`;
    console.log(tab.padEnd(20), statusStr.padEnd(6), String(apiCount).padEnd(12), paginationTotal);
  }
}

main().catch(e => { console.error('FATAL:', e.message); });
