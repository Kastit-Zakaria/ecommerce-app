import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductModal from './ProductModal';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn() },
}));

const objProduct = {
    id: 10,
    name: 'Polo bleu',
    description: 'Un polo en coton.',
    price: 64.9,
    stock: 4,
    imageUrl: '/polo.jpg',
    brand: { id: 1, name: 'Marque Test' },
    sizes: [{ id: 1, label: 'M' }],
};

describe('ProductModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche nom, marque, prix et image du produit', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });

        render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);

        expect(await screen.findByRole('heading', { name: 'Polo bleu' })).toBeInTheDocument();
        expect(screen.getByText('Marque Test')).toBeInTheDocument();
        expect(screen.getByText(/64,90/)).toBeInTheDocument();
        expect(screen.getByAltText('Polo bleu')).toHaveAttribute('src', '/polo.jpg');
        expect(objApi.get).toHaveBeenCalledWith('/products/10');
    });

    it('appelle fOnClose avec la touche Échap', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const fOnClose = vi.fn();

        render(<ProductModal intProductId={10} fOnClose={fOnClose} />);
        await screen.findByRole('heading', { name: 'Polo bleu' });
        await userEvent.keyboard('{Escape}');

        expect(fOnClose).toHaveBeenCalled();
    });

    it('appelle fOnClose au clic sur le bouton Fermer', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const fOnClose = vi.fn();

        render(<ProductModal intProductId={10} fOnClose={fOnClose} />);
        await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));

        expect(fOnClose).toHaveBeenCalled();
    });
});
