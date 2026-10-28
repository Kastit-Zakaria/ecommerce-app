import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from './CookieBanner';
import { STR_CONSENT_KEY } from '../utils/cookieConsent';

// fRenderBanner : affiche le bandeau dans un routeur (il contient un lien)
// Reçoit : blForceOpen (true pour forcer l'affichage), fOnClose (fonction de fermeture)
// Renvoie : rien
// Pourquoi : éviter de répéter le routeur dans chaque test
const fRenderBanner = (blForceOpen, fOnClose) => {
    render(
        <MemoryRouter>
            <CookieBanner blForceOpen={blForceOpen} fOnClose={fOnClose} />
        </MemoryRouter>
    );
};

describe('CookieBanner', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('est affiché à la première visite avec Accepter, Refuser et un lien vers /cookies', () => {
        fRenderBanner(false, vi.fn());

        expect(screen.getByRole('button', { name: 'Accepter' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'En savoir plus' })).toHaveAttribute('href', '/cookies');
    });

    it('mémorise « accepted » au clic sur Accepter et se ferme', async () => {
        const fOnClose = vi.fn();
        fRenderBanner(false, fOnClose);

        await userEvent.click(screen.getByRole('button', { name: 'Accepter' }));

        expect(localStorage.getItem(STR_CONSENT_KEY)).toBe('accepted');
        expect(fOnClose).toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('mémorise « refused » au clic sur Refuser et se ferme', async () => {
        fRenderBanner(false, vi.fn());

        await userEvent.click(screen.getByRole('button', { name: 'Refuser' }));

        expect(localStorage.getItem(STR_CONSENT_KEY)).toBe('refused');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("n'est pas affiché si un choix est déjà mémorisé", () => {
        localStorage.setItem(STR_CONSENT_KEY, 'accepted');

        fRenderBanner(false, vi.fn());

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('est réaffiché quand le footer demande de le rouvrir', () => {
        localStorage.setItem(STR_CONSENT_KEY, 'refused');

        fRenderBanner(true, vi.fn());

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
