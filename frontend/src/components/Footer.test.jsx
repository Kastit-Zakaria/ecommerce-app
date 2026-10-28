import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import fSubscribeNewsletter from '../services/newsletter';

// Simulation de l'appel à l'API : aucun appel réseau réel
vi.mock('../services/newsletter', () => ({
    default: vi.fn(),
}));

// fRenderFooter : affiche le footer dans un routeur (il contient des liens)
// Reçoit : fOnOpenCookieSettings (fonction appelée par « Gérer les cookies »)
// Renvoie : rien
// Pourquoi : éviter de répéter le routeur dans chaque test
const fRenderFooter = (fOnOpenCookieSettings) => {
    render(
        <MemoryRouter>
            <Footer fOnOpenCookieSettings={fOnOpenCookieSettings} />
        </MemoryRouter>
    );
};

describe('Footer — newsletter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche une case de consentement non pré-cochée avec un lien vers /confidentialite", () => {
        fRenderFooter(vi.fn());

        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByRole('link', { name: 'politique de confidentialité' })).toHaveAttribute('href', '/confidentialite');
    });

    it("n'envoie rien sans consentement et affiche une erreur", async () => {
        fRenderFooter(vi.fn());

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'marie@exemple.com');
        await userEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

        expect(fSubscribeNewsletter).not.toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent('Veuillez cocher la case de consentement');
    });

    it('envoie l’e-mail avec le consentement et affiche le message de succès', async () => {
        fSubscribeNewsletter.mockResolvedValue({ data: { message: 'Merci, votre inscription est enregistrée.' } });
        fRenderFooter(vi.fn());

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'marie@exemple.com');
        await userEvent.click(screen.getByRole('checkbox'));
        await userEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

        expect(fSubscribeNewsletter).toHaveBeenCalledWith('marie@exemple.com', true);
        expect(await screen.findByText('Merci, votre inscription est enregistrée.')).toBeInTheDocument();
    });

    it("affiche le message d'erreur du back quand l'e-mail est déjà inscrit", async () => {
        fSubscribeNewsletter.mockRejectedValue({
            response: { data: { message: 'Cette adresse e-mail est déjà inscrite.' } },
        });
        fRenderFooter(vi.fn());

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'marie@exemple.com');
        await userEvent.click(screen.getByRole('checkbox'));
        await userEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

        expect(await screen.findByText('Cette adresse e-mail est déjà inscrite.')).toBeInTheDocument();
    });

    it('rouvre le bandeau cookies avec « Gérer les cookies »', async () => {
        const fOnOpenCookieSettings = vi.fn();
        fRenderFooter(fOnOpenCookieSettings);

        await userEvent.click(screen.getByRole('button', { name: 'Gérer les cookies' }));

        expect(fOnOpenCookieSettings).toHaveBeenCalled();
    });
});
