import { useRef, useState } from 'react';
import useAuth from '../context/useAuth';

// Longueur minimale affichée en indication (la règle est contrôlée par l'API)
const INT_PASSWORD_MIN_LENGTH = 8;

// Champs du formulaire, dans l'ordre d'affichage
const TB_FIELDS = [
    { strName: 'currentPassword', strId: 'password-current', strLabel: 'Mot de passe actuel', strAutoComplete: 'current-password' },
    { strName: 'newPassword', strId: 'password-new', strLabel: 'Nouveau mot de passe', strAutoComplete: 'new-password' },
    { strName: 'confirmation', strId: 'password-confirmation', strLabel: 'Confirmer le nouveau mot de passe', strAutoComplete: 'new-password' },
];

const OBJ_EMPTY_FORM = {
    currentPassword: '',
    newPassword: '',
    confirmation: '',
};

// PasswordForm : section « Modifier mon mot de passe » de la page Mon compte
// Reçoit : rien
// Renvoie : le JSX de la section et de son formulaire
// Pourquoi : changer le mot de passe séparément des autres informations personnelles
const PasswordForm = () => {
    const { fChangePassword } = useAuth();

    const [objForm, fSetObjForm] = useState(OBJ_EMPTY_FORM);
    const [blSaving, fSetBlSaving] = useState(false);
    const [strError, fSetStrError] = useState('');
    const [strSuccess, fSetStrSuccess] = useState('');
    const objSavingRef = useRef(false);

    // fHandleChange : met à jour un champ du formulaire
    // Reçoit : objEvent (l'événement de saisie ; le nom du champ est dans objEvent.target.name)
    // Renvoie : rien
    // Pourquoi : un seul gestionnaire pour les trois champs ; une nouvelle saisie efface la confirmation précédente
    const fHandleChange = (objEvent) => {
        const strName = objEvent.target.name;
        const strValue = objEvent.target.value;
        fSetObjForm((objPrevious) => ({ ...objPrevious, [strName]: strValue }));
        fSetStrSuccess('');
    };

    // fHandleSubmit : envoie le changement de mot de passe
    // Reçoit : objEvent (l'événement de soumission)
    // Renvoie : une promesse
    // Pourquoi : appeler l'API une seule fois, afficher le résultat et ne jamais garder les mots de passe saisis
    const fHandleSubmit = async (objEvent) => {
        objEvent.preventDefault();
        if (objSavingRef.current) {
            return;
        }
        objSavingRef.current = true;
        fSetBlSaving(true);
        fSetStrError('');
        fSetStrSuccess('');

        try {
            await fChangePassword(objForm);
            fSetStrSuccess('Votre mot de passe a été modifié.');
        } catch (objError) {
            let strMessage = 'Impossible de modifier le mot de passe. Veuillez réessayer plus tard.';
            if (objError.response && objError.response.data && objError.response.data.message) {
                strMessage = objError.response.data.message;
            }
            fSetStrError(strMessage);
        } finally {
            // Les champs sont vidés après chaque tentative, réussie ou non
            fSetObjForm(OBJ_EMPTY_FORM);
            objSavingRef.current = false;
            fSetBlSaving(false);
        }
    };

    let strSubmitLabel = 'Modifier le mot de passe';
    if (blSaving) {
        strSubmitLabel = 'Modification…';
    }

    return (
        <section className="account-page__password" aria-labelledby="password-title">
            <h2 className="account-page__subtitle" id="password-title">Modifier mon mot de passe</h2>
            {strError !== '' && <p className="account-page__error" role="alert">{strError}</p>}
            {/* Zone d'état toujours présente : la confirmation est annoncée aux lecteurs d'écran à son apparition */}
            <div role="status">
                {strSuccess !== '' && <p className="account-page__success">{strSuccess}</p>}
            </div>

            {/* noValidate : les champs vides reçoivent aussi le message de l'API, annoncé comme les autres erreurs */}
            <form aria-labelledby="password-title" onSubmit={fHandleSubmit} noValidate>
                <fieldset className="account-page__fields" disabled={blSaving}>
                    <legend className="account-page__intro">Tous les champs sont obligatoires.</legend>
                    {TB_FIELDS.map((objField) => {
                        const objExtraProps = {};
                        if (objField.strName === 'newPassword') {
                            objExtraProps['aria-describedby'] = 'password-new-hint';
                        }

                        return (
                            <div className="account-page__row" key={objField.strName}>
                                <label className="account-page__label" htmlFor={objField.strId}>{objField.strLabel}</label>
                                <input
                                    id={objField.strId}
                                    name={objField.strName}
                                    type="password"
                                    autoComplete={objField.strAutoComplete}
                                    value={objForm[objField.strName]}
                                    onChange={fHandleChange}
                                    required
                                    {...objExtraProps}
                                />
                                {objField.strName === 'newPassword' && (
                                    <p className="account-page__hint" id="password-new-hint">
                                        {INT_PASSWORD_MIN_LENGTH} caractères minimum.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <button className="account-page__save" type="submit">{strSubmitLabel}</button>
                </fieldset>
            </form>
        </section>
    );
};

export default PasswordForm;
