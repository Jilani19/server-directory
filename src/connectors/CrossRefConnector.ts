import { BaseConnector } from './BaseConnector';

export class CrossRefConnector extends BaseConnector {
  constructor() {
    super('CROSSREF', 'https://api.crossref.org', 5);
    this.client.defaults.headers.common['User-Agent'] = 'CompanyIntelligence Platform admin@company.com';
  }

  public async searchWorks(companyName: string): Promise<any> {
    return this.get(`/works?query.affiliation=\${encodeURIComponent(companyName)}\&rows=100`);
  }
}
