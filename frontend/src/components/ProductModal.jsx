import { useState, useEffect, useRef } from 'react';
import objApi from '../services/api';
import fFormatPrice from '../utils/formatPrice';
import useModalBehavior from '../hooks/useModalBehavior';

// ProductModal : fenêtre de détail d'un produit (image, marque, prix, tailles, stock)
// Reçoit : intProductId (identifiant du produit à charger), fOnClose (fonction pour fermer le modal)
// Renvoie : le JSX du modal
// Pourquoi : montrer la fiche complète d'un produit sans quitter l'accueil
const ProductModal = ({ intProductId, fOnClose }) => {
    const [objProduct, fSetObjProduct] = useState(null);
    const [intSelectedSize, fSetIntSelectedSize] = useState(null);

    const objDialogRef = useRef(null);

    // 0. Comportement de fenêtre partagé avec la connexion et l'inscription : focus sur la fenêtre à l'ouverture
    //    et retour au bouton d'origine à la fermeture, Échap, piège de Tab, blocage du défilement de la page
    useModalBehavior(objDialogRef, objDialogRef, fOnClose);

    // 1. Charger le produit depuis l'API
    useEffect(() => {
        objApi.get(`/products/${intProductId}`)
            .then((objResponse) => {
                fSetObjProduct(objResponse.data);
            })
            .catch((objError) => {
                console.error('Erreur lors du chargement du produit :', objError);
            });
    }, [intProductId]);

    // 2. Choisir ce qu'on affiche
    let objContent;
    if (objProduct === null) {
        objContent = <p className="product-modal__loading">Chargement…</p>;
    } else {
        let strStockLabel = 'En stock';
        if (objProduct.stock === 0) {
            strStockLabel = 'Rupture de stock';
        }

        objContent = (
            <div className="product-modal__body">
                <img className="product-modal__image" src={objProduct.imageUrl} alt={objProduct.name} />

                <div className="product-modal__info">
                    <p className="product-modal__brand">{objProduct.brand.name}</p>
                    <h2 className="product-modal__name" id="product-modal-title">{objProduct.name}</h2>
                    <p className="product-modal__price">{fFormatPrice(objProduct.price)}</p>
                    <p className="product-modal__description">{objProduct.description}</p>

                    <div>
                        <p className="product-modal__label">Taille</p>
                        <div className="product-modal__sizes">
                            {objProduct.sizes.map((objSize) => {
                                let strClassName = 'product-modal__size';
                                if (intSelectedSize === objSize.id) {
                                    strClassName = 'product-modal__size product-modal__size--active';
                                }

                                return (
                                    <button
                                        key={objSize.id}
                                        type="button"
                                        className={strClassName}
                                        onClick={() => fSetIntSelectedSize(objSize.id)}
                                    >
                                        {objSize.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <p className="product-modal__stock">{strStockLabel}</p>

                    <button type="button" className="product-modal__add" disabled>
                        Ajouter au panier
                    </button>
                </div>
            </div>
        );
    }

    // 3. Structure du modal : fond sombre + fenêtre
    return (
        <div className="product-modal">
            <div className="product-modal__backdrop" onClick={fOnClose}></div>

            <div
                ref={objDialogRef}
                tabIndex={-1}
                className="product-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
            >
                <button type="button" className="product-modal__close" onClick={fOnClose} aria-label="Fermer">
                    ✕
                </button>
                {objContent}
            </div>
        </div>
    );
};

export default ProductModal;