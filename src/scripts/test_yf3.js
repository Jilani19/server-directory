const { YahooFinance } = require("yahoo-finance2");
const yahooFinance = new YahooFinance();

async function run() {
  try {
    const res = await yahooFinance.search("Amgen");
    console.log(res.quotes[0]);
  } catch (e) {
    console.log(e);
  }
}
run();
