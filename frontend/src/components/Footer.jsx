import { Link } from 'react-router-dom';

// Footer : pied de page (newsletter, colonnes de liens, réseaux, mentions)
// Reçoit : rien
// Renvoie : le JSX du pied de page
// Pourquoi : offrir la navigation secondaire et l'inscription à la newsletter
const Footer = () => {
    const intCurrentYear = new Date().getFullYear();

    // fHandleNewsletterSubmit : bloque l'envoi réel du formulaire newsletter
    // Reçoit : objEvent (l'événement de soumission)
    // Renvoie : rien
    // Pourquoi : éviter le rechargement de la page (l'inscription n'est pas encore branchée)
    const fHandleNewsletterSubmit = (objEvent) => {
        objEvent.preventDefault();
    };

    return (
        <footer className="footer">

            {/* 1. Bande newsletter */}
            <section className="footer__newsletter" aria-label="Newsletter">
                <div className="footer__container footer__newsletter-inner">
                    <div className="footer__newsletter-text">
                        <p className="footer__overline">Newsletter</p>
                        <h2 className="footer__newsletter-title">Les nouveautés en avant-première</h2>
                    </div>

                    <form className="footer__form" onSubmit={fHandleNewsletterSubmit}>
                        <label htmlFor="newsletter-email" className="footer__label">Adresse e-mail</label>
                        <div className="footer__form-row">
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="vous@exemple.com"
                                className="footer__input"
                            />
                            <button type="submit" className="footer__submit">S'inscrire</button>
                        </div>
                        <p className="footer__hint">Désinscription possible à tout moment.</p>
                    </form>
                </div>
            </section>

            {/* 2. Colonnes de liens */}
            <div className="footer__container footer__columns">
                <nav className="footer__column" aria-label="Boutique">
                    <h3 className="footer__heading">Boutique</h3>
                    <a href="#" className="footer__link">Femmes</a>
                    <a href="#" className="footer__link">Hommes</a>
                    <a href="#" className="footer__link">Enfants</a>
                    <a href="#" className="footer__link">Accessoires</a>
                    <a href="#" className="footer__link">Nouveautés</a>
                </nav>

                <nav className="footer__column" aria-label="Aide">
                    <h3 className="footer__heading">Aide</h3>
                    <a href="#" className="footer__link">Service client</a>
                    <a href="#" className="footer__link">Livraison</a>
                    <a href="#" className="footer__link">Retours et remboursements</a>
                    <a href="#" className="footer__link">Guide des tailles</a>
                    <a href="#" className="footer__link">Suivre ma commande</a>
                </nav>

                <nav className="footer__column" aria-label="À propos">
                    <h3 className="footer__heading">À propos</h3>
                    <Link to="/about" className="footer__link">Qui sommes-nous</Link>
                    <a href="#" className="footer__link">Nos magasins</a>
                    <a href="#" className="footer__link">Contact</a>
                </nav>

                <div className="footer__column">
                    <h3 className="footer__heading">Suivez-nous</h3>
                    <div className="footer__socials">
                        <a href="#" className="footer__social" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                                <circle cx="12" cy="12" r="4"></circle>
                                <circle cx="17.5" cy="6.5" r="0.8"></circle>
                            </svg>
                        </a>
                        <a href="#" className="footer__social" aria-label="Facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"></path>
                            </svg>
                        </a>
                        <a href="#" className="footer__social" aria-label="TikTok">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <path d="M14 4v11a3.5 3.5 0 1 1-3.5-3.5"></path>
                                <path d="M14 4c.5 2.5 2.5 4 5 4"></path>
                            </svg>
                        </a>
                    </div>
                    <p className="footer__payments">Paiement sécurisé · Bancontact · Visa · Mastercard</p>
                </div>
            </div>

            {/* 3. Barre finale */}
            <div className="footer__bottom">
                <div className="footer__container footer__bottom-inner">
                    <span className="footer__logo">Sera</span>
                    <nav className="footer__legal" aria-label="Mentions légales">
                        <a href="#" className="footer__legal-link">Conditions générales de vente</a>
                        <a href="#" className="footer__legal-link">Confidentialité</a>
                        <a href="#" className="footer__legal-link">Cookies</a>
                    </nav>
                    <span className="footer__copyright">Belgique · FR — © {intCurrentYear} SERA</span>
                </div>
            </div>

        </footer>
    );
};

export default Footer;