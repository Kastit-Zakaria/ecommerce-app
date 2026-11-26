import { useEffect, useRef, useState } from 'react';

// useFocusAfterSubmit : replace le focus après l'envoi d'un formulaire
// Reçoit : rien
// Renvoie : fSetTargetRef (range sous un nom un élément pouvant recevoir le focus) et
//           fRequestFocus (demande le focus sur l'élément portant ce nom)
// Pourquoi : le formulaire désactivé pendant l'envoi fait perdre le focus ; il ne peut être replacé
//            qu'une fois le formulaire réactivé et le message affiché
const useFocusAfterSubmit = () => {
    const objTargetRefs = useRef({});
    // Un nouvel objet à chaque demande : le focus est replacé même si la cible ne change pas
    const [objRequest, fSetObjRequest] = useState(null);

    // Appliqué après l'affichage qui suit la demande
    useEffect(() => {
        if (objRequest === null) {
            return;
        }
        const objElement = objTargetRefs.current[objRequest.strTarget];
        // L'élément n'existe plus si la page a disparu entre-temps (session expirée)
        if (objElement) {
            objElement.focus();
        }
    }, [objRequest]);

    // fSetTargetRef : garde la référence d'un élément pouvant recevoir le focus
    // Reçoit : strTarget (le nom de l'élément), objElement (l'élément affiché, ou null quand il disparaît)
    // Renvoie : rien
    // Pourquoi : à appeler dans l'attribut ref de chaque champ et du message de confirmation
    const fSetTargetRef = (strTarget, objElement) => {
        objTargetRefs.current[strTarget] = objElement;
    };

    // fRequestFocus : demande le focus sur un élément
    // Reçoit : strTarget (le nom donné à l'élément avec fSetTargetRef)
    // Renvoie : rien
    // Pourquoi : à appeler en même temps que la réactivation du formulaire
    const fRequestFocus = (strTarget) => {
        fSetObjRequest({ strTarget });
    };

    return { fSetTargetRef, fRequestFocus };
};

export default useFocusAfterSubmit;
