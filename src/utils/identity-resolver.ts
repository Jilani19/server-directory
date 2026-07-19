// Golden Identity Resolver

const SUFFIXES = [
  'inc', 'llc', 'ag', 'ltd', 'limited', 'corp', 'corporation', 
  'plc', 'spa', 'sa', 'nv', 'gmbh', 'co', 'company', 'lp', 'llp'
];

const ALIASES: Record<string, string> = {
  'j&j': 'johnson & johnson',
  'jnj': 'johnson & johnson',
  'janssen': 'johnson & johnson',
  'pfizer inc': 'pfizer',
  'pfizer limited': 'pfizer',
  'f. hoffmann-la roche': 'roche',
  'genentech': 'roche',
  'novartis ag': 'novartis',
  'sandoz': 'novartis',
  'iqvia holdings': 'iqvia',
  'iqvia inc': 'iqvia',
  'gsk': 'glaxosmithkline',
  'glaxosmithkline plc': 'glaxosmithkline'
};

export class IdentityResolver {
  
  /**
   * Normalize a company name by lowercasing and removing special characters.
   */
  static normalize(name: string): string {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/[^\w\s&]/g, '') // Remove punctuation except ampersand
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Strip legal suffixes from a normalized name.
   */
  static stripSuffixes(normalizedName: string): string {
    let parts = normalizedName.split(' ');
    while (parts.length > 1 && SUFFIXES.includes(parts[parts.length - 1])) {
      parts.pop();
    }
    return parts.join(' ');
  }

  /**
   * Resolve a company name to its Golden Identity.
   */
  static resolve(rawName: string): string {
    const normalized = this.normalize(rawName);
    
    // Check direct alias first
    if (ALIASES[normalized]) {
      return ALIASES[normalized];
    }

    // Strip suffixes and check alias again
    const stripped = this.stripSuffixes(normalized);
    if (ALIASES[stripped]) {
      return ALIASES[stripped];
    }

    // Return the stripped name capitalized as Golden Identity fallback
    return stripped.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
