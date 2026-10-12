import { useState, useEffect } from 'react';
import api from '../services/api';

const ProductList = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category === null) {
            return;
        }

        setLoading(true);
        api.get(`/categories/${category.id}/products`)
            .then((response) => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Erreur lors du chargement des produits :', error);
                setLoading(false);
            });
    }, [category]);

    let title = 'Nos produits';
    if (category !== null) {
        title = category.name;
    }

    let content;
    if (category === null) {
        content = <p className="product-list__message">Choisissez une catégorie pour afficher ses produits.</p>;
    } else if (loading) {
        content = <p className="product-list__message">Chargement…</p>;
    } else if (products.length === 0) {
        content = <p className="product-list__message">Aucun produit dans cette catégorie.</p>;
    } else {
        content = (
            <div className="product-list__grid">
                {products.map((product) => (
                    <button key={product.id} type="button" className="product-card">
                        <img src={product.imageUrl} alt={product.name} className="product-card__image" />
                        <span className="product-card__tooltip">{product.name}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <section className="product-list">
            <h2 className="product-list__title">{title}</h2>
            {content}
        </section>
    );
};

export default ProductList;