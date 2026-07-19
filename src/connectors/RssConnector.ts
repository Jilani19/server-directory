import { BaseConnector } from './BaseConnector';

export class RssConnector extends BaseConnector {
  constructor() {
    super('RSS', '', 5);
  }

  public async fetchFeed(url: string): Promise<any> {
    return this.get(url, { responseType: 'text' });
  }
}
