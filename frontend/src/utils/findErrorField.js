// fFindErrorField : trouve le champ à corriger après un refus de l'API
// Reçoit : objError (l'erreur de la requête), tbFieldNames (les champs du formulaire, dans l'ordre d'affichage)
// Renvoie : le champ désigné par « field » dans la réponse, ou le premier champ si la réponse
//           ne désigne aucun champ de ce formulaire
// Pourquoi : placer le focus là où le membre doit reprendre sa saisie, sans interpréter le message
const fFindErrorField = (objError, tbFieldNames) => {
    if (objError.response && objError.response.data) {
        const strField = objError.response.data.field;
        if (tbFieldNames.includes(strField)) {
            return strField;
        }
    }
    return tbFieldNames[0];
};

export default fFindErrorField;
