import yahooFinance from 'yahoo-finance2'; 

async function run() { 
  try {
    const res = await yahooFinance.quoteSummary('ABBV', { modules: ['assetProfile', 'financialData', 'price'] }); 
    console.log(JSON.stringify(res, null, 2)); 
  } catch (e) {
    console.error(e);
  }
} 
run();
