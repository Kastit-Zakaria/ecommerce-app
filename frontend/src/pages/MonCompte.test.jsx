import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import MemberRoute from '../components/MemberRoute';
import MonCompte from './MonCompte';
import { AuthProvider } from '../context/AuthContext';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

const objMember = { firstName: 'Camille', lastName: 'Dupont', email: 'c@exemple.com' };

// fMockApi : simule les réponses de l'API
// Reçoit : fGetMe (fonction qui renvoie la promesse de réponse pour /auth/me)
// Renvoie : rien
// Pourquoi : choisir la réponse de /auth/me, y compris une réponse encore en attente
const fMockApi = (fGetMe) => {
    objApi.get.mockImplementation((strUrl) => {
        if (strUrl === '/auth/me') {
            return fGetMe();
        }
        return Promise.resolve({ data: [] });
    });
};

// fRenderApp : affiche l'en-tête et trois routes dans le routeur, à l'adresse demandée
// Reçoit : strPath (l'adresse de départ)
// Renvoie : rien
// Pourquoi : tester la page Mon compte, sa protection et les redirections comme dans l'application
const fRenderApp = (strPath) => {
    render(
        <MemoryRouter initialEntries={[strPath]}>
            <AuthProvider>
                <Header objSelectedCategory={null} fOnSelectCategory={vi.fn()} />
                <Routes>
                    <Route path="/" element={<p>Page d'accueil</p>} />
                    <Route path="/about" element={<p>Page à propos</p>} />
                    <Route
                        path="/mon-compte"
                        element={
                            <MemberRoute>
                                <MonCompte />
                            </MemberRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
};

// fLogoutFromHeader : ouvre le dropdown puis clique sur « Se déconnecter »
// Reçoit : rien
// Renvoie : rien
// Pourquoi : partager la déconnexion entre les tests
const fLogoutFromHeader = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Mon compte' }));
    await userEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
};

describe('Page Mon compte', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        objApi.post.mockResolvedValue({ status: 204 });
    });

    it('affiche les six champs personnels modifiables du membre', async () => {
        fMockApi(() => Promise.resolve({ data: { ...objMember, address: 'Rue Exemple 12', postalCode: '1000', city: 'Bruxelles' } }));
        fRenderApp('/mon-compte');
        expect(await screen.findByDisplayValue('Bruxelles')).toBeInTheDocument();
        expect(screen.getByLabelText('Prénom')).toHaveValue('Camille');
        expect(screen.getByLabelText('Nom')).toHaveValue('Dupont');
        expect(screen.getByLabelText('Adresse e-mail')).toHaveValue('c@exemple.com');
        expect(screen.getAllByRole('textbox')).toHaveLength(6);
    });

    it('redirige un visiteur vers l\'accueil et ouvre le modal de connexion', async () => {
        fMockApi(() => Promise.reject({ response: { status: 401 } }));

        fRenderApp('/mon-compte');

        expect(await screen.findByText("Page d'accueil")).toBeInTheDocument();
        expect(await screen.findByRole('dialog', { name: 'Connexion' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Mon compte' })).not.toBeInTheDocument();
    });

    it('le modal ouvert par la redirection se ferme avec Échap et ne se rouvre pas', async () => {
        fMockApi(() => Promise.reject({ response: { status: 401 } }));
        fRenderApp('/mon-compte');
        await screen.findByRole('dialog', { name: 'Connexion' });

        await userEvent.keyboard('{Escape}');

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(screen.getByText("Page d'accueil")).toBeInTheDocument();
    });

    it('ne redirige pas tant que la session est en cours de vérification', async () => {
        let fResolveMe;
        const promiseMe = new Promise((fResolve) => {
            fResolveMe = fResolve;
        });
        fMockApi(() => promiseMe);

        fRenderApp('/mon-compte');

        expect(screen.queryByText("Page d'accueil")).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        fResolveMe({ data: objMember });

        expect(await screen.findByRole('heading', { level: 1, name: 'Mon compte' })).toBeInTheDocument();
    });

    it('mène à la page depuis « Paramètres »', async () => {
        fMockApi(() => Promise.resolve({ data: objMember }));
        fRenderApp('/about');
        await screen.findByText('Bienvenue, Camille');

        await userEvent.click(screen.getByRole('button', { name: 'Mon compte' }));
        await userEvent.click(screen.getByRole('link', { name: 'Paramètres' }));

        expect(await screen.findByRole('heading', { level: 1, name: 'Mon compte' })).toBeInTheDocument();
    });

    it('déconnexion depuis /mon-compte : retour à l\'accueil, sans modal de connexion', async () => {
        fMockApi(() => Promise.resolve({ data: objMember }));
        fRenderApp('/mon-compte');
        await screen.findByRole('heading', { level: 1, name: 'Mon compte' });

        await fLogoutFromHeader();

        expect(await screen.findByText("Page d'accueil")).toBeInTheDocument();
        expect(screen.queryByText(/Bienvenue/)).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Mon compte' })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('déconnexion depuis une autre page : le visiteur reste sur la page', async () => {
        fMockApi(() => Promise.resolve({ data: objMember }));
        fRenderApp('/about');
        await screen.findByText('Bienvenue, Camille');

        await fLogoutFromHeader();

        await waitFor(() => {
            expect(screen.queryByText(/Bienvenue/)).not.toBeInTheDocument();
        });
        expect(screen.getByText('Page à propos')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
