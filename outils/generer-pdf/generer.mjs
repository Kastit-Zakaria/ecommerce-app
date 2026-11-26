// Génère les PDF de docs/pdf/ à partir des fichiers Markdown de docs/
// Utilisation : npm run generer -- [noms des documents] [--date "1er janvier 2027"] [--version "Sprint 3"]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fBuildHtml } from './mise-en-page.mjs';
import { fStartPrinter, fFinishPdf } from './impression.mjs';

// Version affichée sur la page de garde et en pied de page
const STR_DEFAULT_VERSION = 'Sprint 2';

// Documents livrés. blBreakSections : chaque section commence une page ; blSmallTables : tableaux larges
const TB_DOCUMENTS = [
    { strName: 'guide-utilisateur', strTitle: 'Guide utilisateur', blBreakSections: true, blSmallTables: false },
    { strName: 'documentation-technique', strTitle: 'Documentation technique', blBreakSections: true, blSmallTables: false },
    { strName: 'tests-fonctionnels', strTitle: 'Cahier de tests fonctionnels', blBreakSections: false, blSmallTables: true },
    { strName: 'deploiement', strTitle: 'Mise en ligne', blBreakSections: false, blSmallTables: false },
];

const strDocsFolder = path.resolve(import.meta.dirname, '../../docs');
const strOutputFolder = path.join(strDocsFolder, 'pdf');

// fFormatToday : écrit la date du jour en toutes lettres
// Reçoit : rien
// Renvoie : par exemple « 1er janvier 2027 »
// Pourquoi : dater la page de garde quand aucune date n'est indiquée
const fFormatToday = () => {
    const strDate = new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    return strDate.replace(/^1 /, '1er ');
};

// fSelectDocuments : choisit les documents à générer
// Reçoit : tbNames (les noms demandés ; liste vide pour tous)
// Renvoie : les descriptions des documents choisis
// Pourquoi : ne régénérer que les documents modifiés, et signaler un nom mal écrit
const fSelectDocuments = (tbNames) => {
    if (tbNames.length === 0) {
        return TB_DOCUMENTS;
    }
    return tbNames.map((strName) => {
        const objDocument = TB_DOCUMENTS.find((objItem) => objItem.strName === strName);
        if (!objDocument) {
            const strKnown = TB_DOCUMENTS.map((objItem) => objItem.strName).join(', ');
            throw new Error(`Document inconnu : ${strName}. Documents possibles : ${strKnown}.`);
        }
        return objDocument;
    });
};

// fMain : génère les documents demandés
// Reçoit : rien (lit les arguments de la ligne de commande)
// Renvoie : une promesse
// Pourquoi : tout se fait en une commande ; un fichier n'est remplacé que si sa génération a réussi
const fMain = async () => {
    const { values: objOptions, positionals: tbNames } = parseArgs({
        options: { date: { type: 'string' }, version: { type: 'string' } },
        allowPositionals: true,
    });
    const tbSelected = fSelectDocuments(tbNames);
    const strDate = objOptions.date || fFormatToday();
    const strVersion = objOptions.version || STR_DEFAULT_VERSION;

    fs.mkdirSync(strOutputFolder, { recursive: true });
    const objPrinter = await fStartPrinter();
    try {
        for (const objDocument of tbSelected) {
            const strHtml = fBuildHtml({ objDocument, tbDocuments: TB_DOCUMENTS, strDocsFolder, strVersion, strDate });
            const { bufPdf, tbHeadings } = await objPrinter.fPrint(objDocument.strName, strHtml);
            const { bufResult, intPages } = await fFinishPdf({ bufPdf, tbHeadings, objDocument, strVersion });
            fs.writeFileSync(path.join(strOutputFolder, `${objDocument.strName}.pdf`), bufResult);
            console.log(`docs/pdf/${objDocument.strName}.pdf : ${intPages} pages, daté du ${strDate}`);
        }
    } finally {
        await objPrinter.fStop();
    }
};

try {
    await fMain();
} catch (objError) {
    console.error('Échec de la génération : ' + objError.message);
    process.exitCode = 1;
}
