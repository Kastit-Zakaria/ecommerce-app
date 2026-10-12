import { Link, NavLink } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <div className="header__announcement">
                Livraison offerte dès 50 € · Retours gratuits
            </div>

            <div className="header__main">
                <nav className="header__nav" aria-label="Navigation principale">
                    <NavLink to="/" end className="header__link">Accueil</NavLink>
                    <NavLink to="/about" className="header__link">À propos</NavLink>
                </nav>

                <Link to="/" className="header__logo">VESTIA</Link>

                <div className="header__actions">
                    <button type="button" className="header__action">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="M20 20l-3.5-3.5"></path>
                        </svg>
                        <span className="header__action-label">Rechercher</span>
                    </button>

                    <button type="button" className="header__action">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>
                        </svg>
                        <span className="header__action-label">Compte</span>
                    </button>

                    <button type="button" className="header__action">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M6 7h12l-1 14H7L6 7z"></path>
                            <path d="M9 7a3 3 0 0 1 6 0"></path>
                        </svg>
                        <span className="header__action-label">Panier (0)</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;