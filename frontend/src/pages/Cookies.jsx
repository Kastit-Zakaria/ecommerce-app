import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';
import objCompany, { fFormatAddress } from '../config/company';

// Cookies : page « Politique cookies »
// Reçoit : rien
// Renvoie : le JSX de la page
// Pourquoi : expliquer quels cookies ou stockages sont utilisés, et pourquoi
const Cookies = () => {
    return (
        <LegalPage strTitle="Politique cookies" strUpdated="octobre 2026">
            <h2 className="legal-page__heading">Ce que nous utilisons</h2>
            <p>
                À ce jour, le site n'utilise <strong>aucun cookie de mesure d'audience, de publicité ou de traçage</strong>,
                et aucun service tiers déposant des cookies. Les polices sont hébergées sur notre propre site, sans
                appel à des serveurs externes. Seul un cookie de session, strictement nécessaire, est déposé lorsque
                vous vous connectez à votre compte.
            </p>

            <table className="legal-page__table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Finalité</th>
                        <th>Durée</th>
                        <th>Consentement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>sera-cookie-consent</td>
                        <td>Stockage local du navigateur (localStorage)</td>
                        <td>Mémoriser votre choix concernant les cookies (accepté ou refusé)</td>
                        <td>Jusqu'à ce que vous l'effaciez ou modifiiez votre choix</td>
                        <td>Strictement nécessaire : aucun consentement requis</td>
                    </tr>
                    <tr>
                        <td>JSESSIONID</td>
                        <td>Cookie de session (HttpOnly, Secure en production)</td>
                        <td>Maintenir votre connexion pendant votre visite</td>
                        <td>Jusqu'à la fermeture du navigateur ou après une période d'inactivité ; déposé uniquement à la connexion</td>
                        <td>Strictement nécessaire : aucun consentement requis</td>
                    </tr>
                </tbody>
            </table>

            <h2 className="legal-page__heading">Votre choix</h2>
            <p>
                Lors de votre première visite, un bandeau vous propose d'accepter ou de refuser les cookies non
                essentiels. Les deux options ont la même importance. Si nous en ajoutons un jour, ils ne seront
                déposés qu'avec votre accord.
            </p>
            <p>
                Vous pouvez modifier votre choix à tout moment avec le lien « Gérer les cookies » en bas de chaque page,
                ou supprimer les données du site dans les paramètres de votre navigateur.
            </p>

            <h2 className="legal-page__heading">Pour en savoir plus</h2>
            <p>
                Consultez notre <Link to="/confidentialite">politique de confidentialité</Link> pour le traitement de vos
                données personnelles.
            </p>

            <h2 className="legal-page__heading">Contact</h2>
            <p>
                {objCompany.strLegalName}, {fFormatAddress()}, numéro d'entreprise {objCompany.strBce}.
                E-mail : <a href={`mailto:${objCompany.strEmail}`}>{objCompany.strEmail}</a>, téléphone : {objCompany.strPhone}.
            </p>
        </LegalPage>
    );
};

export default Cookies;
