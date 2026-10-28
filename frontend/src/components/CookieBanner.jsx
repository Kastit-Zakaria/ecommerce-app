import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fReadConsent, fSaveConsent } from '../utils/cookieConsent';

// CookieBanner : bandeau de consentement aux cookies
// Reçoit : blForceOpen (true si le footer demande de rouvrir le bandeau), fOnClose (fonction appelée après un choix)
// Renvoie : le JSX du bandeau, ou null s'il ne doit pas s'afficher
// Pourquoi : demander le consentement avant tout cookie non essentiel (RGPD) et mémoriser le choix
const CookieBanner = ({ blForceOpen, fOnClose }) => {
    const [strConsent, fSetStrConsent] = useState(fReadConsent());

    // fHandleChoice : mémorise le choix puis ferme le bandeau
    // Reçoit : strChoice ('accepted' ou 'refused')
    // Renvoie : rien
    // Pourquoi : conserver le choix d'une visite à l'autre
    const fHandleChoice = (strChoice) => {
        fSaveConsent(strChoice);
        fSetStrConsent(strChoice);
        fOnClose();
    };

    if (strConsent !== null && !blForceOpen) {
        return null;
    }

    return (
        <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
            <div className="cookie-banner__inner">
                <div className="cookie-banner__text">
                    <h2 className="cookie-banner__title" id="cookie-banner-title">Vos choix en matière de cookies</h2>
                    <p className="cookie-banner__paragraph">
                        Nous utilisons uniquement les cookies nécessaires au fonctionnement du site. Avec votre accord,
                        nous pourrons en utiliser d'autres. Votre choix est modifiable à tout moment.{' '}
                        <Link to="/cookies" className="cookie-banner__link">En savoir plus</Link>
                    </p>
                </div>
                <div className="cookie-banner__actions">
                    <button type="button" className="cookie-banner__button" onClick={() => fHandleChoice('refused')}>
                        Refuser
                    </button>
                    <button type="button" className="cookie-banner__button" onClick={() => fHandleChoice('accepted')}>
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
