// Clé de stockage du choix de l'utilisateur dans le navigateur
export const STR_CONSENT_KEY = 'sera-cookie-consent';

// fReadConsent : lit le choix mémorisé dans le navigateur
// Reçoit : rien
// Renvoie : 'accepted', 'refused' ou null si aucun choix n'est mémorisé
// Pourquoi : savoir s'il faut afficher le bandeau
export const fReadConsent = () => {
    try {
        return localStorage.getItem(STR_CONSENT_KEY);
    } catch {
        return null;
    }
};

// fSaveConsent : mémorise le choix dans le navigateur
// Reçoit : strChoice ('accepted' ou 'refused')
// Renvoie : rien
// Pourquoi : conserver le choix d'une visite à l'autre
export const fSaveConsent = (strChoice) => {
    try {
        localStorage.setItem(STR_CONSENT_KEY, strChoice);
    } catch {
        console.error('Impossible de mémoriser le choix de consentement.');
    }
};
