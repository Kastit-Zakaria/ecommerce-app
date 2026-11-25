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
    sizes: [{ id: 1, label: 'M' }, { id: 2, label: 'L' }],
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

    it("place le focus dans la fenêtre à l'ouverture", async () => {
        objApi.get.mockResolvedValue({ data: objProduct });

        render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);

        expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('rend le focus au bouton qui a ouvert la fiche à la fermeture', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const objTrigger = document.createElement('button');
        document.body.appendChild(objTrigger);
        objTrigger.focus();

        const { unmount } = render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);
        expect(objTrigger).not.toHaveFocus();

        unmount();

        expect(objTrigger).toHaveFocus();
        objTrigger.remove();
    });

    it('appelle fOnClose avec la touche Échap', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const fOnClose = vi.fn();

        render(<ProductModal intProductId={10} fOnClose={fOnClose} />);
        await screen.findByRole('heading', { name: 'Polo bleu' });
        await userEvent.keyboard('{Escape}');

        expect(fOnClose).toHaveBeenCalled();
    });

    it('garde le focus dans la fiche avec Tab : après la dernière taille, retour sur Fermer', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const objOutside = document.createElement('button');
        document.body.appendChild(objOutside);

        render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);
        await screen.findByRole('heading', { name: 'Polo bleu' });

        // Depuis la fenêtre (focus initial), Tab va sur le premier contrôle
        await userEvent.tab();
        expect(screen.getByRole('button', { name: 'Fermer' })).toHaveFocus();
        await userEvent.tab();
        expect(screen.getByRole('button', { name: 'M' })).toHaveFocus();
        await userEvent.tab();
        expect(screen.getByRole('button', { name: 'L' })).toHaveFocus();
        // « Ajouter au panier » est désactivé : la boucle revient sur Fermer
        await userEvent.tab();
        expect(screen.getByRole('button', { name: 'Fermer' })).toHaveFocus();
        expect(objOutside).not.toHaveFocus();
        objOutside.remove();
    });

    it('garde le focus dans la fiche avec Maj+Tab, y compris depuis la fenêtre à l\'ouverture', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });

        render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);
        await screen.findByRole('heading', { name: 'Polo bleu' });
        expect(screen.getByRole('dialog')).toHaveFocus();

        await userEvent.tab({ shift: true });
        expect(screen.getByRole('button', { name: 'L' })).toHaveFocus();

        screen.getByRole('button', { name: 'Fermer' }).focus();
        await userEvent.tab({ shift: true });
        expect(screen.getByRole('button', { name: 'L' })).toHaveFocus();
    });

    it('bloque le défilement de la page pendant l\'ouverture et le rétablit à la fermeture', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });

        const { unmount } = render(<ProductModal intProductId={10} fOnClose={vi.fn()} />);
        expect(document.body.style.overflow).toBe('hidden');

        unmount();

        expect(document.body.style.overflow).toBe('');
    });

    it('appelle fOnClose au clic sur le bouton Fermer', async () => {
        objApi.get.mockResolvedValue({ data: objProduct });
        const fOnClose = vi.fn();

        render(<ProductModal intProductId={10} fOnClose={fOnClose} />);
        await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));

        expect(fOnClose).toHaveBeenCalled();
    });
});
