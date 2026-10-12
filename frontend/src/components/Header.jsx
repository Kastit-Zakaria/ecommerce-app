import { Link, useNavigate } from 'react-router-dom';
import CategoryList from './CategoryList';

const Header = ({ selectedCategory, onSelectCategory }) => {
    const navigate = useNavigate();

    // Clic sur une catégorie : on la sélectionne et on va sur l'accueil
    const handleSelectCategory = (category) => {
        onSelectCategory(category);
        navigate('/');
    };

    // Clic sur le logo : on remet l'accueil à zéro et on remonte en haut
    const handleLogoClick = () => {
        onSelectCategory(null);
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
                    <Link to="/" className="header__logo" onClick={handleLogoClick}>Sera</Link>

                    <div className="header__categories">
                        <CategoryList
                            selectedCategory={selectedCategory}
                            onSelect={handleSelectCategory}
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