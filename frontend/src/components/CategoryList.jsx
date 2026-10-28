import { useState, useEffect } from 'react';
import objApi from '../services/api';

// CategoryList : barre de navigation listant les catégories
// Reçoit : objSelectedCategory (catégorie active ou null), fOnSelect (fonction appelée au clic avec la catégorie)
// Renvoie : le JSX de la navigation
// Pourquoi : permettre de choisir la catégorie dont on veut voir les produits
const CategoryList = ({ objSelectedCategory, fOnSelect }) => {
    const [tbCategories, fSetTbCategories] = useState([]);

    useEffect(() => {
        objApi.get('/categories')
            .then((objResponse) => {
                fSetTbCategories(objResponse.data);
            })
            .catch((objError) => {
                console.error('Erreur lors du chargement des catégories :', objError);
            });
    }, []);

    return (
        <nav className="category-list">
            {tbCategories.map((objCategory) => {
                let strClassName = 'category-list__item';
                if (objSelectedCategory !== null && objSelectedCategory.id === objCategory.id) {
                    strClassName = 'category-list__item category-list__item--active';
                }

                return (
                    <button
                        key={objCategory.id}
                        className={strClassName}
                        onClick={() => fOnSelect(objCategory)}
                    >
                        {objCategory.name}
                    </button>
                );
            })}
        </nav>
    );
};

export default CategoryList;