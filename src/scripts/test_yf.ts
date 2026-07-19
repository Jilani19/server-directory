import YahooFinance from "yahoo-finance2";

async function run() {
  const yf = new YahooFinance();
  // Search for Amgen
  const searchResult = await yf.search("Amgen");
  const firstQuote = searchResult?.quotes?.[0];
  console.log("Search Result:", firstQuote ? firstQuote : "No quotes");

  if (firstQuote) {
    const ticker = (firstQuote as any).symbol as string;
    const quote = await yf.quoteSummary(ticker, {
      modules: ["price", "summaryProfile", "financialData", "defaultKeyStatistics"],
    });
    console.log("Website:", quote?.summaryProfile?.website ?? "—");
    console.log("Industry:", quote?.summaryProfile?.industry ?? "—");
  }
}

run().catch(console.error);
