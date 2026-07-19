import { BaseConnector } from './BaseConnector';

export class GleifConnector extends BaseConnector {
  constructor() {
    super('GLEIF', 'https://api.gleif.org/api/v1', 5);
  }

  public async searchCompany(name: string): Promise<any> {
    return this.get(`/lei-records?filter[entity.legalName]=\${encodeURIComponent(name)}`);
  }

  public async getByLei(lei: string): Promise<any> {
    return this.get(`/lei-records/\${lei}`);
  }
}
