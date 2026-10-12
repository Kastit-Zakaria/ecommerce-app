import { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryList = ({ selectedCategory, onSelect }) => {
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
            {categories.map((category) => {
                let className = 'category-list__item';
                if (selectedCategory !== null && selectedCategory.id === category.id) {
                    className = 'category-list__item category-list__item--active';
                }

                return (
                    <button
                        key={category.id}
                        className={className}
                        onClick={() => onSelect(category)}
                    >
                        {category.name}
                    </button>
                );
            })}
        </nav>
    );
};

export default CategoryList;