import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import HeroVideo from '../components/HeroVideo';
import Reassurance from '../components/Reassurance';
import Universes from '../components/Universes';
import ProductList from '../components/ProductList';
import EditorialBanner from '../components/EditorialBanner';
import ProductModal from '../components/ProductModal';

// Home : page d'accueil (bannière, réassurance, univers, produits, bannière éditoriale)
// Reçoit : objSelectedCategory (catégorie choisie ou null), fOnSelectCategory (fonction pour la changer)
// Renvoie : le JSX de la page
// Pourquoi : assembler les sections de l'accueil et gérer l'ouverture du modal produit
const Home = ({ objSelectedCategory, fOnSelectCategory }) => {
    const [objSelectedProduct, fSetObjSelectedProduct] = useState(null);
    const [blUniversesLoaded, fSetBlUniversesLoaded] = useState(false);
    const objProductsRef = useRef(null);
    const { hash } = useLocation();

    // fHandleUniversesLoaded : note que la section « Nos univers » a fini de se charger
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : cette section pousse la liste des produits vers le bas en s'affichant ; il faut attendre avant de défiler
    const fHandleUniversesLoaded = useCallback(() => {
        fSetBlUniversesLoaded(true);
    }, []);

    // Quand une catégorie est choisie (header ou univers) ou que l'adresse contient #produits, on descend jusqu'aux produits
    useEffect(() => {
        if (!blUniversesLoaded) {
            return;
        }
        if (objSelectedCategory !== null || hash === '#produits') {
            objProductsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [objSelectedCategory, hash, blUniversesLoaded]);

    let objModal = null;
    if (objSelectedProduct !== null) {
        objModal = (
            <ProductModal
                intProductId={objSelectedProduct.id}
                fOnClose={() => fSetObjSelectedProduct(null)}
            />
        );
    }

    return (
        <div className="home-page">
            <HeroVideo />

            <Reassurance />

            <Universes fOnSelectCategory={fOnSelectCategory} fOnLoaded={fHandleUniversesLoaded} />

            <div id="produits" ref={objProductsRef}>
                <ProductList
                    objCategory={objSelectedCategory}
                    fOnSelectProduct={fSetObjSelectedProduct}
                />
            </div>

            <EditorialBanner />

            {objModal}
        </div>
    );
};

export default Home;