"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
async function test() {
    try {
        const yf = yahoo_finance2_1.default;
        const instance = new yf();
        const quote = await instance.quoteSummary('AAPL');
        console.log("Success:", quote.price?.symbol);
    }
    catch (e) {
        console.error("Error:", e.message);
    }
}
test();
