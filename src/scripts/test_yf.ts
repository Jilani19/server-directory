import yahooFinance from "yahoo-finance2";

async function run() {
  const searchResult = await yahooFinance.search("Amgen");
  console.log("Search Result:", searchResult.quotes.length > 0 ? searchResult.quotes[0] : "No quotes");
  
  if (searchResult.quotes.length > 0) {
    const ticker = searchResult.quotes[0].symbol;
    const quote = await yahooFinance.quoteSummary(ticker, { modules: ["price", "summaryProfile", "financialData", "defaultKeyStatistics"] });
    console.log("Website:", quote.summaryProfile?.website);
    console.log("Industry:", quote.summaryProfile?.industry);
  }
}
run().catch(console.error);
