import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonCompte from './MonCompte';
import { AuthProvider } from '../context/AuthContext';
import useAuth from '../context/useAuth';
import objApi from '../services/api';
vi.mock('../services/api', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }));
const objMember = { firstName: 'Camille', lastName: 'Dupont', email: 'c@exemple.com', address: 'Rue Exemple 12', postalCode: '1000', city: 'Bruxelles' };
const HeaderPreview = () => { const { objUser } = useAuth(); return <p>Bienvenue, {objUser?.firstName}</p>; };
const ProtectedPage = () => { const { objUser, blChecking } = useAuth(); if (blChecking || !objUser) return null; return <MonCompte />; };
const fRender = () => render(<AuthProvider><HeaderPreview /><ProtectedPage /></AuthProvider>);
beforeEach(() => { vi.resetAllMocks(); objApi.get.mockResolvedValue({ data: objMember }); });
describe('US6', () => {
    it('charge six champs depuis une lecture fraîche et met à jour le contexte après sauvegarde', async () => {
        objApi.put.mockResolvedValue({ data: { ...objMember, firstName: 'Sam' } });
        fRender();
        await screen.findByDisplayValue('Bruxelles');
        expect(objApi.get).toHaveBeenCalledTimes(2);
        expect(screen.getAllByRole('textbox')).toHaveLength(6);
        await userEvent.clear(screen.getByLabelText('Prénom'));
        await userEvent.type(screen.getByLabelText('Prénom'), 'Sam');
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
        await screen.findByText('Vos informations ont été mises à jour.');
        expect(objApi.put).toHaveBeenCalledWith('/auth/me', { ...objMember, firstName: 'Sam' });
        expect(screen.getByText('Bienvenue, Sam')).toBeInTheDocument();
    });
    it('garde les modifications après une erreur et permet de réessayer', async () => {
        objApi.put.mockRejectedValue({ response: { status: 409, data: { message: 'Cette adresse e-mail est déjà utilisée.' } } });
        fRender(); await screen.findByDisplayValue('Bruxelles');
        await userEvent.clear(screen.getByLabelText('Ville'));
        await userEvent.type(screen.getByLabelText('Ville'), 'Gand');
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('déjà utilisée');
        expect(screen.getByLabelText('Ville')).toHaveValue('Gand');
        expect(screen.getByRole('button', { name: 'Enregistrer les modifications' })).toBeEnabled();
    });
    it('annonce le chargement et propose de reprendre une lecture échouée', async () => {
        objApi.get.mockResolvedValueOnce({ data: objMember }).mockRejectedValueOnce(new Error('réseau'));
        fRender();
        expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger');
        objApi.get.mockResolvedValue({ data: objMember });
        await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
        await screen.findByDisplayValue('Bruxelles');
    });
    it('bloque les doubles soumissions pendant la sauvegarde', async () => {
        let fResolve;
        objApi.put.mockReturnValue(new Promise((fDone) => { fResolve = fDone; }));
        fRender(); await screen.findByDisplayValue('Bruxelles');
        const objForm = screen.getByRole('form', { name: 'Informations personnelles' });
        fireEvent.submit(objForm); fireEvent.submit(objForm);
        expect(objApi.put).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled();
        fResolve({ data: objMember });
        await screen.findByText('Vos informations ont été mises à jour.');
    });
    // fSubmitProfile : affiche la page, puis envoie le formulaire des informations
    // Reçoit : rien
    // Renvoie : une promesse
    // Pourquoi : partager la préparation entre les tests du focus
    const fSubmitProfile = async () => {
        fRender();
        await screen.findByDisplayValue('Bruxelles');
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
    };

    it.each([
        { intStatus: 400, strField: 'firstName', strLabel: 'Prénom' },
        { intStatus: 400, strField: 'lastName', strLabel: 'Nom' },
        { intStatus: 409, strField: 'email', strLabel: 'Adresse e-mail' },
        { intStatus: 400, strField: 'address', strLabel: 'Adresse' },
        { intStatus: 400, strField: 'postalCode', strLabel: 'Code postal' },
        { intStatus: 400, strField: 'city', strLabel: 'Ville' },
    ])('après un refus $intStatus sur « $strField », place le focus sur « $strLabel »', async ({ intStatus, strField, strLabel }) => {
        // Message neutre : seul « field » doit décider du focus
        objApi.put.mockRejectedValue({ response: { status: intStatus, data: { message: 'Saisie refusée.', field: strField } } });

        await fSubmitProfile();

        await waitFor(() => expect(screen.getByLabelText(strLabel)).toHaveFocus());
        expect(screen.getByRole('alert')).toHaveTextContent('Saisie refusée.');
    });
    it.each([
        { strCase: 'origine refusée', intStatus: 403, objData: { message: 'Origine non autorisée.' } },
        { strCase: 'message connu sans champ désigné', intStatus: 400, objData: { message: "L'adresse e-mail n'est pas valide." } },
        { strCase: 'champ absent du formulaire', intStatus: 400, objData: { message: 'Saisie refusée.', field: 'password' } },
    ])('sans champ utilisable ($strCase), place le focus sur le premier champ', async ({ intStatus, objData }) => {
        objApi.put.mockRejectedValue({ response: { status: intStatus, data: objData } });

        await fSubmitProfile();

        await waitFor(() => expect(screen.getByLabelText('Prénom')).toHaveFocus());
        expect(screen.getByRole('alert')).toHaveTextContent(objData.message);
    });
    it('place le focus sur le premier champ si le serveur ne répond pas', async () => {
        objApi.put.mockRejectedValue(new Error('réseau'));

        await fSubmitProfile();

        await waitFor(() => expect(screen.getByLabelText('Prénom')).toHaveFocus());
    });
    it('après un succès, place le focus sur le message de confirmation', async () => {
        objApi.put.mockResolvedValue({ data: objMember });

        await fSubmitProfile();

        const objMessage = await screen.findByText('Vos informations ont été mises à jour.');
        expect(objMessage).toHaveAttribute('tabindex', '-1');
        await waitFor(() => expect(objMessage).toHaveFocus());
    });
    it('oublie la session expirée', async () => {
        objApi.put.mockRejectedValue({ response: { status: 401 } });
        fRender(); await screen.findByDisplayValue('Bruxelles');
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
        await waitFor(() => expect(screen.queryByRole('form')).not.toBeInTheDocument());
    });
});
