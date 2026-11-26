// Impression : pilote Chrome pour produire le PDF d'une page HTML, puis corrige le fichier obtenu
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { PDFDocument, PDFName, PDFString, PDFHexString, PDFDict, PDFArray } from 'pdf-lib';
import { STR_RELATIVE_BASE } from './mise-en-page.mjs';

const INT_START_TRIES = 150;
const INT_START_DELAY_MS = 200;

// fWait : attend un court instant
// Reçoit : intDelay (en millisecondes)
// Renvoie : une promesse tenue après ce délai
// Pourquoi : laisser à Chrome le temps de démarrer ou d'afficher la page
const fWait = (intDelay) => new Promise((fDone) => { setTimeout(fDone, intDelay); });

// fFindBrowser : cherche le navigateur à utiliser pour l'impression
// Reçoit : rien (la variable d'environnement CHROME_PATH est prioritaire)
// Renvoie : le chemin de Chrome, ou à défaut d'Edge ou de Chromium
// Pourquoi : fonctionner sans réglage sur un poste habituel
const fFindBrowser = () => {
    const tbCandidates = [process.env.CHROME_PATH];
    for (const strRoot of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]) {
        if (strRoot) {
            tbCandidates.push(path.join(strRoot, 'Google/Chrome/Application/chrome.exe'));
            tbCandidates.push(path.join(strRoot, 'Microsoft/Edge/Application/msedge.exe'));
        }
    }
    tbCandidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium');
    const strFound = tbCandidates.find((strPath) => strPath && fs.existsSync(strPath));
    if (!strFound) {
        throw new Error('Chrome est introuvable : indiquez son chemin dans la variable d\'environnement CHROME_PATH.');
    }
    return strFound;
};

// fConnect : ouvre le canal de commande d'une page du navigateur
// Reçoit : strAddress (l'adresse WebSocket de la page)
// Renvoie : { fSend, fClose } : envoyer une commande, fermer le canal
// Pourquoi : demander à Chrome d'afficher puis d'imprimer les documents
const fConnect = async (strAddress) => {
    const objSocket = new WebSocket(strAddress);
    await new Promise((fDone, fFail) => {
        objSocket.onopen = fDone;
        objSocket.onerror = () => { fFail(new Error('Connexion à Chrome impossible.')); };
    });
    let intLastId = 0;
    const objPending = new Map();
    objSocket.onmessage = (objEvent) => {
        const objMessage = JSON.parse(objEvent.data);
        const objWaiting = objPending.get(objMessage.id);
        if (!objWaiting) {
            return;
        }
        objPending.delete(objMessage.id);
        if (objMessage.error) {
            objWaiting.fFail(new Error(objMessage.error.message));
        } else {
            objWaiting.fDone(objMessage.result);
        }
    };
    // fSend : envoie une commande à Chrome
    // Reçoit : strMethod (la commande), objParams (ses paramètres). Renvoie : une promesse de réponse.
    // Pourquoi : associer chaque réponse à sa demande.
    const fSend = (strMethod, objParams = {}) => new Promise((fDone, fFail) => {
        intLastId += 1;
        objPending.set(intLastId, { fDone, fFail });
        objSocket.send(JSON.stringify({ id: intLastId, method: strMethod, params: objParams }));
    });
    // fClose : ferme le canal. Reçoit : rien. Renvoie : rien. Pourquoi : libérer le processus.
    const fClose = () => { objSocket.close(); };
    return { fSend, fClose };
};

