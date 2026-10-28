import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';
import objCompany, { fFormatAddress } from '../config/company';

// Confidentialite : page « Politique de confidentialité » (RGPD)
// Reçoit : rien
// Renvoie : le JSX de la page
// Pourquoi : informer les personnes de la collecte et de l'usage de leurs données personnelles
const Confidentialite = () => {
    return (
        <LegalPage strTitle="Politique de confidentialité" strUpdated="octobre 2026">
            <h2 className="legal-page__heading">1. Responsable du traitement</h2>
            <p>
                {objCompany.strLegalName}, {fFormatAddress()}, numéro d'entreprise {objCompany.strBce}.
                Contact : <a href={`mailto:${objCompany.strEmail}`}>{objCompany.strEmail}</a>, {objCompany.strPhone}.
            </p>

            <h2 className="legal-page__heading">2. Données collectées</h2>
            <p>
                Via le formulaire d'inscription à la newsletter, nous collectons uniquement votre <strong>adresse e-mail</strong>
                ainsi que la <strong>date de votre consentement</strong>.
            </p>

            <h2 className="legal-page__heading">3. Finalité</h2>
            <p>Vous envoyer notre newsletter (nouveautés, offres) et conserver la preuve de votre consentement.</p>

            <h2 className="legal-page__heading">4. Base légale</h2>
            <p>
                Votre consentement (article 6, 1., a) du RGPD), donné en cochant la case prévue à cet effet. La case
                n'est jamais pré-cochée et l'inscription est impossible sans elle.
            </p>

            <h2 className="legal-page__heading">5. Durée de conservation</h2>
            <p>
                Votre adresse est conservée jusqu'au retrait de votre consentement (désinscription) ou, à défaut,
                3 ans après notre dernier contact avec vous. Elle est ensuite supprimée.
            </p>

            <h2 className="legal-page__heading">6. Destinataires</h2>
            <p>
                Vos données ne sont ni vendues ni cédées. Elles peuvent être traitées par nos prestataires techniques
                (hébergement : {objCompany.strHostName} ; envoi d'e-mails), liés par un contrat de sous-traitance.
            </p>

            <h2 className="legal-page__heading">7. Vos droits</h2>
            <p>Vous disposez des droits suivants, que vous pouvez exercer à tout moment :</p>
            <ul>
                <li>droit d'accès à vos données ;</li>
                <li>droit de rectification ;</li>
                <li>droit à l'effacement (« droit à l'oubli ») ;</li>
                <li>droit de retirer votre consentement, sans effet sur les traitements antérieurs ;</li>
                <li>droit à la limitation du traitement, d'opposition et à la portabilité.</li>
            </ul>
            <p>
                Pour les exercer, écrivez-nous à <a href={`mailto:${objCompany.strEmail}`}>{objCompany.strEmail}</a>.
                Nous répondons dans un délai d'un mois.
            </p>

            <h2 className="legal-page__heading">8. Réclamation</h2>
            <p>
                Vous pouvez introduire une plainte auprès de l'Autorité de protection des données (APD), rue de la
                Presse 35, 1000 Bruxelles, <a href="https://www.autoriteprotectiondonnees.be">www.autoriteprotectiondonnees.be</a>.
            </p>

            <h2 className="legal-page__heading">9. Cookies</h2>
            <p>Voir la <Link to="/cookies">politique cookies</Link>.</p>
        </LegalPage>
    );
};

export default Confidentialite;
