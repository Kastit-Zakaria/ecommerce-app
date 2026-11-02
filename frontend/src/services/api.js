import axios from 'axios';

// Adresse de l'API : variable d'environnement VITE_API_URL, ou valeur de développement par défaut
let strApiUrl = import.meta.env.VITE_API_URL;
if (!strApiUrl) {
    strApiUrl = 'http://localhost:8080/api';
}

// Client HTTP partagé : toutes les requêtes vers le back passent par cet objet
const objApi = axios.create({
    baseURL: strApiUrl,
});

export default objApi;
