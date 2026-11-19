import { useState, useEffect, useRef } from 'react';
import useAuth from '../context/useAuth';

// LoginModal : fenêtre de connexion (email = login + mot de passe)
// Reçoit : fOnClose (fonction pour fermer le modal)
// Renvoie : le JSX du modal
// Pourquoi : permettre de se connecter depuis n'importe quelle page sans la quitter
const LoginModal = ({ fOnClose }) => {
    const { fLogin } = useAuth();

    const [strEmail, fSetStrEmail] = useState('');
    const [strPassword, fSetStrPassword] = useState('');
    const [strError, fSetStrError] = useState('');
    const [blLoading, fSetBlLoading] = useState(false);

    const objDialogRef = useRef(null);
    const objEmailRef = useRef(null);
    const objPasswordRef = useRef(null);

    // 0. Focus : entrer sur le champ email à l'ouverture, revenir à l'icône compte à la fermeture
    useEffect(() => {
        const objPreviousFocus = document.activeElement;
        objEmailRef.current.focus();

        // Nettoyage : exécuté à la fermeture du modal
        return () => {
            if (objPreviousFocus !== null && objPreviousFocus.focus) {
                objPreviousFocus.focus();
            }
        };
    }, []);

    // 1. Échap ferme le modal, Tab reste dans le modal, la page ne défile plus
    useEffect(() => {
        // fHandleKeyDown : gère Échap et le piège du focus
        // Reçoit : objEvent (l'événement clavier)
        // Renvoie : rien
        // Pourquoi : fermer au clavier et empêcher Tab de sortir de la fenêtre
        const fHandleKeyDown = (objEvent) => {
            if (objEvent.key === 'Escape') {
                fOnClose();
                return;
            }

            if (objEvent.key !== 'Tab') {
                return;
            }

            const tbFocusables = objDialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])');
            if (tbFocusables.length === 0) {
                return;
            }

            const objFirst = tbFocusables[0];
            const objLast = tbFocusables[tbFocusables.length - 1];
            const objActive = document.activeElement;
            const blInside = objDialogRef.current.contains(objActive);

            if (objEvent.shiftKey && (objActive === objFirst || !blInside)) {
                objEvent.preventDefault();
                objLast.focus();
            } else if (!objEvent.shiftKey && (objActive === objLast || !blInside)) {
                objEvent.preventDefault();
                objFirst.focus();
            }
        };

        document.addEventListener('keydown', fHandleKeyDown);
        document.body.style.overflow = 'hidden';

        // Nettoyage : exécuté à la fermeture du modal
        return () => {
            document.removeEventListener('keydown', fHandleKeyDown);
            document.body.style.overflow = '';
        };
    }, [fOnClose]);

    // fHandleSubmit : envoie le formulaire
    // Reçoit : objEvent (l'événement de soumission)
    // Renvoie : rien
    // Pourquoi : contrôler les champs, appeler l'API, puis fermer le modal ou afficher l'erreur
    const fHandleSubmit = async (objEvent) => {
        objEvent.preventDefault();

        if (strEmail.trim() === '' || strPassword === '') {
            fSetStrError("L'email et le mot de passe sont obligatoires.");
            return;
        }

        fSetBlLoading(true);
        fSetStrError('');

        try {
            await fLogin(strEmail.trim(), strPassword);
            // Succès : le mot de passe est effacé avant la fermeture
            fSetStrPassword('');
            fOnClose();
        } catch (objError) {
            // Échec : on garde l'email, on efface le mot de passe et on y remet le focus
            fSetStrPassword('');
            fSetStrError(objError.message);
            fSetBlLoading(false);
            objPasswordRef.current.focus();
        }
    };

    let strSubmitLabel = 'Se connecter';
    if (blLoading) {
        strSubmitLabel = 'Connexion…';
    }

    return (
        <div className="product-modal">
            <div className="product-modal__backdrop" onClick={fOnClose}></div>

            <div
                ref={objDialogRef}
                tabIndex={-1}
                className="product-modal__dialog login-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
            >
                <button type="button" className="product-modal__close" onClick={fOnClose} aria-label="Fermer">
                    ✕
                </button>

                <form className="login-modal__form" onSubmit={fHandleSubmit} noValidate>
                    <h2 className="login-modal__title" id="login-modal-title">Connexion</h2>

                    {/* Zone d'alerte toujours présente : le message est annoncé aux lecteurs d'écran à son apparition */}
                    <div role="alert" className="login-modal__alert">
                        {strError !== '' && <p className="login-modal__error">{strError}</p>}
                    </div>

                    <div className="login-modal__field">
                        <label htmlFor="login-email" className="login-modal__label">Adresse e-mail</label>
                        <input
                            ref={objEmailRef}
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            className="login-modal__input"
                            value={strEmail}
                            onChange={(objEvent) => fSetStrEmail(objEvent.target.value)}
                            required
                            aria-required="true"
                        />
                    </div>

                    <div className="login-modal__field">
                        <label htmlFor="login-password" className="login-modal__label">Mot de passe</label>
                        <input
                            ref={objPasswordRef}
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            className="login-modal__input"
                            value={strPassword}
                            onChange={(objEvent) => fSetStrPassword(objEvent.target.value)}
                            required
                            aria-required="true"
                        />
                    </div>

                    <button type="submit" className="product-modal__add login-modal__submit" disabled={blLoading}>
                        {strSubmitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
