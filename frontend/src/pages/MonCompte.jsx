import { useEffect, useRef, useState } from 'react';
import useAuth from '../context/useAuth';

const arrFields = [
    { strKey: 'firstName', strLabel: 'Prénom', intMax: 100, strAuto: 'given-name' },
    { strKey: 'lastName', strLabel: 'Nom', intMax: 100, strAuto: 'family-name' },
    { strKey: 'email', strLabel: 'Adresse e-mail', intMax: 255, strAuto: 'email', strType: 'email' },
    { strKey: 'address', strLabel: 'Adresse', intMax: 255, strAuto: 'street-address' },
    { strKey: 'postalCode', strLabel: 'Code postal', intMax: 10, strAuto: 'postal-code' },
    { strKey: 'city', strLabel: 'Ville', intMax: 100, strAuto: 'address-level2' },
];
// fEditable : sélectionne les six valeurs du profil.
// Reçoit : le profil API. Renvoie : les champs du formulaire. Pourquoi : exclure les propriétés internes.
const fEditable = (objProfile) => Object.fromEntries(arrFields.map(({ strKey }) => [strKey, objProfile[strKey] ?? '']));

// Réutilise la page Paramètres et le contexte de session existants.
const MonCompte = () => {
    const { objUser, fRefreshProfile, fUpdateProfile } = useAuth();
    const [objForm, fSetObjForm] = useState(null);
    const [blLoading, fSetBlLoading] = useState(true);
    const [blSaving, fSetBlSaving] = useState(false);
    const [strError, fSetStrError] = useState('');
    const [strSuccess, fSetStrSuccess] = useState('');
    const [intRetry, fSetIntRetry] = useState(0);
    const objSavingRef = useRef(false);
    // La lecture dépend de l'ouverture de la page ou d'une nouvelle tentative.

    useEffect(() => {
        let blActive = true;
        fRefreshProfile()
            .then((objProfile) => { if (blActive) fSetObjForm(fEditable(objProfile)); })
            .catch(() => { if (blActive) fSetStrError('Impossible de charger vos informations. Veuillez réessayer.'); })
            .finally(() => { if (blActive) fSetBlLoading(false); });
        return () => { blActive = false; };
    }, [intRetry, fRefreshProfile]);

    // fSave : enregistre le formulaire.
    // Reçoit : la soumission. Renvoie : une promesse. Pourquoi : sauvegarder sans perdre les saisies en cas d'erreur.
    const fSave = async (objEvent) => {
        objEvent.preventDefault();
        if (objSavingRef.current) return;
        objSavingRef.current = true;
        fSetBlSaving(true);
        fSetStrError('');
        fSetStrSuccess('');
        try {
            const objProfile = await fUpdateProfile(objForm);
            fSetObjForm(fEditable(objProfile));
            fSetStrSuccess('Vos informations ont été mises à jour.');
        } catch (objError) {
            fSetStrError(objError.response?.data?.message || "Impossible d'enregistrer les modifications. Veuillez réessayer.");
        } finally {
            objSavingRef.current = false;
            fSetBlSaving(false);
        }
    };

    let strSaveLabel = 'Enregistrer les modifications';
    if (blSaving) { strSaveLabel = 'Enregistrement…'; }
    if (objUser === null) { return null; }
    return (
        <main className="account-page">
            <h1 className="account-page__title">Mon compte</h1>
            {blLoading && <p role="status">Chargement de vos informations…</p>}
            {strError && <p className="account-page__error" role="alert">{strError}</p>}
            {strSuccess && <p className="account-page__success" role="status">{strSuccess}</p>}
            {!blLoading && !objForm && <button type="button" onClick={() => { fSetBlLoading(true); fSetStrError(''); fSetIntRetry((intValue) => intValue + 1); }}>Réessayer</button>}
            {!blLoading && objForm && (
                <form aria-label="Informations personnelles" onSubmit={fSave}>
                    <fieldset className="account-page__fields" disabled={blSaving}>
                        <legend className="account-page__intro">Vos informations personnelles</legend>
                        {arrFields.map(({ strKey, strLabel, intMax, strAuto, strType }) => (
                            <div className="account-page__row" key={strKey}>
                                <label className="account-page__label" htmlFor={`account-${strKey}`}>{strLabel}</label>
                                <input id={`account-${strKey}`} name={strKey} type={strType || 'text'}
                                    value={objForm[strKey]} maxLength={intMax} autoComplete={strAuto} required
                                    onChange={(objEvent) => {
                                        fSetObjForm({ ...objForm, [strKey]: objEvent.target.value });
                                        fSetStrSuccess('');
                                    }} />
                            </div>
                        ))}
                        <button className="account-page__save" type="submit">{strSaveLabel}</button>
                    </fieldset>
                </form>
            )}
        </main>
    );
};
export default MonCompte;
