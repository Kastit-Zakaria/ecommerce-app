import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';

const App = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <BrowserRouter>
            <Header
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    }
                />
                <Route path="/about" element={<About />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
};

export default App;