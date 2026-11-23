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
    it('oublie la session expirée', async () => {
        objApi.put.mockRejectedValue({ response: { status: 401 } });
        fRender(); await screen.findByDisplayValue('Bruxelles');
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
        await waitFor(() => expect(screen.queryByRole('form')).not.toBeInTheDocument());
    });
});
