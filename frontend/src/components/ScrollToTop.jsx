import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop : remonte en haut de la page à chaque changement de page
// Reçoit : rien
// Renvoie : null (n'affiche rien)
// Pourquoi : la nouvelle page doit s'afficher en haut, sans que l'utilisateur ait à remonter
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Lien vers une ancre (#produits) : on laisse la cible gérer le défilement
        if (hash !== '') {
            return;
        }

        // « instant » : sans animation, malgré scroll-behavior: smooth dans le CSS
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
