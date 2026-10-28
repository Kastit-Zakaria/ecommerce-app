import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';

// App : composant racine, il porte la catégorie choisie et déclare les routes
// Reçoit : rien
// Renvoie : le JSX de toute l'application
// Pourquoi : partager la catégorie sélectionnée entre l'en-tête et la page d'accueil
const App = () => {
    const [objSelectedCategory, fSetObjSelectedCategory] = useState(null);

    return (
        <BrowserRouter>
            <Header
                objSelectedCategory={objSelectedCategory}
                fOnSelectCategory={fSetObjSelectedCategory}
            />
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            objSelectedCategory={objSelectedCategory}
                            fOnSelectCategory={fSetObjSelectedCategory}
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