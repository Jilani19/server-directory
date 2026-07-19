import { BaseConnector } from './BaseConnector';

export class PubMedConnector extends BaseConnector {
  constructor() {
    super('PUBMED', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils', 3);
  }

  public async searchPublications(companyName: string): Promise<any> {
    return this.get(`/esearch.fcgi?db=pubmed&term=\${encodeURIComponent(companyName)}[Affiliation]&retmode=json`);
  }
}
