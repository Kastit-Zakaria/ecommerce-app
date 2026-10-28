import axios from 'axios';

// Client HTTP partagé : toutes les requêtes vers le back passent par cet objet
const objApi = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export default objApi;