import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn() },
}));

const tbCategories = [{ id: 3, name: 'Homme', imageUrl: '/homme.jpg' }];

// fRenderHome : affiche l'accueil à l'adresse donnée
// Reçoit : strPath (adresse), objCategory (catégorie choisie ou null)
// Renvoie : rien
// Pourquoi : simuler une arrivée sur l'accueil, avec ou sans ancre ou catégorie
const fRenderHome = (strPath, objCategory) => {
    render(
        <MemoryRouter initialEntries={[strPath]}>
            <Home objSelectedCategory={objCategory} fOnSelectCategory={vi.fn()} />
        </MemoryRouter>
    );
};

describe('Home', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
        objApi.get.mockImplementation((strUrl) => {
            if (strUrl === '/categories') {
                return Promise.resolve({ data: tbCategories });
            }
            return Promise.resolve({ data: [] });
        });
    });

    it("descend jusqu'aux produits quand l'adresse contient #produits, une fois les univers chargés", async () => {
        fRenderHome('/#produits', null);

        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();

        await screen.findByText('Homme');

        expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it("ne descend pas sans ancre ni catégorie choisie", async () => {
        fRenderHome('/', null);

        await screen.findByText('Homme');

        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });

    it('descend jusqu\'aux produits quand une catégorie est choisie', async () => {
        fRenderHome('/', tbCategories[0]);

        await screen.findByText('Homme', { selector: '.universe-card__name' });

        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
});
