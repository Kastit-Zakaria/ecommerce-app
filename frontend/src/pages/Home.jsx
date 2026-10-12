import { useState, useRef, useEffect } from 'react';
import HeroVideo from '../components/HeroVideo';
import Reassurance from '../components/Reassurance';
import Universes from '../components/Universes';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';

const Home = ({ selectedCategory, onSelectCategory }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const productsRef = useRef(null);

    // Quand une catégorie est choisie (header ou univers), on descend jusqu'aux produits
    useEffect(() => {
        if (selectedCategory !== null) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedCategory]);

    let modal = null;
    if (selectedProduct !== null) {
        modal = (
            <ProductModal
                productId={selectedProduct.id}
                onClose={() => setSelectedProduct(null)}
            />
        );
    }

    return (
        <div className="home-page">
            <HeroVideo />

            <Reassurance />

            <Universes onSelectCategory={onSelectCategory} />

            <div id="produits" ref={productsRef}>
                <ProductList
                    category={selectedCategory}
                    onSelectProduct={setSelectedProduct}
                />
            </div>

            {modal}
        </div>
    );
};

export default Home;