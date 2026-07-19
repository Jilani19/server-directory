"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
async function testApi(name, url, headers = {}) {
    console.log(`Testing ${name}...`);
    try {
        const start = Date.now();
        const res = await fetch(url, { headers });
        const duration = Date.now() - start;
        const json = await res.json();
        return {
            api: name,
            url,
            status: res.status,
            duration,
            sampleResponse: typeof json === 'object' ? JSON.stringify(json).substring(0, 500) + '...' : 'Unknown format'
        };
    }
    catch (e) {
        return {
            api: name,
            url,
            error: e.message
        };
    }
}
async function run() {
    const company = 'Pfizer';
    const encoded = encodeURIComponent(company);
    const results = [];
    results.push(await testApi('OpenFDA (Products)', `https://api.fda.gov/drug/label.json?search=openfda.manufacturer_name:*${encoded}*&limit=1`));
    results.push(await testApi('OpenFDA (Enforcement)', `https://api.fda.gov/drug/enforcement.json?search=recalling_firm:*${encoded}*&limit=1`));
    results.push(await testApi('ClinicalTrials.gov', `https://clinicaltrials.gov/api/v2/studies?query.term=${encoded}&pageSize=1`));
    results.push(await testApi('EuropePMC (Publications)', `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=AFF:"${encoded}"&format=json&resultType=lite&pageSize=1`));
    fs_1.default.writeFileSync('api_evidence.json', JSON.stringify(results, null, 2));
    console.log('Saved to api_evidence.json');
}
run();
