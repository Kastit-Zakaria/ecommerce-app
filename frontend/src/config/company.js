// objCompany : informations légales de la société, utilisées par toutes les pages et le footer
// Pourquoi : une seule source pour que les informations soient identiques partout sur le site
const objCompany = {
    strBrand: 'SERA',
    strLegalName: 'SERA SRL',
    strStreet: 'Rue des Teinturiers 27',
    strPostalCode: '1000',
    strCity: 'Bruxelles',
    strCountry: 'Belgique',
    strEmail: 'contact@sera.be',
    strPhone: '+32 2 123 45 67',
    strBce: 'BE 0712.345.678',
    strVat: 'BE 0712.345.678',
    strPublisher: 'La gérance de SERA SRL',
    strHostName: 'Nuage Hosting SRL',
    strHostAddress: 'Boulevard du Jubilé 75, 1080 Bruxelles, Belgique',
    strHostWebsite: 'https://www.nuagehosting.be',
};

// fFormatAddress : assemble l'adresse complète de la société sur une ligne
// Reçoit : rien
// Renvoie : une chaîne, ex. « Rue des Teinturiers 27, 1000 Bruxelles, Belgique »
// Pourquoi : afficher la même adresse dans les mentions légales, les CGV, la confidentialité et le footer
export const fFormatAddress = () => {
    return `${objCompany.strStreet}, ${objCompany.strPostalCode} ${objCompany.strCity}, ${objCompany.strCountry}`;
};

export default objCompany;
