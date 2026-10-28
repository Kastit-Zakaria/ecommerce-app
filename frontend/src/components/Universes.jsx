import { useState, useEffect } from 'react';
import api from '../services/api';

const Universes = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error('Erreur lors du chargement des univers :', error);
            });
    }, []);

    // On garde seulement les catégories qui ont une image
    const universes = categories.filter((category) => {
        return category.imageUrl !== null;
    });

    return (
        <section className="universes" aria-label="Nos univers">
            <h2 className="universes__title">Nos univers</h2>

            <div className="universes__grid">
                {universes.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        className="universe-card"
                        onClick={() => onSelectCategory(category)}
                    >
                        <img src={category.imageUrl} alt="" className="universe-card__image" />
                        <span className="universe-card__label">
                            <span className="universe-card__name">{category.name}</span>
                            <span className="universe-card__link">Voir la collection</span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Universes;