import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterModal from './RegisterModal';
import { AuthProvider } from '../context/AuthContext';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

// Valeurs valides pour chaque champ, rangées par label
const OBJ_VALID_VALUES = {
    'Nom': 'Martin',
    'Prénom': 'Alex',
    'Adresse': 'Avenue Louise 5',
    'Code postal': '1050',
    'Ville': 'Ixelles',
    'Adresse e-mail': 'alex@exemple.com',
    'Mot de passe': 'MotDePasse-2',
};

// fRenderModal : affiche le modal dans le routeur et le contexte d'authentification
// Reçoit : fOnClose et fOnSwitchToLogin (fonctions simulées)
// Renvoie : rien
// Pourquoi : éviter de répéter la mise en place dans chaque test
const fRenderModal = (fOnClose, fOnSwitchToLogin) => {
    render(
        <MemoryRouter>
            <AuthProvider>
                <RegisterModal fOnClose={fOnClose} fOnSwitchToLogin={fOnSwitchToLogin} />
            </AuthProvider>
        </MemoryRouter>
    );
};

// fFillForm : remplit le formulaire avec les valeurs valides, sauf celles à remplacer
// Reçoit : objOverrides (label → valeur ; une chaîne vide laisse le champ vide)
// Renvoie : une promesse, terminée quand tout est saisi
// Pourquoi : chaque test ne précise que ce qui le concerne
const fFillForm = async (objOverrides) => {
    const objValues = { ...OBJ_VALID_VALUES, ...objOverrides };
    for (const strLabel of Object.keys(objValues)) {
        if (objValues[strLabel] !== '') {
            await userEvent.type(screen.getByLabelText(strLabel), objValues[strLabel]);
        }
    }
};

