import yahooFinance from 'yahoo-finance2';
async function test() {
  try {
    const yf = yahooFinance as any;
    const instance = new yf();
    const quote = await instance.quoteSummary('AAPL');
    console.log("Success:", quote.price?.symbol);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