// fStartPrinter : démarre Chrome sans fenêtre, avec un profil temporaire
// Reçoit : rien
// Renvoie : { fPrint, fStop } : imprimer une page HTML, arrêter Chrome et supprimer les fichiers temporaires
// Pourquoi : ne jamais toucher au profil de la personne qui lance la génération
export const fStartPrinter = async () => {
    const strWorkFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'sera-pdf-'));
    const strProfile = path.join(strWorkFolder, 'profil');
    const objProcess = spawn(fFindBrowser(), [
        '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${strProfile}`, '--no-first-run', 'about:blank',
    ], { stdio: 'ignore' });
    const promiseExit = new Promise((fDone) => { objProcess.once('exit', fDone); });
    let objChannel = null;

    // fStop : arrête Chrome et efface le dossier temporaire
    // Reçoit : rien. Renvoie : une promesse. Pourquoi : ne rien laisser sur le poste, même après une erreur.
    const fStop = async () => {
        if (objChannel !== null) {
            objChannel.fSend('Browser.close').catch(() => {});
            await Promise.race([promiseExit, fWait(5000)]);
            objChannel.fClose();
        }
        objProcess.kill();
        try {
            fs.rmSync(strWorkFolder, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
        } catch {
            console.warn('Dossier temporaire à supprimer à la main : ' + strWorkFolder);
        }
    };

    try {
        // Chrome écrit son port de commande dans ce fichier dès qu'il est prêt
        const strPortFile = path.join(strProfile, 'DevToolsActivePort');
        let strPort = '';
        for (let intTry = 0; intTry < INT_START_TRIES && strPort === ''; intTry += 1) {
            await fWait(INT_START_DELAY_MS);
            if (fs.existsSync(strPortFile)) {
                [strPort] = fs.readFileSync(strPortFile, 'utf8').split('\n');
            }
        }
        if (strPort === '') {
            throw new Error('Chrome n\'a pas démarré.');
        }
        const tbTargets = await (await fetch(`http://127.0.0.1:${strPort}/json/list`)).json();
        objChannel = await fConnect(tbTargets.find((objTarget) => objTarget.type === 'page').webSocketDebuggerUrl);
    } catch (objError) {
        await fStop();
        throw objError;
    }

    // fPrint : imprime une page HTML
    // Reçoit : strName (le nom du document), strHtml (la page)
    // Renvoie : { bufPdf, tbHeadings } : le PDF brut et le texte des titres, dans l'ordre
    // Pourquoi : attendre polices et images, et refuser un lien interne sans destination
    const fPrint = async (strName, strHtml) => {
        const strHtmlFile = path.join(strWorkFolder, `${strName}.html`);
        fs.writeFileSync(strHtmlFile, strHtml);
        await objChannel.fSend('Page.navigate', { url: pathToFileURL(strHtmlFile).href });
        await fWait(800);
        const objResult = await objChannel.fSend('Runtime.evaluate', {
            returnByValue: true,
            awaitPromise: true,
            expression: `(async () => {
                await document.fonts.ready;
                await Promise.all([...document.images].map((objImage) => objImage.decode()));
                return {
                    tbHeadings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((objTitle) => objTitle.textContent),
                    tbBroken: [...document.querySelectorAll('a[href^="#"]')]
                        .map((objLink) => decodeURIComponent(objLink.getAttribute('href').slice(1)))
                        .filter((strId) => !document.getElementById(strId)),
                };
            })()`,
        });
        if (objResult.exceptionDetails) {
            throw new Error(`Affichage impossible de ${strName} : une image ne se charge pas.`);
        }
        const { tbHeadings, tbBroken } = objResult.result.value;
        if (tbBroken.length > 0) {
            throw new Error(`Liens internes sans destination dans ${strName}.md : ${tbBroken.join(', ')}`);
        }
        const objPrint = await objChannel.fSend('Page.printToPDF', {
            preferCSSPageSize: true, printBackground: true, generateTaggedPDF: true, generateDocumentOutline: true,
        });
        return { bufPdf: Buffer.from(objPrint.data, 'base64'), tbHeadings };
    };

    return { fPrint, fStop };
};

// fListOutline : met à plat les signets d'un PDF
// Reçoit : objParent (le dictionnaire dont on parcourt les enfants), tbItems (la liste à compléter)
// Renvoie : la liste des signets, dans l'ordre de lecture
// Pourquoi : les associer un à un aux titres du document
const fListOutline = (objParent, tbItems = []) => {
    let objItem = objParent.lookupMaybe(PDFName.of('First'), PDFDict);
    while (objItem) {
        tbItems.push(objItem);
        fListOutline(objItem, tbItems);
        objItem = objItem.lookupMaybe(PDFName.of('Next'), PDFDict);
    }
    return tbItems;
};

// fFinishPdf : corrige le PDF produit par Chrome et renseigne ses propriétés
// Reçoit : { bufPdf, tbHeadings, objDocument, strVersion }
// Renvoie : une promesse de { bufResult, intPages }
// Pourquoi : des signets sans texte doublé, des liens entre documents relatifs et aucune trace du poste
export const fFinishPdf = async ({ bufPdf, tbHeadings, objDocument, strVersion }) => {
    const objPdf = await PDFDocument.load(bufPdf, { updateMetadata: false });

    // Chrome double le texte des titres placés en haut de page : chaque signet est réécrit
    const tbItems = fListOutline(objPdf.catalog.lookup(PDFName.of('Outlines'), PDFDict));
    if (tbItems.length !== tbHeadings.length) {
        throw new Error(`${objDocument.strName} : ${tbItems.length} signets pour ${tbHeadings.length} titres.`);
    }
    tbItems.forEach((objItem, intIndex) => {
        objItem.set(PDFName.of('Title'), PDFHexString.fromText(tbHeadings[intIndex]));
    });

    for (const objPage of objPdf.getPages()) {
        const tbAnnotations = objPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
        if (!tbAnnotations) {
            continue;
        }
        for (let intIndex = 0; intIndex < tbAnnotations.size(); intIndex += 1) {
            const objAction = tbAnnotations.lookup(intIndex, PDFDict).lookupMaybe(PDFName.of('A'), PDFDict);
            if (!objAction || !objAction.has(PDFName.of('URI'))) {
                continue;
            }
            const strUri = objAction.lookup(PDFName.of('URI')).decodeText();
            if (strUri.startsWith('file:')) {
                throw new Error(`${objDocument.strName} : un lien pointe vers un fichier du poste (${strUri}).`);
            }
            if (strUri.startsWith(STR_RELATIVE_BASE)) {
                // Chemin recalculé depuis docs/pdf/, dossier des PDF
                const strFromRoot = strUri.slice(STR_RELATIVE_BASE.length);
                objAction.set(PDFName.of('URI'), PDFString.of(path.posix.relative('docs/pdf', strFromRoot)));
            }
        }
    }

    objPdf.setTitle(`SERA — ${objDocument.strTitle}`);
    objPdf.setAuthor('SERA');
    objPdf.setCreator('SERA');
    objPdf.setProducer('SERA');
    objPdf.setSubject(`${objDocument.strTitle} — ${strVersion}`);
    objPdf.setLanguage('fr-BE');
    return { bufResult: await objPdf.save(), intPages: objPdf.getPageCount() };
};
