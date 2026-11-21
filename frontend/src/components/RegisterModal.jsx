import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import useModalBehavior from '../hooks/useModalBehavior';

// Longueur minimale du mot de passe (même règle que l'API)
const INT_PASSWORD_MIN_LENGTH = 8;

// BCrypt n'utilise que les 72 premiers octets du mot de passe (même règle que l'API)
const INT_PASSWORD_MAX_BYTES = 72;

// Forme minimale d'un email : quelque chose, une arobase, un domaine avec un point, sans espace
const OBJ_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Champs du formulaire, dans l'ordre d'affichage (longueurs maximales = colonnes de la table users)
const TB_FIELDS = [
    { strName: 'lastName', strLabel: 'Nom', strType: 'text', strAutoComplete: 'family-name', intMaxLength: 100 },
    { strName: 'firstName', strLabel: 'Prénom', strType: 'text', strAutoComplete: 'given-name', intMaxLength: 100 },
    { strName: 'address', strLabel: 'Adresse', strType: 'text', strAutoComplete: 'street-address', intMaxLength: 255 },
    { strName: 'postalCode', strLabel: 'Code postal', strType: 'text', strAutoComplete: 'postal-code', intMaxLength: 10 },
    { strName: 'city', strLabel: 'Ville', strType: 'text', strAutoComplete: 'address-level2', intMaxLength: 100 },
    { strName: 'email', strLabel: 'Adresse e-mail', strType: 'email', strAutoComplete: 'email', intMaxLength: 255 },
    { strName: 'password', strLabel: 'Mot de passe', strType: 'password', strAutoComplete: 'new-password', intMaxLength: null },
];

const OBJ_EMPTY_FORM = {
    lastName: '',
    firstName: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    password: '',
};

