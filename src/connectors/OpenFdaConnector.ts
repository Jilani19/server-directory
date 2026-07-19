import { BaseConnector } from './BaseConnector';

export class OpenFdaConnector extends BaseConnector {
  constructor() {
    super('OPENFDA', 'https://api.fda.gov', 3);
  }

  public async searchDrugs(companyName: string): Promise<any> {
    return this.get(`/drug/ndc.json?search=openfda.manufacturer_name:"\${encodeURIComponent(companyName)}"\&limit=100`);
  }
}
