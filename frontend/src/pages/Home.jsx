import { useState, useRef, useEffect } from 'react';
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
    const objProductsRef = useRef(null);

    // Quand une catégorie est choisie (header ou univers), on descend jusqu'aux produits
    useEffect(() => {
        if (objSelectedCategory !== null) {
            objProductsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [objSelectedCategory]);

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

            <Universes fOnSelectCategory={fOnSelectCategory} />

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