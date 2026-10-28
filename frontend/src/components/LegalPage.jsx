// LegalPage : gabarit commun des pages légales (titre, date de mise à jour, contenu)
// Reçoit : strTitle (titre de la page), strUpdated (date de dernière mise à jour), children (contenu de la page)
// Renvoie : le JSX de la page
// Pourquoi : garder le même style sur toutes les pages légales
const LegalPage = ({ strTitle, strUpdated, children }) => {
    return (
        <main className="legal-page">
            <p className="legal-page__overline">Informations légales</p>
            <h1 className="legal-page__title">{strTitle}</h1>
            <p className="legal-page__notice">Dernière mise à jour : {strUpdated}.</p>
            {children}
        </main>
    );
};

export default LegalPage;
