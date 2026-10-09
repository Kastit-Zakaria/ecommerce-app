import { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error('Erreur lors du chargement des catégories :', error);
            });
    }, []);

    return (
        <nav className="category-list">
            {categories.map((category) => (
                <button key={category.id} className="category-list__item">
                    {category.name}
                </button>
            ))}
        </nav>
    );
};

export default CategoryList;