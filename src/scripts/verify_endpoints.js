const http = require('http');

const endpoints = [
  '/api/health',
  '/api/v1/company',
  '/api/v1/company/stats',
  '/api/v1/company/categories',
  '/api/v1/company?page=1&limit=12'
];

async function fetchEndpoint(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          time: Date.now() - start,
          data: data
        });
      });
    }).on('error', (err) => {
      resolve({
        path,
        status: 0,
        time: Date.now() - start,
        error: err.message
      });
    });
  });
}

async function run() {
  for (const ep of endpoints) {
    console.log(`Testing ${ep}...`);
    const res = await fetchEndpoint(ep);
    console.log(`Status: ${res.status} | Time: ${res.time}ms`);
    console.log(`Response: ${res.data || res.error}`);
    console.log('--------------------------------------------------');
  }
}

run();
