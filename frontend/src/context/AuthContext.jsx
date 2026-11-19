import { useState, useEffect } from 'react';
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

    return (
        <AuthContext.Provider value={{ objUser, blChecking, fLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
