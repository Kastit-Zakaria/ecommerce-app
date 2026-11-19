import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from './LoginModal';
import { AuthProvider } from '../context/AuthContext';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

// fRenderModal : affiche le modal dans le contexte d'authentification
// Reçoit : fOnClose (fonction de fermeture simulée)
// Renvoie : rien
// Pourquoi : éviter de répéter la mise en place dans chaque test
const fRenderModal = (fOnClose) => {
    render(
        <AuthProvider>
            <LoginModal fOnClose={fOnClose} />
        </AuthProvider>
    );
};

describe('LoginModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        objApi.get.mockRejectedValue({ response: { status: 401 } });
    });

    it('affiche des champs liés à leurs labels, avec les bons attributs', () => {
        fRenderModal(vi.fn());

        const objEmail = screen.getByLabelText('Adresse e-mail');
        const objPassword = screen.getByLabelText('Mot de passe');

        expect(objEmail).toHaveAttribute('type', 'email');
        expect(objEmail).toHaveAttribute('autocomplete', 'username');
        expect(objEmail).toBeRequired();
        expect(objPassword).toHaveAttribute('type', 'password');
        expect(objPassword).toHaveAttribute('autocomplete', 'current-password');
        expect(objPassword).toBeRequired();
    });

    it("place le focus sur le champ email à l'ouverture", () => {
        fRenderModal(vi.fn());

        expect(screen.getByLabelText('Adresse e-mail')).toHaveFocus();
    });

    it('refuse un envoi avec des champs vides et affiche un message', async () => {
        fRenderModal(vi.fn());

        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(screen.getByRole('alert')).toHaveTextContent('obligatoires');
        expect(objApi.post).not.toHaveBeenCalled();
    });

    it("envoie l'email et le mot de passe, puis ferme le modal en cas de succès", async () => {
        objApi.post.mockResolvedValue({ data: { firstName: 'Camille', lastName: 'Dupont', email: 'c@exemple.com' } });
        const fOnClose = vi.fn();
        fRenderModal(fOnClose);

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'c@exemple.com');
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret');
        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(objApi.post).toHaveBeenCalledWith('/auth/login', { email: 'c@exemple.com', password: 'secret' });
        expect(fOnClose).toHaveBeenCalled();
    });

    it("affiche le message d'erreur de l'API, vide le mot de passe et garde le modal ouvert", async () => {
        objApi.post.mockRejectedValue({ response: { status: 401, data: { message: 'Email ou mot de passe incorrect' } } });
        const fOnClose = vi.fn();
        fRenderModal(fOnClose);

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'c@exemple.com');
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'faux');
        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect');
        expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
        expect(screen.getByLabelText('Adresse e-mail')).toHaveValue('c@exemple.com');
        expect(fOnClose).not.toHaveBeenCalled();
    });

    it('affiche un message générique si le serveur ne répond pas', async () => {
        objApi.post.mockRejectedValue(new Error('Network Error'));
        fRenderModal(vi.fn());

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'c@exemple.com');
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret');
        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Connexion impossible');
    });

    it("désactive le bouton pendant l'envoi", async () => {
        objApi.post.mockReturnValue(new Promise(() => {}));
        fRenderModal(vi.fn());

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'c@exemple.com');
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret');
        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(screen.getByRole('button', { name: 'Connexion…' })).toBeDisabled();
    });

    it('garde le focus dans le modal avec Tab et Maj+Tab', async () => {
        fRenderModal(vi.fn());
        const objClose = screen.getByRole('button', { name: 'Fermer' });
        const objSubmit = screen.getByRole('button', { name: 'Se connecter' });

        // Du dernier contrôle, Tab revient au premier (Fermer)
        objSubmit.focus();
        await userEvent.tab();
        expect(objClose).toHaveFocus();

        // Du premier contrôle, Maj+Tab va au dernier
        await userEvent.tab({ shift: true });
        expect(objSubmit).toHaveFocus();
    });

    it('se ferme avec Échap, la croix et le clic sur le fond', async () => {
        const fOnClose = vi.fn();
        fRenderModal(fOnClose);

        await userEvent.keyboard('{Escape}');
        expect(fOnClose).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
        expect(fOnClose).toHaveBeenCalledTimes(2);

        await userEvent.click(document.querySelector('.product-modal__backdrop'));
        expect(fOnClose).toHaveBeenCalledTimes(3);
    });

    it("rend le focus à l'élément d'origine à la fermeture et libère le défilement", () => {
        const objTrigger = document.createElement('button');
        document.body.appendChild(objTrigger);
        objTrigger.focus();

        const { unmount } = render(
            <AuthProvider>
                <LoginModal fOnClose={vi.fn()} />
            </AuthProvider>
        );
        expect(document.body.style.overflow).toBe('hidden');

        unmount();

        expect(objTrigger).toHaveFocus();
        expect(document.body.style.overflow).toBe('');
        objTrigger.remove();
    });
});
