import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CategoryList from './CategoryList';
import LoginModal from './LoginModal';
import useAuth from '../context/useAuth';

// Header : bandeau d'annonce + barre de navigation (logo, catégories, actions)
// Reçoit : objSelectedCategory (catégorie active ou null), fOnSelectCategory (fonction pour la changer)
// Renvoie : le JSX de l'en-tête
// Pourquoi : donner un accès permanent aux catégories et au retour à l'accueil
const Header = ({ objSelectedCategory, fOnSelectCategory }) => {
    const fNavigate = useNavigate();
    const objLocation = useLocation();
    const { objUser, fLogout } = useAuth();
    const [blLoginOpen, fSetBlLoginOpen] = useState(false);
    const [blMenuOpen, fSetBlMenuOpen] = useState(false);
    const [strLogoutError, fSetStrLogoutError] = useState('');

    const objAccountZoneRef = useRef(null);
    const objAccountButtonRef = useRef(null);
    const objFirstOptionRef = useRef(null);

    // Redirection d'un visiteur depuis une page de membre : la route demande l'ouverture du modal
    // (la demande est effacée à la fermeture du modal, pour qu'un rechargement ne le rouvre pas)
    let blLoginRequested = false;
    if (objLocation.state) {
        if (objLocation.state.blOpenLogin) {
            blLoginRequested = true;
        }
    }

    // fCloseMenu : ferme le dropdown du compte
    // Reçoit : blRestoreFocus (true pour rendre le focus à l'icône compte)
    // Renvoie : rien
    // Pourquoi : un clic extérieur ne doit pas voler le focus, contrairement à Échap ou au choix d'une option
    const fCloseMenu = (blRestoreFocus) => {
        fSetBlMenuOpen(false);
        fSetStrLogoutError('');
        if (blRestoreFocus) {
            objAccountButtonRef.current.focus();
        }
    };

    // À l'ouverture du dropdown : focus sur la première option
    useEffect(() => {
        if (blMenuOpen) {
            objFirstOptionRef.current.focus();
        }
    }, [blMenuOpen]);

    // Dropdown ouvert : Échap et clic extérieur le ferment
    useEffect(() => {
        if (!blMenuOpen) {
            return undefined;
        }

        // fHandleKeyDown : ferme le dropdown avec Échap
        // Reçoit : objEvent (l'événement clavier)
        // Renvoie : rien
        // Pourquoi : permettre de fermer au clavier, avec retour du focus sur l'icône
        const fHandleKeyDown = (objEvent) => {
            if (objEvent.key === 'Escape') {
                fCloseMenu(true);
            }
        };

        // fHandleMouseDown : ferme le dropdown si le clic est hors de la zone compte
        // Reçoit : objEvent (l'événement souris)
        // Renvoie : rien
        // Pourquoi : fermer au clic extérieur sans déplacer le focus
        const fHandleMouseDown = (objEvent) => {
            if (!objAccountZoneRef.current.contains(objEvent.target)) {
                fCloseMenu(false);
            }
        };

        document.addEventListener('keydown', fHandleKeyDown);
        document.addEventListener('mousedown', fHandleMouseDown);

        // Nettoyage : exécuté à la fermeture du dropdown
        return () => {
            document.removeEventListener('keydown', fHandleKeyDown);
            document.removeEventListener('mousedown', fHandleMouseDown);
        };
    }, [blMenuOpen]);

    // fHandleAccountClick : visiteur → ouvre le modal de connexion ; membre → ouvre ou ferme le dropdown
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : se connecter ou accéder aux options du compte depuis n'importe quelle page
    const fHandleAccountClick = () => {
        if (objUser === null) {
            fSetBlLoginOpen(true);
        } else if (blMenuOpen) {
            fCloseMenu(true);
        } else {
            fSetBlMenuOpen(true);
        }
    };

    // fHandleLogout : déconnecte le membre depuis le dropdown
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : redevenir visiteur ; en cas d'échec le dropdown reste ouvert avec le message d'erreur
    const fHandleLogout = async () => {
        fSetStrLogoutError('');
        try {
            await fLogout();
            fCloseMenu(true);
        } catch (objError) {
            fSetStrLogoutError(objError.message);
        }
    };

    // fHandleCloseLogin : ferme le modal de connexion
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : fournir la fonction de fermeture au modal
    const fHandleCloseLogin = () => {
        fSetBlLoginOpen(false);
        if (blLoginRequested) {
            fNavigate(objLocation.pathname, { replace: true, state: null });
        }
    };

    // Attributs ARIA du bouton compte : modal pour un visiteur, disclosure (aria-expanded + aria-controls) pour un membre
    const objAccountAria = {};
    if (objUser === null) {
        objAccountAria['aria-haspopup'] = 'dialog';
    } else {
        objAccountAria['aria-expanded'] = blMenuOpen;
        objAccountAria['aria-controls'] = 'account-panel';
    }

    let strWelcome = '';
    if (objUser !== null) {
        strWelcome = 'Bienvenue, ' + objUser.firstName;
    }

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
                        {/* Zone de statut toujours présente : le message est annoncé à l'apparition */}
                        <p className="header__welcome" role="status">{strWelcome}</p>

                        <button type="button" className="header__action" aria-label="Rechercher">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <circle cx="11" cy="11" r="7"></circle>
                                <path d="M20 20l-3.5-3.5"></path>
                            </svg>
                        </button>

                        <div className="header__account" ref={objAccountZoneRef}>
                            <button
                                ref={objAccountButtonRef}
                                type="button"
                                className="header__action"
                                aria-label="Mon compte"
                                {...objAccountAria}
                                onClick={fHandleAccountClick}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                    <circle cx="12" cy="8" r="4"></circle>
                                    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>
                                </svg>
                            </button>

                            {/* Panneau « disclosure » réservé aux membres : liste simple parcourue avec Tab (sans rôle menu) */}
                            {objUser !== null && (
                                <div id="account-panel" className="header__panel" hidden={!blMenuOpen}>
                                    <ul className="header__panel-list">
                                        <li>
                                            <Link
                                                ref={objFirstOptionRef}
                                                to="/mon-compte"
                                                className="header__panel-option"
                                                onClick={() => fCloseMenu(true)}
                                            >
                                                Paramètres
                                            </Link>
                                        </li>
                                        <li>
                                            <button type="button" className="header__panel-option" onClick={fHandleLogout}>
                                                Se déconnecter
                                            </button>
                                        </li>
                                    </ul>
                                    {/* Zone d'alerte toujours présente : l'erreur est annoncée à son apparition */}
                                    <div role="alert" className="header__panel-alert">
                                        {strLogoutError !== '' && <p className="header__panel-error">{strLogoutError}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

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

            {(blLoginOpen || blLoginRequested) && <LoginModal fOnClose={fHandleCloseLogin} />}
        </>
    );
};

export default Header;
