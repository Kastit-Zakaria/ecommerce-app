import { useState, useRef } from 'react';
import CategoryList from '../components/CategoryList';
import HeroVideo from '../components/HeroVideo';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const productsRef = useRef(null);

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
            <CategoryList
                selectedCategory={selectedCategory}
                onSelect={handleSelectCategory}
            />

            <HeroVideo />

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