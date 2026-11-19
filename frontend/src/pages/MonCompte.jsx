import useAuth from '../context/useAuth';

// MonCompte : affiche en lecture seule les informations du membre connecté
// Reçoit : rien
// Renvoie : le JSX de la page (titre « Mon compte », prénom, nom, adresse e-mail)
// Pourquoi : donner une destination à l'option « Paramètres » ; la modification viendra plus tard
const MonCompte = () => {
    const { objUser } = useAuth();

    // Cette page est protégée par MemberRoute ; garde-fou si elle est rendue sans membre
    if (objUser === null) {
        return null;
    }

    return (
        <main className="account-page">
            <h1 className="account-page__title">Mon compte</h1>

            <dl className="account-page__list">
                <div className="account-page__row">
                    <dt className="account-page__label">Prénom</dt>
                    <dd className="account-page__value">{objUser.firstName}</dd>
                </div>
                <div className="account-page__row">
                    <dt className="account-page__label">Nom</dt>
                    <dd className="account-page__value">{objUser.lastName}</dd>
                </div>
                <div className="account-page__row">
                    <dt className="account-page__label">Adresse e-mail</dt>
                    <dd className="account-page__value">{objUser.email}</dd>
                </div>
            </dl>
        </main>
    );
};

export default MonCompte;
