import { useContext } from 'react';
import AuthContext from './authContextObject';

// useAuth : donne accès au membre connecté et aux fonctions de connexion, d'inscription et de déconnexion
// Reçoit : rien
// Renvoie : { objUser, blChecking, fLogin, fRegister, fLogout }
// Pourquoi : éviter de répéter useContext dans chaque composant
const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
