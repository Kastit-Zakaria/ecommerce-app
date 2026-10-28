import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';
import objCompany, { fFormatAddress } from '../config/company';

// Cgv : page « Conditions générales de vente »
// Reçoit : rien
// Renvoie : le JSX de la page
// Pourquoi : informer le consommateur des règles applicables à ses achats (droit belge)
const Cgv = () => {
    return (
        <LegalPage strTitle="Conditions générales de vente" strUpdated="octobre 2026">
            <h2 className="legal-page__heading">1. Vendeur et champ d'application</h2>
            <p>
                Les présentes conditions régissent les ventes de vêtements et d'accessoires conclues à distance entre
                {objCompany.strLegalName} ({fFormatAddress()}, numéro d'entreprise {objCompany.strBce}, e-mail{' '}
                <a href={`mailto:${objCompany.strEmail}`}>{objCompany.strEmail}</a>, voir aussi les{' '}
                <Link to="/mentions-legales">mentions légales</Link>) et toute personne agissant en tant
                que consommateur. Passer commande implique l'acceptation de ces conditions.
            </p>

            <h2 className="legal-page__heading">2. Prix</h2>
            <p>
                Les prix sont indiqués en euros (€), toutes taxes comprises (TTC), TVA belge incluse. Les frais de
                livraison sont indiqués avant la validation de la commande. Le prix applicable est celui affiché au
                moment de la commande.
            </p>

            <h2 className="legal-page__heading">3. Commande</h2>
            <p>
                Le client choisit ses articles, vérifie son récapitulatif puis valide sa commande en cliquant sur le
                bouton « Commander avec obligation de paiement ». La vente est conclue à la confirmation de la commande,
                envoyée par e-mail. SERA peut refuser ou annuler une commande en cas de stock épuisé ou d'erreur
                manifeste de prix ; le client est alors remboursé intégralement.
            </p>

            <h2 className="legal-page__heading">4. Paiement</h2>
            <p>
                Le paiement s'effectue en ligne par Bancontact, Visa ou Mastercard. Il est exigible à la commande.
                Les transactions sont sécurisées par un prestataire de paiement agréé ; SERA ne conserve aucune
                donnée de carte bancaire.
            </p>

            <h2 className="legal-page__heading">5. Livraison</h2>
            <p>
                La livraison est assurée en Belgique à l'adresse indiquée par le client, dans un délai de 2 à 4 jours
                ouvrables à compter de la confirmation de la commande, et au plus tard 30 jours. En cas de retard de livraison, le client peut demander la résolution de la vente selon les
                règles légales.
            </p>

            <h2 className="legal-page__heading">6. Droit de rétractation (14 jours)</h2>
            <p>
                Le client dispose de 14 jours calendrier, à compter de la réception des articles, pour se rétracter
                sans donner de motif. Il informe SERA de sa décision par une déclaration claire (e-mail à l'adresse de
                contact ou formulaire type de rétractation) puis renvoie les articles au plus tard 14 jours après cette
                déclaration, non portés, dans leur état d'origine.
            </p>
            <p>
                SERA rembourse tous les paiements reçus, y compris les frais de livraison standard, au plus tard
                14 jours après avoir été informée de la rétractation, en utilisant le même moyen de paiement. Les frais
                de renvoi sont à charge du client. SERA peut différer le remboursement jusqu'à réception
                des articles ou preuve de leur renvoi.
            </p>

            <h2 className="legal-page__heading">7. Retours et remboursements</h2>
            <p>
                Les articles doivent être retournés avec leurs étiquettes et leur emballage, à l'adresse indiquée dans
                la confirmation de commande ({fFormatAddress()}). Un article porté, lavé ou abîmé par le client peut donner lieu à une
                réduction du remboursement proportionnelle à la dépréciation.
            </p>

            <h2 className="legal-page__heading">8. Garantie légale de conformité (2 ans)</h2>
            <p>
                Le vendeur répond de tout défaut de conformité existant lors de la livraison et apparaissant dans un
                délai de deux ans à compter de celle-ci. Le client peut obtenir la réparation ou le remplacement du
                bien, puis, à défaut, une réduction du prix ou la résolution de la vente. Cette garantie légale
                s'applique sans frais pour le client et sans préjudice de ses autres droits.
            </p>

            <h2 className="legal-page__heading">9. Données personnelles</h2>
            <p>
                Les données collectées sont traitées conformément à la <Link to="/confidentialite">politique de confidentialité</Link>.
            </p>

            <h2 className="legal-page__heading">10. Litiges et droit applicable</h2>
            <p>
                Le droit belge est applicable. En cas de litige, le client peut d'abord contacter SERA à l'adresse
                indiquée dans les mentions légales. À défaut de solution amiable, il peut recourir gratuitement au
                service de médiation pour le consommateur (Belmed, <a href="https://www.belmed.fgov.be">www.belmed.fgov.be</a>)
                ou saisir les tribunaux belges compétents.
            </p>
        </LegalPage>
    );
};

export default Cgv;
