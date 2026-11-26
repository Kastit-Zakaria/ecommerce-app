import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonCompte from '../pages/MonCompte';
import { AuthProvider } from '../context/AuthContext';
import useAuth from '../context/useAuth';
import objApi from '../services/api';

// Simulation d'axios : aucun appel réseau réel
vi.mock('../services/api', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }));

const objMember = {
    firstName: 'Camille', lastName: 'Dupont', email: 'c@exemple.com',
    address: 'Rue Exemple 12', postalCode: '1000', city: 'Bruxelles',
};

// HeaderPreview : affiche le membre connu du contexte
// Reçoit : rien
// Renvoie : le texte de bienvenue
// Pourquoi : vérifier que le membre reste connecté après le changement
const HeaderPreview = () => {
    const { objUser } = useAuth();
    if (objUser === null) {
        return <p>Visiteur</p>;
    }
    return <p>Bienvenue, {objUser.firstName}</p>;
};

// ProtectedPage : affiche Mon compte seulement pour un membre
// Reçoit : rien
// Renvoie : la page, ou rien
// Pourquoi : reproduire la protection de la route sans routeur
const ProtectedPage = () => {
    const { objUser, blChecking } = useAuth();
    if (blChecking || objUser === null) {
        return null;
    }
    return <MonCompte />;
};

// fRender : affiche la page et attend le formulaire du mot de passe
// Reçoit : rien
// Renvoie : une promesse
// Pourquoi : partager la préparation entre les tests
const fRender = async () => {
    render(<AuthProvider><HeaderPreview /><ProtectedPage /></AuthProvider>);
    await screen.findByRole('form', { name: 'Modifier mon mot de passe' });
};

// fFill : saisit les trois mots de passe
// Reçoit : strCurrent, strNew, strConfirmation (les trois saisies)
// Renvoie : une promesse
// Pourquoi : éviter de répéter la saisie
const fFill = async (strCurrent, strNew, strConfirmation) => {
    await userEvent.type(screen.getByLabelText('Mot de passe actuel'), strCurrent);
    await userEvent.type(screen.getByLabelText('Nouveau mot de passe'), strNew);
    await userEvent.type(screen.getByLabelText('Confirmer le nouveau mot de passe'), strConfirmation);
};

// fSubmit : clique sur le bouton d'envoi
// Reçoit : rien
// Renvoie : une promesse
// Pourquoi : partager l'envoi entre les tests
const fSubmit = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }));
};

// fExpectEmptyFields : vérifie que les trois champs sont vides
// Reçoit : rien
// Renvoie : rien
// Pourquoi : aucun mot de passe ne doit rester affiché après une tentative
const fExpectEmptyFields = () => {
    expect(screen.getByLabelText('Mot de passe actuel')).toHaveValue('');
    expect(screen.getByLabelText('Nouveau mot de passe')).toHaveValue('');
    expect(screen.getByLabelText('Confirmer le nouveau mot de passe')).toHaveValue('');
};

