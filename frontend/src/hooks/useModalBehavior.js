import { useEffect } from 'react';

// useModalBehavior : comportement clavier et focus commun aux fenêtres de connexion, d'inscription et à la fiche produit
// Reçoit : objDialogRef (la fenêtre), objInitialFocusRef (le champ qui reçoit le focus à l'ouverture),
//          fOnClose (fonction pour fermer la fenêtre)
// Renvoie : rien
// Pourquoi : un seul endroit pour le focus initial, son retour à la fermeture, Échap, le piège de Tab
//            et le blocage du défilement de la page
const useModalBehavior = (objDialogRef, objInitialFocusRef, fOnClose) => {
    // 0. Focus : entrer sur le premier champ à l'ouverture, revenir à l'élément d'origine à la fermeture
    useEffect(() => {
        const objPreviousFocus = document.activeElement;
        objInitialFocusRef.current.focus();

        // Nettoyage : exécuté à la fermeture de la fenêtre
        return () => {
            if (objPreviousFocus !== null && objPreviousFocus.focus) {
                objPreviousFocus.focus();
            }
        };
    }, [objInitialFocusRef]);

    // 1. Échap ferme la fenêtre, Tab reste dans la fenêtre, la page ne défile plus
    useEffect(() => {
        // fHandleKeyDown : gère Échap et le piège du focus
        // Reçoit : objEvent (l'événement clavier)
        // Renvoie : rien
        // Pourquoi : fermer au clavier et empêcher Tab de sortir de la fenêtre
        const fHandleKeyDown = (objEvent) => {
            if (objEvent.key === 'Escape') {
                fOnClose();
                return;
            }

            if (objEvent.key !== 'Tab') {
                return;
            }

            const tbFocusables = objDialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])');
            if (tbFocusables.length === 0) {
                return;
            }

            const objFirst = tbFocusables[0];
            const objLast = tbFocusables[tbFocusables.length - 1];
            const objActive = document.activeElement;
            const blInside = objDialogRef.current.contains(objActive);
            // La fenêtre elle-même (tabIndex -1) peut avoir le focus : à l'ouverture de la fiche produit,
            // ou après un clic sur son fond. Tab doit alors aller au premier contrôle et Maj+Tab au dernier,
            // sinon le navigateur ferait sortir le focus de la fenêtre.
            const blOnDialog = objActive === objDialogRef.current;

            if (objEvent.shiftKey && (objActive === objFirst || !blInside || blOnDialog)) {
                objEvent.preventDefault();
                objLast.focus();
            } else if (!objEvent.shiftKey && (objActive === objLast || !blInside || blOnDialog)) {
                objEvent.preventDefault();
                objFirst.focus();
            }
        };

        document.addEventListener('keydown', fHandleKeyDown);
        document.body.style.overflow = 'hidden';

        // Nettoyage : exécuté à la fermeture de la fenêtre
        return () => {
            document.removeEventListener('keydown', fHandleKeyDown);
            document.body.style.overflow = '';
        };
    }, [objDialogRef, fOnClose]);
};

export default useModalBehavior;
