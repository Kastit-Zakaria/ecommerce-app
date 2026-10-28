import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductList from './ProductList';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn() },
}));

const tbProducts = [
    { id: 10, name: 'Polo bleu', price: 64.9, imageUrl: '/polo.jpg', type: { id: 1, name: 'Polos' } },
    { id: 11, name: 'Jean slim', price: 80, imageUrl: '/jean.jpg', type: { id: 2, name: 'Jeans' } },
];

const objCategory = { id: 3, name: 'Homme' };

describe('ProductList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche le message quand la catégorie est vide', async () => {
        objApi.get.mockResolvedValue({ data: [] });

        render(<ProductList objCategory={objCategory} fOnSelectProduct={vi.fn()} />);

        expect(await screen.findByText('Aucun produit dans cette catégorie.')).toBeInTheDocument();
        expect(objApi.get).toHaveBeenCalledWith('/categories/3/products');
    });

    it('affiche les miniatures avec le nom en infobulle', async () => {
        objApi.get.mockResolvedValue({ data: tbProducts });

        render(<ProductList objCategory={objCategory} fOnSelectProduct={vi.fn()} />);

        expect(await screen.findByAltText('Polo bleu')).toHaveAttribute('src', '/polo.jpg');
        expect(screen.getByText('Polo bleu', { selector: '.product-card__tooltip' })).toBeInTheDocument();
        expect(screen.getByText('Jean slim', { selector: '.product-card__tooltip' })).toBeInTheDocument();
    });

    it('charge les derniers arrivages sans catégorie', async () => {
        objApi.get.mockResolvedValue({ data: tbProducts });

        render(<ProductList objCategory={null} fOnSelectProduct={vi.fn()} />);

        expect(await screen.findByText('Derniers arrivages')).toBeInTheDocument();
        expect(objApi.get).toHaveBeenCalledWith('/products/latest');
    });

    it('appelle fOnSelectProduct au clic sur « Voir le produit »', async () => {
        objApi.get.mockResolvedValue({ data: tbProducts });
        const fOnSelectProduct = vi.fn();

        render(<ProductList objCategory={objCategory} fOnSelectProduct={fOnSelectProduct} />);
        const tbButtons = await screen.findAllByRole('button', { name: 'Voir le produit' });
        await userEvent.click(tbButtons[0]);

        expect(fOnSelectProduct).toHaveBeenCalledWith(tbProducts[0]);
    });

    it('filtre les produits par type', async () => {
        objApi.get.mockResolvedValue({ data: tbProducts });

        render(<ProductList objCategory={objCategory} fOnSelectProduct={vi.fn()} />);
        await userEvent.click(await screen.findByRole('button', { name: 'Jeans' }));

        expect(screen.queryByAltText('Polo bleu')).not.toBeInTheDocument();
        expect(screen.getByAltText('Jean slim')).toBeInTheDocument();
    });
});
