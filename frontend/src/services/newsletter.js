import objApi from './api';

// fSubscribeNewsletter : envoie l'inscription à la newsletter au back
// Reçoit : strEmail (adresse saisie), blConsent (true si la case de consentement est cochée)
// Renvoie : une promesse (la réponse HTTP du back)
// Pourquoi : isoler l'appel réseau du composant Footer
const fSubscribeNewsletter = (strEmail, blConsent) => {
    return objApi.post('/newsletter', { email: strEmail, consent: blConsent });
};

export default fSubscribeNewsletter;