describe('US6 : modification du mot de passe', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        objApi.get.mockResolvedValue({ data: objMember });
        objApi.put.mockResolvedValue({ status: 204 });
    });

    it('affiche un formulaire séparé avec trois champs masqués, liés à leur label', async () => {
        await fRender();

        const objCurrent = screen.getByLabelText('Mot de passe actuel');
        const objNew = screen.getByLabelText('Nouveau mot de passe');
        const objConfirmation = screen.getByLabelText('Confirmer le nouveau mot de passe');
        const objForm = screen.getByRole('form', { name: 'Modifier mon mot de passe' });

        [objCurrent, objNew, objConfirmation].forEach((objInput) => {
            expect(objInput).toHaveAttribute('type', 'password');
            expect(objForm).toContainElement(objInput);
        });
        expect(objCurrent).toHaveAttribute('autocomplete', 'current-password');
        expect(objNew).toHaveAttribute('autocomplete', 'new-password');
        expect(objConfirmation).toHaveAttribute('autocomplete', 'new-password');
        expect(objNew).toHaveAccessibleDescription('8 caractères minimum.');
        expect(screen.getByRole('form', { name: 'Informations personnelles' })).not.toContainElement(objCurrent);
        fExpectEmptyFields();
    });

    it('envoie les trois valeurs, confirme le succès, vide les champs et garde le membre connecté', async () => {
        await fRender();
        await fFill('MotDePasse-1', 'MotDePasse-2', 'MotDePasse-2');

        await fSubmit();

        expect(await screen.findByText('Votre mot de passe a été modifié.')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Votre mot de passe a été modifié.');
        expect(objApi.put).toHaveBeenCalledTimes(1);
        expect(objApi.put).toHaveBeenCalledWith('/auth/me/password', {
            currentPassword: 'MotDePasse-1', newPassword: 'MotDePasse-2', confirmation: 'MotDePasse-2',
        });
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Bienvenue, Camille')).toBeInTheDocument();
        fExpectEmptyFields();
    });

    it('annonce le message de refus, vide les champs et garde le membre connecté', async () => {
        objApi.put.mockRejectedValue({ response: { status: 400, data: { message: 'Le mot de passe actuel est incorrect.' } } });
        await fRender();
        await fFill('Faux-mot-de-passe', 'MotDePasse-2', 'MotDePasse-2');

        await fSubmit();

        expect(await screen.findByRole('alert')).toHaveTextContent('Le mot de passe actuel est incorrect.');
        expect(screen.queryByText('Votre mot de passe a été modifié.')).not.toBeInTheDocument();
        expect(screen.getByText('Bienvenue, Camille')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Modifier le mot de passe' })).toBeEnabled();
        fExpectEmptyFields();
    });

    it('transmet un formulaire vide à l\'API et affiche son message', async () => {
        objApi.put.mockRejectedValue({ response: { status: 400, data: { message: 'Tous les champs sont obligatoires.' } } });
        await fRender();

        await fSubmit();

        expect(await screen.findByRole('alert')).toHaveTextContent('Tous les champs sont obligatoires.');
        expect(objApi.put).toHaveBeenCalledTimes(1);
    });

    it('affiche un message général si le serveur ne répond pas, et vide les champs', async () => {
        objApi.put.mockRejectedValue(new Error('réseau'));
        await fRender();
        await fFill('MotDePasse-1', 'MotDePasse-2', 'MotDePasse-2');

        await fSubmit();

        expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de modifier le mot de passe.');
        expect(screen.getByText('Bienvenue, Camille')).toBeInTheDocument();
        fExpectEmptyFields();
    });

    it('efface l\'erreur précédente après une tentative réussie', async () => {
        objApi.put.mockRejectedValueOnce({ response: { status: 400, data: { message: 'La confirmation ne correspond pas au nouveau mot de passe.' } } });
        await fRender();
        await fFill('MotDePasse-1', 'MotDePasse-2', 'MotDePasse-3');
        await fSubmit();
        await screen.findByRole('alert');

        await fFill('MotDePasse-1', 'MotDePasse-2', 'MotDePasse-2');
        await fSubmit();

        await screen.findByText('Votre mot de passe a été modifié.');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('bloque les doubles envois pendant la modification', async () => {
        let fResolve;
        objApi.put.mockReturnValue(new Promise((fDone) => { fResolve = fDone; }));
        await fRender();
        const objForm = screen.getByRole('form', { name: 'Modifier mon mot de passe' });

        fireEvent.submit(objForm);
        fireEvent.submit(objForm);

        expect(objApi.put).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Modification…' })).toBeDisabled();
        fResolve({ status: 204 });
        await screen.findByText('Votre mot de passe a été modifié.');
    });

    it('oublie le membre si la session a expiré', async () => {
        objApi.put.mockRejectedValue({ response: { status: 401, data: { message: 'Non connecté.' } } });
        await fRender();
        await fFill('MotDePasse-1', 'MotDePasse-2', 'MotDePasse-2');

        await fSubmit();

        await waitFor(() => expect(screen.getByText('Visiteur')).toBeInTheDocument());
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });
});
