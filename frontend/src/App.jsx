import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import MentionsLegales from './pages/MentionsLegales';
import Cgv from './pages/Cgv';
import Confidentialite from './pages/Confidentialite';
import Cookies from './pages/Cookies';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';

// App : composant racine, il porte la catégorie choisie et déclare les routes
// Reçoit : rien
// Renvoie : le JSX de toute l'application
// Pourquoi : partager la catégorie sélectionnée entre l'en-tête et la page d'accueil
const App = () => {
    const [objSelectedCategory, fSetObjSelectedCategory] = useState(null);
    const [blCookieSettingsOpen, fSetBlCookieSettingsOpen] = useState(false);

    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Placé avant les routes : son effet passe avant celui de Home (descente vers les produits) */}
                <ScrollToTop />
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
                    <Route path="/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/cgv" element={<Cgv />} />
                    <Route path="/confidentialite" element={<Confidentialite />} />
                    <Route path="/cookies" element={<Cookies />} />
                </Routes>
                <Footer fOnOpenCookieSettings={() => fSetBlCookieSettingsOpen(true)} />
                <CookieBanner
                    blForceOpen={blCookieSettingsOpen}
                    fOnClose={() => fSetBlCookieSettingsOpen(false)}
                />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;