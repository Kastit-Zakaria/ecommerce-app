import { useState, useEffect } from 'react';
import objApi from '../services/api';

// Universes : grille « Nos univers », une carte image par catégorie
// Reçoit : fOnSelectCategory (fonction appelée au clic avec la catégorie)
// Renvoie : le JSX de la section
// Pourquoi : offrir un second accès visuel aux catégories depuis l'accueil
const Universes = ({ fOnSelectCategory }) => {
    const [tbCategories, fSetTbCategories] = useState([]);

    useEffect(() => {
        objApi.get('/categories')
            .then((objResponse) => {
                fSetTbCategories(objResponse.data);
            })
            .catch((objError) => {
                console.error('Erreur lors du chargement des univers :', objError);
            });
    }, []);

    // On garde seulement les catégories qui ont une image
    const tbUniverses = tbCategories.filter((objCategory) => {
        return objCategory.imageUrl !== null;
    });

    return (
        <section className="universes" aria-label="Nos univers">
            <h2 className="universes__title">Nos univers</h2>

            <div className="universes__grid">
                {tbUniverses.map((objCategory) => (
                    <button
                        key={objCategory.id}
                        type="button"
                        className="universe-card"
                        onClick={() => fOnSelectCategory(objCategory)}
                    >
                        <img src={objCategory.imageUrl} alt="" className="universe-card__image" />
                        <span className="universe-card__label">
                            <span className="universe-card__name">{objCategory.name}</span>
                            <span className="universe-card__link">Voir la collection</span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Universes;