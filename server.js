const express = require('express');
const multer = require('multer');
const puppeteer = require("puppeteer");
const fs = require('fs')

const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express();
const hostname = '10.10.1.207';
const PORT = 3000;
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);

var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request

app.use(express.static('public'));


app.post('/uploadmultiple', upload.any(), (req, res, next) => {

    var report = {
        codiceNCF: req.body.codiceNCF,
        codiceBarre: 'Prova123',
        fornitore: req.body.fornitore,
        data: 'xx/yy/zzzz',
        progressivo: 'NCF-21XXXX',
        descrizione: 'TestDescrizione',
        quantità: req.body.quantitàNonConformità,
        dimLotto: req.body.quantitàLottoAnalisi,
        tipoControllo: req.body.radioAnalisiEffettuata,
        rilevazione: req.body.radioRilevatoIn,
        classeDifetto: req.body.radioClassificazioneDifetto,
        dettaglio: req.body.dettaglioDifettoPerFornitore,
        operatoreDettaglio: req.body.nomeOperatore,
        commessa: 'testCommessa'
    };

    var pdfHTMLtemplate = getHTML(report);

    (async () => {
        await appendFile('test.html', pdfHTMLtemplate);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
        await page.goto('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/test.html', { waitUntil: "networkidle2" });
        await page.pdf({
            path: "finalPDF.pdf",
            pageRanges: "1",
            format: "A4",
            printBackground: true
        });
        await browser.close;
        var data = await fs.readFileSync('finalPDF.pdf');
        res.contentType("application/pdf");
        res.status(200).send(data);
    })();
})

app.listen(PORT, hostname, () => {
    console.log("---SERVER RUNNING---");
});

function getHTML(report) {
    var markup = `
    <!Doctype HTML>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <title>fixed layout</title>
        <link rel="stylesheet" type="text/css" href="C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/public/pdf/pdfStyle.css">
    </head>
    
    <body>
    
        <div id="container">
            <div id="feedback">
                <div id="logoSection">
                    <img src="http://www.vgcilindri.it/wp-content/uploads/logo-270x104.png" style='height: 100%; width: 100%; object-fit: contain'>
                </div>
                <div id="codiceNCFSection">
                    <p style="font-size:xx-large;"></p>
                    <label>${report.codiceNCF}</label>
                </div>
                <div id="codiceABarreSection">
                    <p style="font-size:xx-large;"></p>
                    <label style="font-size: 45px;" id="labelCodiceABarre">${report.codiceBarre}</label>
                </div>
                <div id="fornitoreSection">
                    <label style="font-size:12px;">FORNITORE</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:20px;" id="labelNomeFornitore">${report.fornitore}</label>
                </div>
                <div id="dataSection">
                    <label style="font-size:12px;">DATA</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:20px;">${report.data}</label>
                </div>
                <div id="progressiveNumberSection">
                    <label style="font-size:12px;">CODICE</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:20px;">${report.progressivo}</label>
                </div>
                <div id="descrizioneSection">
                    <label style="font-size:12px;">DESCRIZIONE</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:18px;">${report.descrizione}</label>
                </div>
                <div id="quantitaNCFSection">
                    <label style="font-size:12px;">QUANTITÀ NCF</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:25px;">${report.quantità}</label>
                </div>
                <div id="lottoAnalisiSection">
                    <label style="font-size:12px;">LOTTO ANALISI</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:25px;">${report.dimLotto}</label>
                </div>
                <div id="controlloSection">
                    <label style="font-size:12px;">CONTROLLO</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:18px;">${report.tipoControllo}</label>
                </div>
                <div id="controlloSection">
                    <label style="font-size:12px;">RILEVATO IN</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:18px;">${report.rilevazione}</label>
                </div>
                <div id="classeDifettoSection">
                    <label style="font-size:12px;">CLASSE DIFETTO</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:18px;">${report.classeDifetto}</label>
                </div>
                <div id="dettaglioSection">
                    <label style="font-size:12px;">DESCRIZIONE</label>
                    <p style="font-size: 1px;"></p>
                    <label style="font-size:18px;">${report.dettaglio}</label>
                </div>
                <div id="operatoreDettaglio">
                    <label style="font-size:12px;">OPERATORE</label>
                    <p style="font-size: 3px;"></p>
                    <label style="font-size:22px;">${report.operatoreDettaglio}</label>
                </div>
                <div id="commessaSection">
                    <div id="containerCommessaModificata">
                        <div id="titleCommessaModificataSection">
                            <label style="font-size:12px;">MODIFICATA COMMESSA</label>
                        </div>
                        <div id="numeroCommessaModificata">
                            <label style="font-size:22px;">${report.commessa}</label>
                        </div>
                        <div id="quadratoCheck">
    
                        </div>
                    </div>
    
                    <div id="containerMessaInScarto">
                        <div id="titleMessaInScarto">
                            <label style="font-size:12px;">EFFETTUATA MESSA IN SCARTO</label>
                        </div>
    
                        <div id="quadratoCheck">
    
                        </div>
                    </div>
    
                    <div id="containerOperatore">
                        <label style="font-size:12px;">OPERATORE</label>
                    </div>
                </div>
            </div>
    
    
        </div>
    
    
    </body>
    
    </html>
    `;

    return markup;
}
