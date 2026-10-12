import { useState, useEffect } from 'react';
import api from '../services/api';
import formatPrice from '../utils/formatPrice';

const ProductList = ({ category, onSelectProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState(null);

    // 1. Charger les produits quand la catégorie change
    useEffect(() => {
        if (category === null) {
            return;
        }

        setLoading(true);
        setSelectedTypeId(null);
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

    // 2. Construire la liste des types présents dans ces produits (sans doublons)
    const types = [];
    for (const product of products) {
        if (product.type !== null) {
            let alreadyAdded = false;
            for (const type of types) {
                if (type.id === product.type.id) {
                    alreadyAdded = true;
                }
            }
            if (!alreadyAdded) {
                types.push(product.type);
            }
        }
    }
    types.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    // 3. Garder seulement les produits du type sélectionné
    let visibleProducts = products;
    if (selectedTypeId !== null) {
        visibleProducts = products.filter((product) => {
            return product.type !== null && product.type.id === selectedTypeId;
        });
    }

    // 4. Titre
    let title = 'Nos produits';
    if (category !== null) {
        title = category.name;
    }

    // 5. Filtres par type (seulement si des produits sont affichés)
    let filters = null;
    if (category !== null && !loading && types.length > 0) {
        let allClassName = 'type-filter__item';
        if (selectedTypeId === null) {
            allClassName = 'type-filter__item type-filter__item--active';
        }

        filters = (
            <div className="type-filter" role="group" aria-label="Filtrer par type d'article">
                <button
                    type="button"
                    className={allClassName}
                    onClick={() => setSelectedTypeId(null)}
                >
                    Tout
                </button>

                {types.map((type) => {
                    let className = 'type-filter__item';
                    if (selectedTypeId === type.id) {
                        className = 'type-filter__item type-filter__item--active';
                    }

                    return (
                        <button
                            key={type.id}
                            type="button"
                            className={className}
                            onClick={() => setSelectedTypeId(type.id)}
                        >
                            {type.name}
                        </button>
                    );
                })}
            </div>
        );
    }

    // 6. Contenu principal
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
                {visibleProducts.map((product) => (
                    <article key={product.id} className="product-card">
                        <div className="product-card__media">
                            <img src={product.imageUrl} alt={product.name} className="product-card__image" />
                            <span className="product-card__tooltip">{product.name}</span>
                        </div>
                        <p className="product-card__price">{formatPrice(product.price)}</p>
                        <button
                            type="button"
                            className="product-card__button"
                            onClick={() => onSelectProduct(product)}
                        >
                            Voir le produit
                        </button>
                    </article>
                ))}
            </div>
        );
    }

    return (
        <section className="product-list">
            <h2 className="product-list__title">{title}</h2>
            {filters}
            {content}
        </section>
    );
};

export default ProductList;