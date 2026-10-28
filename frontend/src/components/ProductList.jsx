import { useState, useEffect } from 'react';
import objApi from '../services/api';
import fFormatPrice from '../utils/formatPrice';

// ProductList : liste des produits (derniers arrivages ou catégorie) avec filtre par type
// Reçoit : objCategory (catégorie choisie ou null), fOnSelectProduct (fonction appelée avec le produit cliqué)
// Renvoie : le JSX de la section produits
// Pourquoi : montrer les produits et laisser l'utilisateur ouvrir la fiche d'un produit
const ProductList = ({ objCategory, fOnSelectProduct }) => {
    const [tbProducts, fSetTbProducts] = useState([]);
    const [blLoading, fSetBlLoading] = useState(false);
    const [intSelectedTypeId, fSetIntSelectedTypeId] = useState(null);

    // 1. Charger les produits : derniers arrivages OU produits de la catégorie
    useEffect(() => {
        let strUrl = '/products/latest';
        if (objCategory !== null) {
            strUrl = `/categories/${objCategory.id}/products`;
        }

        fSetBlLoading(true);
        fSetIntSelectedTypeId(null);
        objApi.get(strUrl)
            .then((objResponse) => {
                fSetTbProducts(objResponse.data);
                fSetBlLoading(false);
            })
            .catch((objError) => {
                console.error('Erreur lors du chargement des produits :', objError);
                fSetBlLoading(false);
            });
    }, [objCategory]);

    // 2. Construire la liste des types présents dans ces produits (sans doublons)
    const tbTypes = [];
    for (const objProduct of tbProducts) {
        if (objProduct.type !== null) {
            let blAlreadyAdded = false;
            for (const objType of tbTypes) {
                if (objType.id === objProduct.type.id) {
                    blAlreadyAdded = true;
                }
            }
            if (!blAlreadyAdded) {
                tbTypes.push(objProduct.type);
            }
        }
    }
    tbTypes.sort((objTypeA, objTypeB) => objTypeA.name.localeCompare(objTypeB.name, 'fr'));

    // 3. Garder seulement les produits du type sélectionné
    let tbVisibleProducts = tbProducts;
    if (intSelectedTypeId !== null) {
        tbVisibleProducts = tbProducts.filter((objProduct) => {
            return objProduct.type !== null && objProduct.type.id === intSelectedTypeId;
        });
    }

    // 4. Titre
    let strTitle = 'Derniers arrivages';
    if (objCategory !== null) {
        strTitle = objCategory.name;
    }

    // 5. Filtres par type (seulement pour une catégorie, avec des produits)
    let objFilters = null;
    if (objCategory !== null && !blLoading && tbTypes.length > 0) {
        let strAllClassName = 'type-filter__item';
        if (intSelectedTypeId === null) {
            strAllClassName = 'type-filter__item type-filter__item--active';
        }

        objFilters = (
            <div className="type-filter" role="group" aria-label="Filtrer par type d'article">
                <button
                    type="button"
                    className={strAllClassName}
                    onClick={() => fSetIntSelectedTypeId(null)}
                >
                    Tout
                </button>

                {tbTypes.map((objType) => {
                    let strClassName = 'type-filter__item';
                    if (intSelectedTypeId === objType.id) {
                        strClassName = 'type-filter__item type-filter__item--active';
                    }

                    return (
                        <button
                            key={objType.id}
                            type="button"
                            className={strClassName}
                            onClick={() => fSetIntSelectedTypeId(objType.id)}
                        >
                            {objType.name}
                        </button>
                    );
                })}
            </div>
        );
    }

    // 6. Contenu principal
    let objContent;
    if (blLoading) {
        objContent = <p className="product-list__message">Chargement…</p>;
    } else if (tbProducts.length === 0) {
        objContent = <p className="product-list__message">Aucun produit dans cette catégorie.</p>;
    } else {
        objContent = (
            <div className="product-list__grid">
                {tbVisibleProducts.map((objProduct) => (
                    <article key={objProduct.id} className="product-card">
                        <div className="product-card__media">
                            <img src={objProduct.imageUrl} alt={objProduct.name} className="product-card__image" />
                            <span className="product-card__tooltip">{objProduct.name}</span>
                        </div>
                        <p className="product-card__price">{fFormatPrice(objProduct.price)}</p>
                        <button
                            type="button"
                            className="product-card__button"
                            onClick={() => fOnSelectProduct(objProduct)}
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
            <h2 className="product-list__title">{strTitle}</h2>
            {objFilters}
            {objContent}
        </section>
    );
};

export default ProductList;