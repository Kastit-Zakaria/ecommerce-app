import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

// fRenderApp : affiche ScrollToTop avec deux pages et des liens de navigation
// Reçoit : rien
// Renvoie : rien
// Pourquoi : simuler un changement de page, avec ou sans ancre
const fRenderApp = () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <ScrollToTop />
            <nav>
                <Link to="/cgv">Aller aux CGV</Link>
                <Link to="/#produits">Aller aux produits</Link>
            </nav>
            <Routes>
                <Route path="/" element={<p>Accueil</p>} />
                <Route path="/cgv" element={<p>Page CGV</p>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('ScrollToTop', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    it('remonte en haut quand on change de page', async () => {
        fRenderApp();
        window.scrollTo.mockClear();

        await userEvent.click(screen.getByRole('link', { name: 'Aller aux CGV' }));

        expect(screen.getByText('Page CGV')).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    });

    it('désactive la restauration automatique du défilement par le navigateur', () => {
        fRenderApp();

        expect(window.history.scrollRestoration).toBe('manual');
    });

    it("ne remonte pas quand l'URL contient une ancre", async () => {
        fRenderApp();
        window.scrollTo.mockClear();

        await userEvent.click(screen.getByRole('link', { name: 'Aller aux produits' }));

        expect(window.scrollTo).not.toHaveBeenCalled();
    });
});
