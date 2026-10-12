import { useState } from 'react';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <div className="home-page">
            <CategoryList
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
            />
            <ProductList category={selectedCategory} />
        </div>
    );
};

export default Home;