// Mise en page : transforme un fichier Markdown de docs/ en une page HTML prête à imprimer
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Marked } from 'marked';

const objRequire = createRequire(import.meta.url);

// Adresse provisoire des liens entre documents : Chrome transformerait un chemin relatif en chemin du poste
export const STR_RELATIVE_BASE = 'https://relatif.invalid/';

// Graisses de la police Jost utilisées par la mise en page
const TB_FONT_WEIGHTS = [300, 400, 500, 600];

// Caractères couverts par chaque fichier de la police
const OBJ_FONT_RANGES = {
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2190-21FF, U+2212',
    'latin-ext': 'U+0100-0130, U+0132-0151, U+0154-02BA',
};

// fEscapeHtml : protège un texte placé dans la page HTML
// Reçoit : strText (le texte brut)
// Renvoie : le texte avec les caractères réservés remplacés
// Pourquoi : un guillemet ou un chevron dans une légende ne doit pas casser la page
const fEscapeHtml = (strText) => strText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// fPlainText : retire les balises d'un fragment HTML
// Reçoit : strHtml (le contenu d'un titre)
// Renvoie : le texte seul
// Pourquoi : calculer l'identifiant du titre et son libellé dans le sommaire
const fPlainText = (strHtml) => strHtml
    .replace(/<[^>]+>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// fSlug : calcule l'identifiant d'un titre
// Reçoit : strText (le texte du titre)
// Renvoie : l'identifiant, calculé comme sur GitHub
// Pourquoi : les liens internes du Markdown doivent fonctionner à l'identique dans le PDF
const fSlug = (strText) => strText.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

// fFontFaces : déclare la police des titres
// Reçoit : rien
// Renvoie : les règles CSS contenant les fichiers de la police Jost
// Pourquoi : intégrer la police au PDF sans dépendre d'une police installée ni d'un serveur externe
const fFontFaces = () => {
    const strFolder = path.join(path.dirname(objRequire.resolve('@fontsource/jost/package.json')), 'files');
    const tbRules = [];
    for (const intWeight of TB_FONT_WEIGHTS) {
        for (const [strSet, strRange] of Object.entries(OBJ_FONT_RANGES)) {
            const strData = fs.readFileSync(path.join(strFolder, `jost-${strSet}-${intWeight}-normal.woff2`)).toString('base64');
            tbRules.push(`@font-face{font-family:'Jost';font-weight:${intWeight};src:url(data:font/woff2;base64,${strData}) format('woff2');unicode-range:${strRange};}`);
        }
    }
    return tbRules.join('\n');
};

// fStyles : construit la feuille de style d'un document
// Reçoit : objDocument (sa description), strVersion (la version affichée en pied de page)
// Renvoie : le CSS complet
// Pourquoi : même charte pour tous les documents, avec les sauts de page et la taille des tableaux propres à chacun
const fStyles = (objDocument, strVersion) => {
    let strSectionRule = '';
    if (objDocument.blBreakSections) {
        strSectionRule = 'h2.section{break-before:page;margin-top:0;}';
    }
    let strTableRule = 'table{font-size:8.8pt;} th,td{padding:4px 6px;}';
    if (objDocument.blSmallTables) {
        strTableRule = 'table{font-size:7.6pt;} th,td{padding:4px;}';
    }
    return `${fFontFaces()}
@page{size:A4;margin:20mm 18mm 20mm 18mm;
 @bottom-left{content:"SERA · ${objDocument.strTitle} · ${strVersion}";font:8pt 'Segoe UI';color:#666;vertical-align:middle;}
 @bottom-right{content:"Page " counter(page) " / " counter(pages);font:8pt 'Segoe UI';color:#666;vertical-align:middle;}}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{margin:0;font:10pt/1.5 'Segoe UI',sans-serif;color:#1a1a1a;}
.cover{break-after:page;height:250mm;position:relative;}
.cover .brand{position:absolute;top:81mm;font:300 54pt/1 'Jost';letter-spacing:.32em;color:#111;}
.cover .rule{position:absolute;top:124mm;width:60mm;border-top:2px solid #1a1a1a;}
.cover .title{position:absolute;top:136mm;font:400 26pt/1.2 'Jost';color:#1a1a1a;}
.cover .meta{position:absolute;top:156mm;font-size:12pt;line-height:21pt;color:#444;}
h2,h3,h4{font-family:'Jost';color:#111;break-after:avoid;break-inside:avoid;}
h2{font-size:17pt;line-height:1.3;font-weight:500;margin:26px 0 12px;padding-bottom:5px;border-bottom:1px solid #444;}
h3{font-size:12.5pt;line-height:1.3;font-weight:600;margin:18px 0 9px;}
h4{font-size:10.5pt;font-weight:600;margin:14px 0 8px;}
${strSectionRule}
.toc-page{break-after:page;padding-top:14px;}
.toc-page h2.toc-title{margin-top:36px;}
ul.toc{list-style:none;padding:0;margin:0;}
ul.toc li{margin:0;border-bottom:1px dotted #bbb;font-size:10.5pt;line-height:31px;}
p{margin:0 0 11px;}
a{color:#1f4e79;text-decoration:none;}
ul,ol{margin:0 0 11px;padding-left:40px;} li{margin:0 0 1px;} li>ul,li>ol{margin:0;}
code{font-family:Consolas,monospace;font-size:.88em;background:#f2f2f2;padding:0 2px;overflow-wrap:anywhere;}
pre{background:#f7f7f7;border:1px solid #d9d9d9;padding:8px 10px;margin:0 0 11px;break-inside:avoid;}
pre code{font-size:7.5pt;line-height:1.3;background:none;padding:0;white-space:pre-wrap;display:block;}
table{width:100%;border-collapse:collapse;margin:0 0 14px;line-height:1.5;}
th,td{border:1px solid #9a9a9a;text-align:left;vertical-align:top;}
th{background:#ececec;font-weight:600;}
thead{display:table-header-group;} tr{break-inside:avoid;}
td code,th code{font-size:1em;}
${strTableRule}
blockquote{margin:0 0 14px;padding:6px 12px;background:#f6f6f6;border-left:3px solid #888;break-inside:avoid;}
blockquote p{margin:0;}
figure{margin:0 0 14px;text-align:center;break-inside:avoid;}
figure img{max-width:100%;max-height:130mm;box-sizing:border-box;border:1px solid #cfcfcf;vertical-align:top;}
figcaption{font-style:italic;font-size:8.5pt;color:#555;margin-top:2px;}
hr{display:none;}`;
};

// fBuildHtml : construit la page HTML d'un document
// Reçoit : { objDocument, tbDocuments, strDocsFolder, strVersion, strDate }
// Renvoie : le HTML complet : page de garde, page du sommaire, puis le contenu
// Pourquoi : le Markdown reste la seule source à modifier
export const fBuildHtml = ({ objDocument, tbDocuments, strDocsFolder, strVersion, strDate }) => {
    let strMarkdown = fs.readFileSync(path.join(strDocsFolder, `${objDocument.strName}.md`), 'utf8').replace(/\r\n/g, '\n');
    // Le titre principal figure déjà sur la page de garde
    strMarkdown = strMarkdown.replace(/^# .*\n/, '');
    // Un sommaire écrit dans le Markdown est remplacé par celui construit plus bas
    strMarkdown = strMarkdown.replace(/^## Sommaire\n[\s\S]*?(?=^## )/m, '');

    const tbSections = [];
    const objSlugCounts = new Map();
    const objMarked = new Marked({ gfm: true });
    objMarked.use({
        // Méthodes aux noms imposés par la bibliothèque marked
        renderer: {
            // heading : affiche un titre
            // Reçoit : le titre analysé. Renvoie : son HTML. Pourquoi : lui donner un identifiant et le retenir pour le sommaire.
            heading({ tokens, depth }) {
                const strInner = this.parser.parseInline(tokens);
                const strText = fPlainText(strInner);
                let strId = fSlug(strText);
                // Deux titres identiques reçoivent des identifiants distincts, comme sur GitHub
                const intSeen = objSlugCounts.get(strId) || 0;
                objSlugCounts.set(strId, intSeen + 1);
                if (intSeen > 0) {
                    strId = `${strId}-${intSeen}`;
                }
                let strClass = '';
                if (depth === 2) {
                    strClass = ' class="section"';
                    tbSections.push({ strId, strInner });
                }
                return `<h${depth} id="${strId}"${strClass}>${strInner}</h${depth}>\n`;
            },
            // paragraph : affiche un paragraphe
            // Reçoit : le paragraphe analysé. Renvoie : son HTML. Pourquoi : une image seule devient une figure avec légende.
            paragraph({ tokens }) {
                if (tokens.length === 1 && tokens[0].type === 'image') {
                    const objImage = tokens[0];
                    const strFile = path.resolve(strDocsFolder, decodeURIComponent(objImage.href));
                    if (!fs.existsSync(strFile)) {
                        throw new Error(`Image absente dans ${objDocument.strName}.md : ${objImage.href}`);
                    }
                    const strCaption = fEscapeHtml(objImage.text);
                    return `<figure><img src="${pathToFileURL(strFile).href}" alt="${strCaption}"><figcaption>${strCaption}</figcaption></figure>\n`;
                }
                return `<p>${this.parser.parseInline(tokens)}</p>\n`;
            },
            // link : affiche un lien
            // Reçoit : le lien analysé. Renvoie : son HTML. Pourquoi : un lien vers un autre document doit viser son PDF.
            link({ href, tokens }) {
                const strInner = this.parser.parseInline(tokens);
                let strTarget = href;
                if (href.startsWith('#')) {
                    strTarget = '#' + decodeURIComponent(href.slice(1));
                } else if (!/^[a-z]+:/i.test(href)) {
                    const [strFile] = href.split('#');
                    const objLinked = tbDocuments.find((objItem) => `${objItem.strName}.md` === strFile);
                    // Chemin vu depuis docs/pdf/ : le PDF voisin, sinon le fichier d'origine un dossier plus haut
                    let strRelative = '../' + href;
                    if (objLinked) {
                        strRelative = `${objLinked.strName}.pdf`;
                    }
                    strTarget = STR_RELATIVE_BASE + 'docs/pdf/' + strRelative;
                }
                return `<a href="${strTarget}">${strInner}</a>`;
            },
        },
    });
    const strBody = objMarked.parse(strMarkdown);

    // Page 2 : texte d'introduction, puis sommaire construit à partir des titres de section
    const intFirstSection = strBody.indexOf('<h2');
    const strList = tbSections.map(({ strId, strInner }) => `<li><a href="#${strId}">${strInner}</a></li>`).join('');
    const strContentsPage = `<div class="toc-page">${strBody.slice(0, intFirstSection)}<h2 class="toc-title" id="sommaire">Sommaire</h2><ul class="toc">${strList}</ul></div>`;
    const strCoverPage = `<div class="cover"><div class="brand">SERA</div><div class="rule"></div><div class="title">${objDocument.strTitle}</div><div class="meta">Version : ${fEscapeHtml(strVersion)}<br>Date : ${fEscapeHtml(strDate)}</div></div>`;

    return `<!doctype html><html lang="fr-BE"><head><meta charset="utf-8"><title>SERA — ${objDocument.strTitle}</title><style>${fStyles(objDocument, strVersion)}</style></head><body>
${strCoverPage}
${strContentsPage}${strBody.slice(intFirstSection)}</body></html>`;
};
