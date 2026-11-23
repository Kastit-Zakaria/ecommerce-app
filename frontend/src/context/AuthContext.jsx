import { useState, useEffect, useCallback } from 'react';
import objApi from '../services/api';
import AuthContext from './authContextObject';

// AuthProvider : garde le membre connecté pour toute l'application
// Reçoit : children (les composants de l'application)
// Renvoie : le contexte d'authentification autour des enfants
// Pourquoi : afficher « Bienvenue, <prénom> » sur toutes les pages et retrouver la session après un rechargement
export const AuthProvider = ({ children }) => {
    const [objUser, fSetObjUser] = useState(null);
    const [blChecking, fSetBlChecking] = useState(true);

    // Au démarrage : demander à l'API si une session existe encore (cookie)
    useEffect(() => {
        objApi.get('/auth/me')
            .then((objResponse) => {
                fSetObjUser(objResponse.data);
            })
            .catch(() => {
                // 401 : personne n'est connecté, ce n'est pas une erreur à signaler
                fSetObjUser(null);
            })
            .finally(() => {
                fSetBlChecking(false);
            });
    }, []);

    // fLogin : envoie l'email et le mot de passe à l'API
    // Reçoit : strEmail (le login), strPassword (le mot de passe, transmis une seule fois et jamais conservé)
    // Renvoie : une promesse ; elle échoue avec un Error dont le message est affichable à l'écran
    // Pourquoi : connecter le membre et mémoriser son identité dans le contexte
    const fLogin = async (strEmail, strPassword) => {
        try {
            const objResponse = await objApi.post('/auth/login', { email: strEmail, password: strPassword });
            fSetObjUser(objResponse.data);
        } catch (objError) {
            let strMessage = 'Connexion impossible pour le moment. Veuillez réessayer plus tard.';
            if (objError.response && objError.response.data && objError.response.data.message) {
                strMessage = objError.response.data.message;
            }
            throw new Error(strMessage);
        }
    };

    // fRegister : envoie le formulaire d'inscription à l'API
    // Reçoit : objForm { lastName, firstName, address, postalCode, city, email, password }
    // Renvoie : une promesse ; elle échoue avec un Error dont le message est affichable à l'écran
    //          et dont intStatus porte le code HTTP (0 si le serveur n'a pas répondu)
    // Pourquoi : créer le compte ; l'API ouvre aussitôt la session, le membre est donc connecté
    const fRegister = async (objForm) => {
        try {
            const objResponse = await objApi.post('/auth/register', objForm);
            fSetObjUser(objResponse.data);
        } catch (objError) {
            let strMessage = 'Inscription impossible pour le moment. Veuillez réessayer plus tard.';
            let intStatus = 0;
            if (objError.response) {
                intStatus = objError.response.status;
                if (objError.response.data && objError.response.data.message) {
                    strMessage = objError.response.data.message;
                }
            }
            const objDisplayError = new Error(strMessage);
            objDisplayError.intStatus = intStatus;
            throw objDisplayError;
        }
    };

    // fLogout : demande à l'API de détruire la session, puis oublie le membre
    // Reçoit : rien
    // Renvoie : une promesse ; elle échoue avec un Error affichable si l'API est injoignable
    // Pourquoi : redevenir visiteur ; en cas d'échec le membre reste connecté, car sa session existe encore côté serveur
    const fLogout = async () => {
        try {
            await objApi.post('/auth/logout');
        } catch {
            throw new Error('Déconnexion impossible pour le moment. Veuillez réessayer plus tard.');
        }
        fSetObjUser(null);
    };

    // Une session expirée suit le parcours de connexion déjà utilisé par MemberRoute.
    const fRefreshProfile = useCallback(async () => {
        try {
            const objResponse = await objApi.get('/auth/me');
            fSetObjUser(objResponse.data);
            return objResponse.data;
        } catch (objError) {
            if (objError.response?.status === 401) fSetObjUser(null);
            throw objError;
        }
    }, []);

    const fUpdateProfile = async (objProfile) => {
        try {
            const objResponse = await objApi.put('/auth/me', objProfile);
            fSetObjUser(objResponse.data);
            return objResponse.data;
        } catch (objError) {
            if (objError.response?.status === 401) fSetObjUser(null);
            throw objError;
        }
    };

    return (
        <AuthContext.Provider value={{ objUser, blChecking, fLogin, fRegister, fLogout, fRefreshProfile, fUpdateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