describe('RegisterModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        objApi.get.mockRejectedValue({ response: { status: 401 } });
    });

    it('affiche les sept champs obligatoires, liés à leurs labels, avec les bons attributs', () => {
        fRenderModal(vi.fn(), vi.fn());

        expect(screen.getByRole('dialog', { name: 'Créer un compte' })).toBeInTheDocument();
        for (const strLabel of Object.keys(OBJ_VALID_VALUES)) {
            expect(screen.getByLabelText(strLabel)).toBeRequired();
        }
        expect(screen.getByLabelText('Nom')).toHaveAttribute('autocomplete', 'family-name');
        expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('type', 'email');
        expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
        expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('autocomplete', 'new-password');
        expect(screen.getByLabelText('Mot de passe')).toHaveAccessibleDescription('8 caractères minimum.');
    });

    it("place le focus sur le champ Nom à l'ouverture", () => {
        fRenderModal(vi.fn(), vi.fn());

        expect(screen.getByLabelText('Nom')).toHaveFocus();
    });

    it("refuse un formulaire vide, sans appeler l'API", async () => {
        fRenderModal(vi.fn(), vi.fn());

        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Tous les champs sont obligatoires.');
        expect(screen.getByLabelText('Nom')).toHaveFocus();
        expect(objApi.post).not.toHaveBeenCalled();
    });

    it('refuse un champ manquant et place le focus dessus', async () => {
        fRenderModal(vi.fn(), vi.fn());

        await fFillForm({ 'Ville': '' });
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Tous les champs sont obligatoires.');
        expect(screen.getByLabelText('Ville')).toHaveFocus();
        expect(objApi.post).not.toHaveBeenCalled();
    });

    it('refuse un email invalide et un mot de passe trop court', async () => {
        fRenderModal(vi.fn(), vi.fn());

        await fFillForm({ 'Adresse e-mail': 'alex.exemple.com' });
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));
        expect(screen.getByRole('alert')).toHaveTextContent("L'adresse e-mail n'est pas valide.");
        expect(screen.getByLabelText('Adresse e-mail')).toHaveFocus();

        await userEvent.clear(screen.getByLabelText('Adresse e-mail'));
        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'alex@exemple.com');
        await userEvent.clear(screen.getByLabelText('Mot de passe'));
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'court');
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));
        expect(screen.getByRole('alert')).toHaveTextContent('au moins 8 caractères');
        expect(screen.getByLabelText('Mot de passe')).toHaveFocus();

        expect(objApi.post).not.toHaveBeenCalled();
    });

    it('envoie les sept champs nettoyés, puis ferme le modal en cas de succès', async () => {
        objApi.post.mockResolvedValue({ data: { firstName: 'Alex', lastName: 'Martin', email: 'alex@exemple.com' } });
        const fOnClose = vi.fn();
        fRenderModal(fOnClose, vi.fn());

        await fFillForm({ 'Prénom': '  Alex  ' });
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(objApi.post).toHaveBeenCalledWith('/auth/register', {
            lastName: 'Martin',
            firstName: 'Alex',
            address: 'Avenue Louise 5',
            postalCode: '1050',
            city: 'Ixelles',
            email: 'alex@exemple.com',
            password: 'MotDePasse-2',
        });
        expect(fOnClose).toHaveBeenCalled();
    });

    it("affiche le refus d'un email déjà utilisé, garde les champs sauf le mot de passe et place le focus sur l'email", async () => {
        objApi.post.mockRejectedValue({
            response: { status: 409, data: { message: 'Un compte existe déjà avec cette adresse e-mail.' } },
        });
        const fOnClose = vi.fn();
        fRenderModal(fOnClose, vi.fn());

        await fFillForm({});
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Un compte existe déjà avec cette adresse e-mail.');
        expect(screen.getByLabelText('Adresse e-mail')).toHaveFocus();
        expect(screen.getByLabelText('Nom')).toHaveValue('Martin');
        expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Créer mon compte' })).toBeEnabled();
        expect(fOnClose).not.toHaveBeenCalled();
    });

    it('affiche un message générique si le serveur ne répond pas', async () => {
        objApi.post.mockRejectedValue(new Error('Network Error'));
        fRenderModal(vi.fn(), vi.fn());

        await fFillForm({});
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Inscription impossible pour le moment');
        expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
        expect(screen.getByLabelText('Mot de passe')).toHaveFocus();
    });

    it("désactive le bouton pendant l'envoi", async () => {
        objApi.post.mockReturnValue(new Promise(() => {}));
        fRenderModal(vi.fn(), vi.fn());

        await fFillForm({});
        await userEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

        expect(screen.getByRole('button', { name: 'Création…' })).toBeDisabled();
    });

    it('propose de passer à la connexion', async () => {
        const fOnSwitchToLogin = vi.fn();
        fRenderModal(vi.fn(), fOnSwitchToLogin);

        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(fOnSwitchToLogin).toHaveBeenCalled();
    });

    it('garde le focus dans le modal avec Tab et Maj+Tab', async () => {
        fRenderModal(vi.fn(), vi.fn());
        const objClose = screen.getByRole('button', { name: 'Fermer' });
        const objSwitch = screen.getByRole('button', { name: 'Se connecter' });

        // Du dernier contrôle, Tab revient au premier (Fermer)
        objSwitch.focus();
        await userEvent.tab();
        expect(objClose).toHaveFocus();

        // Du premier contrôle, Maj+Tab va au dernier
        await userEvent.tab({ shift: true });
        expect(objSwitch).toHaveFocus();
    });

    it('se ferme avec Échap, la croix et le clic sur le fond', async () => {
        const fOnClose = vi.fn();
        fRenderModal(fOnClose, vi.fn());

        await userEvent.keyboard('{Escape}');
        expect(fOnClose).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
        expect(fOnClose).toHaveBeenCalledTimes(2);

        await userEvent.click(document.querySelector('.product-modal__backdrop'));
        expect(fOnClose).toHaveBeenCalledTimes(3);
    });
});
