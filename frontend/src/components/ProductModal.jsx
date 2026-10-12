import { useState, useEffect } from 'react';
import api from '../services/api';

// Transforme 64.9 en "64,90 €"
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(price);
};

const ProductModal = ({ productId, onClose }) => {
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    // 1. Charger le produit depuis l'API
    useEffect(() => {
        api.get(`/products/${productId}`)
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Erreur lors du chargement du produit :', error);
            });
    }, [productId]);

    // 2. Fermer avec la touche Échap + bloquer le défilement de la page
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        // Nettoyage : exécuté à la fermeture du modal
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // 3. Choisir ce qu'on affiche
    let content;
    if (product === null) {
        content = <p className="product-modal__loading">Chargement…</p>;
    } else {
        let stockLabel = 'En stock';
        if (product.stock === 0) {
            stockLabel = 'Rupture de stock';
        }

        content = (
            <div className="product-modal__body">
                <img className="product-modal__image" src={product.imageUrl} alt={product.name} />

                <div className="product-modal__info">
                    <p className="product-modal__brand">{product.brand.name}</p>
                    <h2 className="product-modal__name" id="product-modal-title">{product.name}</h2>
                    <p className="product-modal__price">{formatPrice(product.price)}</p>
                    <p className="product-modal__description">{product.description}</p>

                    <div>
                        <p className="product-modal__label">Taille</p>
                        <div className="product-modal__sizes">
                            {product.sizes.map((size) => {
                                let className = 'product-modal__size';
                                if (selectedSize === size.id) {
                                    className = 'product-modal__size product-modal__size--active';
                                }

                                return (
                                    <button
                                        key={size.id}
                                        type="button"
                                        className={className}
                                        onClick={() => setSelectedSize(size.id)}
                                    >
                                        {size.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <p className="product-modal__stock">{stockLabel}</p>

                    <button type="button" className="product-modal__add" disabled>
                        Ajouter au panier
                    </button>
                </div>
            </div>
        );
    }

    // 4. Structure du modal : fond sombre + fenêtre
    return (
        <div className="product-modal">
            <div className="product-modal__backdrop" onClick={onClose}></div>

            <div
                className="product-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
            >
                <button type="button" className="product-modal__close" onClick={onClose} aria-label="Fermer">
                    ✕
                </button>
                {content}
            </div>
        </div>
    );
};

export default ProductModal;