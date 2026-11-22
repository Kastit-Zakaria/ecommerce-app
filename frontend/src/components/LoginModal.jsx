import { useState, useRef } from 'react';
import useAuth from '../context/useAuth';
import useModalBehavior from '../hooks/useModalBehavior';

// LoginModal : fenêtre de connexion (email = login + mot de passe)
// Reçoit : fOnClose (fonction pour fermer le modal),
//          fOnSwitchToRegister (facultative : affiche le lien « Créer un compte » qui ouvre l'inscription)
// Renvoie : le JSX du modal
// Pourquoi : permettre de se connecter depuis n'importe quelle page sans la quitter
const LoginModal = ({ fOnClose, fOnSwitchToRegister }) => {
    const { fLogin } = useAuth();

    const [strEmail, fSetStrEmail] = useState('');
    const [strPassword, fSetStrPassword] = useState('');
    const [strError, fSetStrError] = useState('');
    const [blLoading, fSetBlLoading] = useState(false);

    const objDialogRef = useRef(null);
    const objEmailRef = useRef(null);
    const objPasswordRef = useRef(null);

    // Focus initial sur l'email, retour du focus, Échap, piège de Tab et blocage du défilement
    useModalBehavior(objDialogRef, objEmailRef, fOnClose);

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

                    {fOnSwitchToRegister && (
                        <p className="login-modal__switch">
                            Pas encore de compte ?{' '}
                            <button type="button" className="login-modal__link" onClick={fOnSwitchToRegister}>
                                Créer un compte
                            </button>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
