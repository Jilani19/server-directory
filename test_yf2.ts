import { YahooFinance } from 'yahoo-finance2';

async function run() {
  try {
    const yf = new YahooFinance();
    const res = await yf.quoteSummary('ABBV', { modules: ['assetProfile', 'financialData', 'price'] });
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
