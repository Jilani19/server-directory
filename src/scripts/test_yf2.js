const yahooFinance = require("yahoo-finance2").default;

async function run() {
  try {
    const res = await yahooFinance.search("Amgen");
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}
run();
