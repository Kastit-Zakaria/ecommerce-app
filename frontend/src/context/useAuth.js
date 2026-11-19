import { useContext } from 'react';
import AuthContext from './authContextObject';

// useAuth : donne accès au membre connecté et à la fonction de connexion
// Reçoit : rien
// Renvoie : { objUser, blChecking, fLogin }
// Pourquoi : éviter de répéter useContext dans chaque composant
const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
