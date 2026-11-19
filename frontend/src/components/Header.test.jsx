import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
