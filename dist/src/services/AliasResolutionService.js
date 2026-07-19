"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasResolutionService = void 0;
class AliasResolutionService {
    static getAliases(companyName, slug) {
        const normalizedName = companyName.trim().toLowerCase();
        const aliases = new Set();
        aliases.add(companyName); // Always include the base name
        if (slug === 'roche' || normalizedName.includes('roche')) {
            aliases.add('F. Hoffmann-La Roche');
            aliases.add('Roche Holding AG');
            aliases.add('Genentech');
        }
        if (slug === 'merck' || normalizedName.includes('merck')) {
            aliases.add('Merck & Co.');
            aliases.add('MSD');
            aliases.add('Merck Sharp & Dohme');
            aliases.add('Merck Inc');
        }
        if (slug === 'novartis' || normalizedName.includes('novartis')) {
            aliases.add('Novartis AG');
            aliases.add('Sandoz'); // Former division
        }
        if (slug === 'abbvie' || normalizedName.includes('abbvie')) {
            aliases.add('AbbVie Inc');
            aliases.add('AbbVie Inc.');
        }
        if (slug === 'sanofi' || normalizedName.includes('sanofi')) {
            aliases.add('Sanofi SA');
            aliases.add('Sanofi-Aventis');
            aliases.add('Genzyme');
        }
        if (slug === 'pfizer' || normalizedName.includes('pfizer')) {
            aliases.add('Pfizer Inc');
            aliases.add('Pfizer Inc.');
        }
        if (slug === 'johnson-johnson' || normalizedName.includes('johnson & johnson')) {
            aliases.add('Johnson & Johnson');
            aliases.add('Janssen');
            aliases.add('J&J');
        }
        return Array.from(aliases);
    }
}
exports.AliasResolutionService = AliasResolutionService;
