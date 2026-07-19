import { BaseConnector } from './BaseConnector';

export class SecEdgarConnector extends BaseConnector {
  constructor() {
    // SEC requires a 10 requests per second rate limit and a specific User-Agent
    super('SEC_EDGAR', 'https://data.sec.gov', 10);
    this.client.defaults.headers.common['User-Agent'] = 'CompanyIntelligence Platform admin@company.com';
  }

  public async getSubmissions(cik: string): Promise<any> {
    const paddedCik = cik.padStart(10, '0');
    return this.get(`/submissions/CIK\${paddedCik}.json`);
  }

  public async getCompanyConcepts(cik: string, taxonomy: string, tag: string): Promise<any> {
    const paddedCik = cik.padStart(10, '0');
    return this.get(`/api/xbrl/companyconcept/CIK\${paddedCik}/\${taxonomy}/\${tag}.json`);
  }
}
