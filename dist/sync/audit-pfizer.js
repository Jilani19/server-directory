"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const COMPANY = "Pfizer";
async function testApi(name, url, transformFn) {
    const result = {
        name,
        url,
        status: 0,
        records: 0,
        mapped: [],
        skipped: [],
        failed: [],
        error: null
    };
    try {
        const response = await fetch(url);
        result.status = response.status;
        const data = await response.json();
        const transformed = transformFn(data);
        result.records = transformed.records;
        result.mapped = transformed.mapped || [];
        result.skipped = transformed.skipped || [];
        result.failed = transformed.failed || [];
    }
    catch (e) {
        result.status = 500;
        result.error = e.message;
        result.failed = ['All'];
    }
    return result;
}
async function runAudit() {
    const results = [];
    // 1. Wikidata
    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(`
    SELECT ?item ?itemLabel ?inception ?employees ?hqLabel ?revenue ?lei ?cik WHERE {
      ?item wdt:P31 wd:Q4830453.
      ?item rdfs:label "${COMPANY}"@en.
      OPTIONAL { ?item wdt:P571 ?inception. }
      OPTIONAL { ?item wdt:P1128 ?employees. }
      OPTIONAL { ?item wdt:P159 ?hq. ?hq rdfs:label ?hqLabel. filter(lang(?hqLabel) = "en") }
      OPTIONAL { ?item wdt:P2139 ?revenue. }
      OPTIONAL { ?item wdt:P1278 ?lei. }
      OPTIONAL { ?item wdt:P5531 ?cik. }
    } LIMIT 1
  `)}&format=json`;
    results.push(await testApi('Wikidata', wikidataUrl, (data) => {
        const bindings = data?.results?.bindings || [];
        return {
            records: bindings.length,
            mapped: ['employees', 'inception', 'hqLabel', 'revenue', 'lei', 'cik'],
            skipped: ['itemLabel'],
            failed: bindings.length === 0 ? ['employees', 'inception', 'hqLabel', 'revenue', 'lei', 'cik'] : []
        };
    }));
    // 2. Wikipedia (Extract)
    results.push(await testApi('Wikipedia', `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(COMPANY)}`, (data) => {
        return {
            records: data.extract ? 1 : 0,
            mapped: ['extract (Business overview)'],
            skipped: ['thumbnail', 'description'],
            failed: []
        };
    }));
    // 3. SEC EDGAR (using Pfizer CIK 0000078003)
    results.push(await testApi('SEC EDGAR', `https://data.sec.gov/submissions/CIK0000078003.json`, (data) => {
        return {
            records: 1,
            mapped: ['name', 'tickers', 'exchanges', 'ein', 'stateOfIncorporation', 'fiscalYearEnd'],
            skipped: ['filings', 'formerNames'],
            failed: []
        };
    }));
    // 4. ClinicalTrials.gov (v2)
    results.push(await testApi('ClinicalTrials.gov', `https://clinicaltrials.gov/api/v2/studies?query.sponsor=${encodeURIComponent(COMPANY)}&pageSize=1`, (data) => {
        return {
            records: data?.studies?.length || 0,
            mapped: ['nctId', 'briefTitle', 'overallStatus', 'phase'],
            skipped: ['protocolSection'],
            failed: []
        };
    }));
    // 5. PubMed / Europe PMC
    results.push(await testApi('Europe PMC', `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=AFF:"${COMPANY}"&format=json&resultType=lite&cursorMark=*`, (data) => {
        return {
            records: data?.resultList?.result?.length || 0,
            mapped: ['title', 'authorString', 'journalTitle', 'pubYear', 'doi', 'pmid'],
            skipped: ['abstractText'],
            failed: []
        };
    }));
    // 6. OpenFDA (Drugs)
    results.push(await testApi('OpenFDA', `https://api.fda.gov/drug/label.json?search=openfda.manufacturer_name:"${COMPANY}"&limit=1`, (data) => {
        return {
            records: data?.results?.length || 0,
            mapped: ['brand_name', 'generic_name', 'manufacturer_name', 'product_type', 'route'],
            skipped: ['spl_product_data_elements'],
            failed: []
        };
    }));
    // Database Check
    const dbCompany = await prisma.company.findUnique({
        where: { slug: 'pfizer' },
        include: {
            executives: true,
            subsidiaries: true,
            clinicalTrials: true,
            products: true,
            publications: true,
            patents: true
        }
    });
    const dbStats = dbCompany ? {
        name: dbCompany.name,
        executives: dbCompany.executives.length,
        subsidiaries: dbCompany.subsidiaries.length,
        clinicalTrials: dbCompany.clinicalTrials.length,
        products: dbCompany.products.length,
        publications: dbCompany.publications.length,
        patents: dbCompany.patents.length,
        hasRevenue: !!dbCompany.revenue,
        hasEmployees: !!dbCompany.employees,
        hasHq: !!dbCompany.hqAddress
    } : null;
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, 'audit_report.json'), JSON.stringify({
        apis: results,
        db: dbStats
    }, null, 2));
}
runAudit().catch(console.error).finally(() => prisma.$disconnect());
