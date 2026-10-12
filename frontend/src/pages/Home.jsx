import { useState } from 'react';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
                onSelect={setSelectedCategory}
            />
            <ProductList
                category={selectedCategory}
                onSelectProduct={setSelectedProduct}
            />
            {modal}
        </div>
    );
};

export default Home;