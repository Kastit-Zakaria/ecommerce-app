import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryList from './CategoryList';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn() },
}));

const tbCategories = [
    { id: 1, name: 'Homme' },
    { id: 2, name: 'Femme' },
];

describe('CategoryList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche les catégories renvoyées par l'API", async () => {
        objApi.get.mockResolvedValue({ data: tbCategories });

        render(<CategoryList objSelectedCategory={null} fOnSelect={vi.fn()} />);

        expect(await screen.findByRole('button', { name: 'Homme' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Femme' })).toBeInTheDocument();
        expect(objApi.get).toHaveBeenCalledWith('/categories');
    });

    it('appelle fOnSelect avec la catégorie cliquée', async () => {
        objApi.get.mockResolvedValue({ data: tbCategories });
        const fOnSelect = vi.fn();

        render(<CategoryList objSelectedCategory={null} fOnSelect={fOnSelect} />);
        await userEvent.click(await screen.findByRole('button', { name: 'Femme' }));

        expect(fOnSelect).toHaveBeenCalledWith(tbCategories[1]);
    });

    it('marque la catégorie sélectionnée comme active', async () => {
        objApi.get.mockResolvedValue({ data: tbCategories });

        render(<CategoryList objSelectedCategory={tbCategories[0]} fOnSelect={vi.fn()} />);

        expect(await screen.findByRole('button', { name: 'Homme' })).toHaveClass('category-list__item--active');
        expect(screen.getByRole('button', { name: 'Femme' })).not.toHaveClass('category-list__item--active');
    });
});
