import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { AuthProvider } from '../context/AuthContext';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

const objMember = { firstName: 'Camille', lastName: 'Dupont', email: 'c@exemple.com' };

// fMockApi : simule les réponses de l'API
// Reçoit : objMe (le membre renvoyé par /auth/me, ou null pour une réponse 401)
// Renvoie : rien
// Pourquoi : choisir si une session existe au démarrage
const fMockApi = (objMe) => {
    objApi.get.mockImplementation((strUrl) => {
        if (strUrl === '/auth/me') {
            if (objMe === null) {
                return Promise.reject({ response: { status: 401 } });
            }
            return Promise.resolve({ data: objMe });
        }
        return Promise.resolve({ data: [] });
    });
};

// fRenderHeader : affiche l'en-tête dans le routeur et le contexte d'authentification
// Reçoit : rien
// Renvoie : rien
// Pourquoi : éviter de répéter la mise en place dans chaque test
const fRenderHeader = () => {
    render(
        <MemoryRouter>
            <AuthProvider>
                <Header objSelectedCategory={null} fOnSelectCategory={vi.fn()} />
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('Header (connexion)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("n'affiche aucun message de bienvenue quand personne n'est connecté", async () => {
        fMockApi(null);

        fRenderHeader();

        expect(await screen.findByRole('button', { name: 'Mon compte' })).toBeInTheDocument();
        expect(screen.queryByText(/Bienvenue/)).not.toBeInTheDocument();
    });

    it('affiche « Bienvenue, <prénom> » quand la session existe au démarrage', async () => {
        fMockApi(objMember);

        fRenderHeader();

        expect(await screen.findByText('Bienvenue, Camille')).toBeInTheDocument();
    });

    it("ouvre le modal avec l'icône compte, puis affiche la bienvenue après la connexion", async () => {
        fMockApi(null);
        objApi.post.mockResolvedValue({ data: objMember });
        fRenderHeader();

        const objAccount = screen.getByRole('button', { name: 'Mon compte' });
        await userEvent.click(objAccount);
        expect(screen.getByRole('dialog', { name: 'Connexion' })).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'c@exemple.com');
        await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret');
        await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

        expect(await screen.findByText('Bienvenue, Camille')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(objAccount).toHaveFocus();
    });

    it("n'ouvre plus le modal de connexion une fois connecté", async () => {
        fMockApi(objMember);
        fRenderHeader();
        await screen.findByText('Bienvenue, Camille');

        await userEvent.click(screen.getByRole('button', { name: 'Mon compte' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("n'affiche aucun dropdown pour un visiteur", async () => {
        fMockApi(null);
        fRenderHeader();

        const objAccount = await screen.findByRole('button', { name: 'Mon compte' });

        expect(objAccount).toHaveAttribute('aria-haspopup', 'dialog');
        expect(objAccount).not.toHaveAttribute('aria-expanded');
        expect(screen.queryByRole('link', { name: 'Paramètres' })).not.toBeInTheDocument();
    });
});

describe('Header (dropdown du compte)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fMockApi(objMember);
    });

    // fOpenMenu : attend la connexion puis ouvre le dropdown
    // Reçoit : rien
    // Renvoie : le bouton « Mon compte »
    // Pourquoi : partager l'ouverture entre les tests
    const fOpenMenu = async () => {
        fRenderHeader();
        await screen.findByText('Bienvenue, Camille');
        const objAccount = screen.getByRole('button', { name: 'Mon compte' });
        await userEvent.click(objAccount);
        return objAccount;
    };

    it('ouvre le dropdown : aria-expanded, aria-controls et focus sur « Paramètres »', async () => {
        fRenderHeader();
        await screen.findByText('Bienvenue, Camille');
        const objAccount = screen.getByRole('button', { name: 'Mon compte' });
        expect(objAccount).toHaveAttribute('aria-expanded', 'false');
        expect(objAccount).toHaveAttribute('aria-controls', 'account-panel');
        expect(screen.queryByRole('link', { name: 'Paramètres' })).not.toBeInTheDocument();

        await userEvent.click(objAccount);

        expect(objAccount).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Paramètres' })).toHaveFocus();
    });

    it('propose « Paramètres » puis « Se déconnecter », dans une liste sans rôle menu', async () => {
        await fOpenMenu();

        const tbItems = screen.getAllByRole('listitem');
        expect(tbItems).toHaveLength(2);
        expect(tbItems[0]).toHaveTextContent('Paramètres');
        expect(tbItems[1]).toHaveTextContent('Se déconnecter');
        expect(screen.getByRole('link', { name: 'Paramètres' })).toHaveAttribute('href', '/mon-compte');
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it("se ferme avec l'icône compte", async () => {
        const objAccount = await fOpenMenu();

        await userEvent.click(objAccount);

        expect(objAccount).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('link', { name: 'Paramètres' })).not.toBeInTheDocument();
    });

    it("se ferme avec Échap et rend le focus à l'icône compte", async () => {
        const objAccount = await fOpenMenu();

        await userEvent.keyboard('{Escape}');

        expect(objAccount).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('button', { name: 'Se déconnecter' })).not.toBeInTheDocument();
        expect(objAccount).toHaveFocus();
    });

    it('se ferme au clic en dehors, sans rendre le focus à l\'icône compte', async () => {
        const objAccount = await fOpenMenu();

        await userEvent.click(document.body);

        expect(objAccount).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('button', { name: 'Se déconnecter' })).not.toBeInTheDocument();
        expect(objAccount).not.toHaveFocus();
    });

    it('se ferme après le choix de « Paramètres »', async () => {
        const objAccount = await fOpenMenu();

        await userEvent.click(screen.getByRole('link', { name: 'Paramètres' }));

        expect(objAccount).toHaveAttribute('aria-expanded', 'false');
        expect(objAccount).toHaveFocus();
    });

    it('déconnecte le membre : la bienvenue disparaît, le focus revient, et l\'icône rouvre le modal', async () => {
        objApi.post.mockResolvedValue({ status: 204 });
        const objAccount = await fOpenMenu();

        await userEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

        await waitFor(() => {
            expect(screen.queryByText(/Bienvenue/)).not.toBeInTheDocument();
        });
        expect(objApi.post).toHaveBeenCalledWith('/auth/logout');
        expect(screen.queryByRole('button', { name: 'Se déconnecter' })).not.toBeInTheDocument();
        expect(objAccount).toHaveFocus();

        await userEvent.click(objAccount);
        expect(screen.getByRole('dialog', { name: 'Connexion' })).toBeInTheDocument();
    });

    it('échec réseau : message dans le dropdown ouvert, le membre reste connecté', async () => {
        objApi.post.mockRejectedValue(new Error('Network Error'));
        const objAccount = await fOpenMenu();

        await userEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

        expect(await screen.findByText(/Déconnexion impossible pour le moment/)).toBeInTheDocument();
        expect(screen.getByText('Bienvenue, Camille')).toBeInTheDocument();
        expect(objAccount).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    });
});
