const yahooFinance2 = require("yahoo-finance2").default;
const yahooFinance = new yahooFinance2();

async function run() {
  try {
    const res = await yahooFinance.search("Amgen");
    console.log(res.quotes[0]);
  } catch (e) {
    console.log(e);
  }
}
run();
