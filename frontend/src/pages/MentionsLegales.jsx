import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';
import objCompany, { fFormatAddress } from '../config/company';

// MentionsLegales : page « Mentions légales »
// Reçoit : rien
// Renvoie : le JSX de la page
// Pourquoi : identifier l'éditeur et l'hébergeur du site (obligation d'information du droit belge)
const MentionsLegales = () => {
    return (
        <LegalPage strTitle="Mentions légales" strUpdated="octobre 2026">
            <h2 className="legal-page__heading">Éditeur du site</h2>
            <ul>
                <li>Dénomination : {objCompany.strLegalName}</li>
                <li>Adresse du siège : {fFormatAddress()}</li>
                <li>E-mail : <a href={`mailto:${objCompany.strEmail}`}>{objCompany.strEmail}</a></li>
                <li>Téléphone : {objCompany.strPhone}</li>
                <li>Numéro d'entreprise (BCE) : {objCompany.strBce}</li>
                <li>Numéro de TVA : {objCompany.strVat}</li>
                <li>Directeur de la publication : {objCompany.strPublisher}</li>
            </ul>

            <h2 className="legal-page__heading">Hébergeur</h2>
            <ul>
                <li>Société : {objCompany.strHostName}</li>
                <li>Adresse : {objCompany.strHostAddress}</li>
                <li>Site web : <a href={objCompany.strHostWebsite}>{objCompany.strHostWebsite}</a></li>
            </ul>

            <h2 className="legal-page__heading">Propriété intellectuelle</h2>
            <p>
                Les textes, images, vidéos, logos et la structure du site sont protégés par le droit d'auteur.
                Toute reproduction sans autorisation écrite préalable de l'éditeur est interdite.
            </p>

            <h2 className="legal-page__heading">Responsabilité</h2>
            <p>
                L'éditeur s'efforce de fournir des informations exactes et à jour, sans garantie d'exhaustivité.
                Il ne peut être tenu responsable d'une indisponibilité temporaire du site ni du contenu des sites
                tiers vers lesquels le site pourrait renvoyer.
            </p>

            <h2 className="legal-page__heading">Données personnelles et cookies</h2>
            <p>
                Voir la <Link to="/confidentialite">politique de confidentialité</Link> et la{' '}
                <Link to="/cookies">politique cookies</Link>.
            </p>

            <h2 className="legal-page__heading">Droit applicable</h2>
            <p>Le site est soumis au droit belge. Les tribunaux belges sont compétents, sous réserve des règles impératives applicables aux consommateurs.</p>
        </LegalPage>
    );
};

export default MentionsLegales;
