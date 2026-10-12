// Transforme un nombre en prix au format belge : 64.9 → "64,90 €"
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(price);
};

export default formatPrice;