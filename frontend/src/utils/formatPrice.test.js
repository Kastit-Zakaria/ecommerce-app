import { describe, it, expect } from 'vitest';
import fFormatPrice from './formatPrice';

// fNormalize : remplace les espaces insécables produits par Intl par des espaces normaux
// Reçoit : strText, le texte à normaliser
// Renvoie : le texte normalisé
// Pourquoi : comparer les prix formatés simplement dans les tests
const fNormalize = (strText) => {
    return strText.replace(/[  ]/g, ' ');
};

describe('fFormatPrice', () => {
    it('formate un prix décimal au format belge', () => {
        expect(fNormalize(fFormatPrice(64.9))).toBe('64,90 €');
    });

    it('formate un prix entier avec deux décimales', () => {
        expect(fNormalize(fFormatPrice(20))).toBe('20,00 €');
    });

    it('formate zéro', () => {
        expect(fNormalize(fFormatPrice(0))).toBe('0,00 €');
    });
});
