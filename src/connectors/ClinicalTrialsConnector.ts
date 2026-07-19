import { BaseConnector } from './BaseConnector';

export class ClinicalTrialsConnector extends BaseConnector {
  constructor() {
    super('CLINICAL_TRIALS', 'https://clinicaltrials.gov/api/v2', 5);
  }

  public async searchTrialsBySponsor(sponsorName: string): Promise<any> {
    return this.get(`/studies?query.leadSponsor=\${encodeURIComponent(sponsorName)}\&pageSize=100`);
  }
}
