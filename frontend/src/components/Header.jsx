import { Link, useNavigate } from 'react-router-dom';
import CategoryList from './CategoryList';

// Header : bandeau d'annonce + barre de navigation (logo, catégories, actions)
// Reçoit : objSelectedCategory (catégorie active ou null), fOnSelectCategory (fonction pour la changer)
// Renvoie : le JSX de l'en-tête
// Pourquoi : donner un accès permanent aux catégories et au retour à l'accueil
const Header = ({ objSelectedCategory, fOnSelectCategory }) => {
    const fNavigate = useNavigate();

    // fHandleSelectCategory : sélectionne une catégorie et va sur l'accueil
    // Reçoit : objCategory (la catégorie cliquée)
    // Renvoie : rien
    // Pourquoi : voir les produits de la catégorie depuis n'importe quelle page
    const fHandleSelectCategory = (objCategory) => {
        fOnSelectCategory(objCategory);
        fNavigate('/');
    };

    // fHandleLogoClick : remet l'accueil à zéro et remonte en haut de la page
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : le clic sur le logo ramène à l'état initial du site
    const fHandleLogoClick = () => {
        fOnSelectCategory(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Bandeau d'annonce : défile avec la page */}
            <div className="announcement">
                Livraison offerte dès 50 € · Retours gratuits
            </div>

            {/* Navigation : reste collée en haut de l'écran */}
            <header className="header">
                <div className="header__main">
                    <Link to="/" className="header__logo" onClick={fHandleLogoClick}>Sera</Link>

                    <div className="header__categories">
                        <CategoryList
                            objSelectedCategory={objSelectedCategory}
                            fOnSelect={fHandleSelectCategory}
                        />
                    </div>

                    <div className="header__actions">
                        <button type="button" className="header__action" aria-label="Rechercher">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <circle cx="11" cy="11" r="7"></circle>
                                <path d="M20 20l-3.5-3.5"></path>
                            </svg>
                        </button>

                        <button type="button" className="header__action" aria-label="Mon compte">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <circle cx="12" cy="8" r="4"></circle>
                                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>
                            </svg>
                        </button>

                        <button type="button" className="header__action" aria-label="Favoris">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path>
                            </svg>
                        </button>

                        <button type="button" className="header__action" aria-label="Panier">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M6 7h12l-1 14H7L6 7z"></path>
                                <path d="M9 7a3 3 0 0 1 6 0"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;