// fFormatPrice : transforme un nombre en prix au format belge (64.9 → "64,90 €")
// Reçoit : flPrice (nombre), le prix brut venant de l'API
// Renvoie : une chaîne (string) formatée en euros
// Pourquoi : afficher tous les prix de la même façon sur le site
const fFormatPrice = (flPrice) => {
    return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(flPrice);
};

export default fFormatPrice;