// RegisterModal : fenêtre d'inscription d'un visiteur
// Reçoit : fOnClose (fonction pour fermer le modal), fOnSwitchToLogin (ouvre la connexion à la place)
// Renvoie : le JSX du modal
// Pourquoi : permettre de créer un compte depuis n'importe quelle page ; le membre est connecté dès la création
const RegisterModal = ({ fOnClose, fOnSwitchToLogin }) => {
    const { fRegister } = useAuth();

    const [objForm, fSetObjForm] = useState(OBJ_EMPTY_FORM);
    const [strError, fSetStrError] = useState('');
    const [blLoading, fSetBlLoading] = useState(false);

    const objDialogRef = useRef(null);
    const objFirstFieldRef = useRef(null);
    // Champs du formulaire, rangés par nom, pour y placer le focus en cas d'erreur
    const objFieldRefs = useRef({});

    // Focus initial sur le nom, retour du focus, Échap, piège de Tab et blocage du défilement
    useModalBehavior(objDialogRef, objFirstFieldRef, fOnClose);

    // fHandleChange : met à jour un champ du formulaire
    // Reçoit : objEvent (l'événement de saisie ; le nom du champ est dans objEvent.target.name)
    // Renvoie : rien
    // Pourquoi : un seul gestionnaire pour les sept champs
    const fHandleChange = (objEvent) => {
        const strName = objEvent.target.name;
        const strValue = objEvent.target.value;
        fSetObjForm((objPrevious) => ({ ...objPrevious, [strName]: strValue }));
    };

    // fShowError : affiche un message et place le focus sur le champ concerné
    // Reçoit : strMessage (le texte à afficher), strFieldName (le champ à corriger, ou '' pour ne pas déplacer le focus)
    // Renvoie : rien
    // Pourquoi : le visiteur voit le message et peut corriger directement le bon champ
    const fShowError = (strMessage, strFieldName) => {
        fSetStrError(strMessage);
        if (strFieldName !== '') {
            objFieldRefs.current[strFieldName].focus();
        }
    };

    // fFindClientError : contrôle le formulaire avant l'envoi
    // Reçoit : rien (lit objForm)
    // Renvoie : { strMessage, strFieldName } pour la première erreur trouvée, ou null si tout est valide
    // Pourquoi : éviter un aller-retour inutile vers l'API ; l'API refait de toute façon les mêmes contrôles
    const fFindClientError = () => {
        for (const objField of TB_FIELDS) {
            let strValue = objForm[objField.strName];
            if (objField.strName !== 'password') {
                strValue = strValue.trim();
            }
            if (strValue === '') {
                return { strMessage: 'Tous les champs sont obligatoires.', strFieldName: objField.strName };
            }
        }

        if (!OBJ_EMAIL_PATTERN.test(objForm.email.trim())) {
            return { strMessage: "L'adresse e-mail n'est pas valide.", strFieldName: 'email' };
        }

        if (objForm.password.length < INT_PASSWORD_MIN_LENGTH) {
            return {
                strMessage: 'Le mot de passe doit contenir au moins ' + INT_PASSWORD_MIN_LENGTH + ' caractères.',
                strFieldName: 'password',
            };
        }

        if (new TextEncoder().encode(objForm.password).length > INT_PASSWORD_MAX_BYTES) {
            return { strMessage: 'Le mot de passe est trop long.', strFieldName: 'password' };
        }

        return null;
    };

    // fHandleSubmit : envoie le formulaire
    // Reçoit : objEvent (l'événement de soumission)
    // Renvoie : rien
    // Pourquoi : contrôler les champs, appeler l'API, puis fermer le modal ou afficher l'erreur
    const fHandleSubmit = async (objEvent) => {
        objEvent.preventDefault();

        const objClientError = fFindClientError();
        if (objClientError !== null) {
            fShowError(objClientError.strMessage, objClientError.strFieldName);
            return;
        }

        fSetBlLoading(true);
        fSetStrError('');

        try {
            await fRegister({
                lastName: objForm.lastName.trim(),
                firstName: objForm.firstName.trim(),
                address: objForm.address.trim(),
                postalCode: objForm.postalCode.trim(),
                city: objForm.city.trim(),
                email: objForm.email.trim(),
                password: objForm.password,
            });
            // Succès : le mot de passe est effacé avant la fermeture ; l'en-tête affiche la bienvenue
            fSetObjForm(OBJ_EMPTY_FORM);
            fOnClose();
        } catch (objError) {
            // Échec : le mot de passe est effacé (jamais conservé après un envoi), les autres champs sont gardés
            // pour que le visiteur corrige sans tout ressaisir ; le focus va sur l'email s'il est déjà utilisé,
            // sinon sur le mot de passe à ressaisir
            fSetObjForm((objPrevious) => ({ ...objPrevious, password: '' }));
            fSetBlLoading(false);
            let strFieldName = 'password';
            if (objError.intStatus === 409) {
                strFieldName = 'email';
            }
            fShowError(objError.message, strFieldName);
        }
    };

    // fRenderField : affiche un champ avec son label
    // Reçoit : objField (la description du champ dans TB_FIELDS)
    // Renvoie : le JSX du champ
    // Pourquoi : les sept champs partagent la même structure et les mêmes attributs d'accessibilité
    const fRenderField = (objField) => {
        const strId = 'register-' + objField.strName;
        const objExtraProps = {};
        if (objField.intMaxLength !== null) {
            objExtraProps.maxLength = objField.intMaxLength;
        }
        if (objField.strName === 'password') {
            objExtraProps['aria-describedby'] = 'register-password-hint';
        }

        return (
            <div className="login-modal__field" key={objField.strName}>
                <label htmlFor={strId} className="login-modal__label">{objField.strLabel}</label>
                <input
                    ref={(objElement) => {
                        objFieldRefs.current[objField.strName] = objElement;
                        if (objField.strName === TB_FIELDS[0].strName) {
                            objFirstFieldRef.current = objElement;
                        }
                    }}
                    id={strId}
                    name={objField.strName}
                    type={objField.strType}
                    autoComplete={objField.strAutoComplete}
                    className="login-modal__input"
                    value={objForm[objField.strName]}
                    onChange={fHandleChange}
                    required
                    aria-required="true"
                    {...objExtraProps}
                />
                {objField.strName === 'password' && (
                    <p id="register-password-hint" className="register-modal__hint">
                        {INT_PASSWORD_MIN_LENGTH} caractères minimum.
                    </p>
                )}
            </div>
        );
    };

    let strSubmitLabel = 'Créer mon compte';
    if (blLoading) {
        strSubmitLabel = 'Création…';
    }

    // Code postal et ville (positions 3 et 4) côte à côte ; les autres champs sur toute la largeur
    const tbFieldsBefore = TB_FIELDS.slice(0, 3);
    const tbFieldsRow = TB_FIELDS.slice(3, 5);
    const tbFieldsAfter = TB_FIELDS.slice(5);

    return (
        <div className="product-modal">
            <div className="product-modal__backdrop" onClick={fOnClose}></div>

            <div
                ref={objDialogRef}
                tabIndex={-1}
                className="product-modal__dialog login-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="register-modal-title"
            >
                <button type="button" className="product-modal__close" onClick={fOnClose} aria-label="Fermer">
                    ✕
                </button>

                <form className="login-modal__form" onSubmit={fHandleSubmit} noValidate>
                    <h2 className="login-modal__title" id="register-modal-title">Créer un compte</h2>
                    <p className="register-modal__intro">Tous les champs sont obligatoires.</p>

                    {/* Zone d'alerte toujours présente : le message est annoncé aux lecteurs d'écran à son apparition */}
                    <div role="alert" className="login-modal__alert">
                        {strError !== '' && <p className="login-modal__error">{strError}</p>}
                    </div>

                    {tbFieldsBefore.map(fRenderField)}
                    <div className="register-modal__row">
                        {tbFieldsRow.map(fRenderField)}
                    </div>
                    {tbFieldsAfter.map(fRenderField)}

                    <p className="register-modal__privacy">
                        Vos données servent à gérer votre compte. Pour en savoir plus, consultez notre{' '}
                        <Link to="/confidentialite" onClick={fOnClose}>politique de confidentialité</Link>.
                    </p>

                    <button type="submit" className="product-modal__add login-modal__submit" disabled={blLoading}>
                        {strSubmitLabel}
                    </button>

                    <p className="login-modal__switch">
                        Déjà un compte ?{' '}
                        <button type="button" className="login-modal__link" onClick={fOnSwitchToLogin}>
                            Se connecter
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
