import { BaseConnector } from './BaseConnector';

export class WebsiteSpiderConnector extends BaseConnector {
  constructor() {
    super('WEBSITE_SPIDER', '', 1); // External URLs provided dynamically
  }

  public async fetchHomepage(url: string): Promise<any> {
    return this.get(url, { responseType: 'text' });
  }
}
