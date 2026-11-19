import { useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

// MemberRoute : réserve une page aux membres connectés
// Reçoit : children (la page à protéger)
// Renvoie : la page pour un membre, rien pendant la vérification de session, ou une redirection vers l'accueil
// Pourquoi : un visiteur n'a rien à faire sur une page de membre ; on lui ouvre le modal de connexion
const MemberRoute = ({ children }) => {
    const { objUser, blChecking } = useAuth();

    // Mémorise le membre du rendu précédent pour distinguer « arrivée d'un visiteur » et « déconnexion en cours de visite »
    const objPreviousUserRef = useRef(null);
    useEffect(() => {
        objPreviousUserRef.current = objUser;
    });

    // Session en cours de vérification (rechargement de la page) : on ne redirige pas à tort
    if (blChecking) {
        return null;
    }

    if (objUser !== null) {
        return children;
    }

    // Le membre vient de se déconnecter sur cette page : retour à l'accueil sans rouvrir le modal
    if (objPreviousUserRef.current !== null) {
        return <Navigate to="/" replace />;
    }

    // Visiteur arrivé directement sur la page : accueil + demande d'ouverture du modal de connexion
    return <Navigate to="/" replace state={{ blOpenLogin: true }} />;
};

export default MemberRoute;
