//Dipendenze
const express = require('express');
const multer = require('multer');
const puppeteer = require("puppeteer");
const fs = require('fs')
const app = express();
const hostname = '10.10.1.207';
const PORT = 3001;
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);
const nodemailer = require("nodemailer");
const https = require("https");
const Connection = require('tedious').Connection;
var server_config = {
    server: 'srv-business',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', //update me
        }
    },
    options: {
        encrypt: false,
        trustedConnection: true,
        trustServerCertificate: true,
        rowCollectionOnRequestCompletion: true

    }
};

// Variabili
var TYPES = require('tedious').TYPES;
var serverUtils = require("./serverUtils.js");
const { request } = require('http');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/images')
    },
    filename: function (req, file, cb) {

        cb(null, req.body.codiceNCF + Date.now().toString() + '.jpg')
    }
});
const upload = multer({ storage: storage });
//Setup
app.use(express.static('public'));
app.use('/images', express.static('uploads/images'));

app.listen(PORT, hostname, () => {
    console.log("[" + serverUtils.getData() + "] " + "SERVER RUNNING");

});

//Gestione submit form NCF
app.post('/uploadmultiple', upload.any(), (req, res, next) => {

    var report = {
        codiceNCF: req.body.codiceNCF,
        codiceBarre: serverUtils.creaProgressivo().substr(-4),
        fornitore: req.body.fornitore,
        data: serverUtils.getData(),
        progressivo: serverUtils.creaProgressivo(),
        descrizione: req.body.descrizioneReport,
        quantità: req.body.quantitàNonConformità,
        dimLotto: req.body.quantitàLottoAnalisi,
        tipoControllo: req.body.radioAnalisiEffettuata,
        rilevazione: req.body.radioRilevatoIn,
        classeDifetto: req.body.radioClassificazioneDifetto,
        dettaglio: req.body.dettaglioDifettoPerFornitore,
        operatoreDettaglio: req.body.nomeOperatore,
        commessa: req.body.commessa,
        scarto: req.body.radioScarto,
        requirePdf: (req.body.radioScarto == "No") ? "0" : "1",
        foto: []
    };

    //Salvataggio path dei files caricati all'interno dell'array report.foto
    req.files.forEach(element => report.foto.push(element.path));

    var htmlTemplateName = serverUtils.setHtmlTemplateName(report.codiceNCF);
    var pdfName = serverUtils.setPdfName(report.codiceNCF);

    /**await*/ insertDB(report);

    //Invio Mail di Notifica
    if (req.body.radioMailNotifica == "Sì") {
        var urlInvioMail = new URL('http://10.10.1.207:3001/invioMail?codiceNCF=1&tipoMail=1');
        urlInvioMail.searchParams.set('codiceNCF', req.body.codiceNCF);
        https.get(urlInvioMail, (resp) => {
            ;
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    //Generazione PDF
    if (report.requirePdf == "1") {
        var pdfHTMLtemplate = serverUtils.getHtml(report);

        (async () => {
            await appendFile(htmlTemplateName, pdfHTMLtemplate);
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
            await page.goto('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/' + htmlTemplateName, { waitUntil: "networkidle2" });
            await page.pdf({
                path: pdfName,
                pageRanges: "1",
                format: "A4",
                printBackground: true
            });
            await browser.close;
            var data = await fs.readFileSync(pdfName);
            res.contentType("application/pdf");

            res.status(200).send(data);
        })();
    } else {

        res.status(200).redirect("/confirmation.html")
    }
})

app.route('/fotoNCF').get(function (req, res) {
    console.log(req.query.numeroNCF);
})

// Popolazione della Dashboard Superuser
app.get('/dashboardData', function (req, res) {
    //Chiamata SQL e inserimento in una variabile di tutti i report
    /***************************MOCK******************************/

    /***************************MOCK******************************/
    //Inserimento dei risultati in un array
    //Creazione di un JSON
    //Response col JSON
    var response = [];
    response.push(new NCFDashboard("12332", "Azienda Tes 2", "12239", "1", "12/12/2012"));
    response.push(new NCFDashboard("19203", "Fornitore S.P.A.", "02139", "3", "17/02/2022"));
    res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
});

app.get('/elencoFornitori', function (req, res) {
    console.log("Richiesta fornitori per codice articolo: " + req.query.codiceFornitori);
    var connection = new Connection(server_config);
    var response = [];
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to database...");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString;
        if (req.query.codiceFornitori != ""){
            queryString = `SELECT DISTINCT mo_codart as codart, concat(ar_descr,' ',ar_desint) as descr, td_conto as conto, an_descr1 as fornitore, tb_desmarc as marca, M1.ap_esist as giacenzeMAG1, M4.ap_esist as impegniWIP, ar_ubicaz as ubicazione, '12/05/92' as primoOPdaevadere FROM SEDAR.DBO.movord LEFT JOIN SEDAR.DBO.testord on td_tipork=mo_tipork and td_anno=mo_anno and td_numord=mo_numord and td_serie=mo_serie LEFT JOIN SEDAR.DBO.artico on mo_codart=ar_codart LEFT JOIN SEDAR.DBO.anagra on an_conto=td_conto LEFT JOIN SEDAR.DBO.tabmarc on tb_codmarc=ar_codmarc LEFT JOIN SEDAR.DBO.artpro as M1 on ar_codart=M1.ap_codart and M1.ap_magaz='1' LEFT JOIN SEDAR.DBO.artpro as M4 on ar_codart=M4.ap_codart and M4.ap_magaz='4' WHERE (td_tipork='O' or td_tipork='H') and TD_ANNO>2017 and an_descr1<>'Fornitore TRANSITORIO' and an_descr1<>'Nostro Magazzino' and mo_codart='${req.query.codiceFornitori}' order by mo_codart`
        }else{
            queryString = `SELECT DISTINCT mo_codart as codart, concat(ar_descr,' ',ar_desint) as descr, td_conto as conto, an_descr1 as fornitore, tb_desmarc as marca, M1.ap_esist as giacenzeMAG1, M4.ap_esist as impegniWIP, ar_ubicaz as ubicazione, '12/05/92' as primoOPdaevadere FROM SEDAR.DBO.movord LEFT JOIN SEDAR.DBO.testord on td_tipork=mo_tipork and td_anno=mo_anno and td_numord=mo_numord and td_serie=mo_serie LEFT JOIN SEDAR.DBO.artico on mo_codart=ar_codart LEFT JOIN SEDAR.DBO.anagra on an_conto=td_conto LEFT JOIN SEDAR.DBO.tabmarc on tb_codmarc=ar_codmarc LEFT JOIN SEDAR.DBO.artpro as M1 on ar_codart=M1.ap_codart and M1.ap_magaz='1' LEFT JOIN SEDAR.DBO.artpro as M4 on ar_codart=M4.ap_codart and M4.ap_magaz='4' WHERE (td_tipork='O' or td_tipork='H') and TD_ANNO>2017 and an_descr1<>'Fornitore TRANSITORIO' and an_descr1<>'Nostro Magazzino' order by mo_codart`
        }
        pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log('Query Executed...');
                jsonArray = []
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(jsonArray);
                connection.close();
            }
        });
        // Emits a 'DoneInProc' event when completed.
        pippo.on('row', (columns) => {
            columns.forEach((column) => {
                if (column.value === null) {
                    response.push('NULL');
                } else {
                    response.push(column.value);

                }
            });
        });


        connection.execSql(pippo);
    }
});

//Invio Mail 
app.get('/invioMail', function (req, res) {
    console.log(req.query.codiceNCF + " " + req.query.tipoMail);

    //Ottengo oggetto NCF
    var NCF = getNCF(req.query.codiceNCF);
    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: 'controllo.qualità@vgcilindri.it',
            pass: 'blabla'
        }
    });
    var htmlNCF = serverUtils.getHtml(NCF);
    switch (req.query.tipoMail) {
        case '1':
            console.log("Invio notifica a stefano.valente@vgcilindri.it per NCF numero: " + NCF.codiceNCF);
            //Mail di notifica per apertura report NCF
            var mailOptions = {
                from: 'controllo.qualità@vgcilindri.it',
                to: 'stefano.valente@vgcilindri.it',
                subject: 'Non conformità numero: ' + NCF.codiceNCF + ' del ' + NCF.data,
                html: htmlNCF
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            break;
        case '2':
            //Query select su server anagrafiche per ottenere indirizzo mail e cc del fornitore
            onsole.log("Ricevuta richiesta invio mail a " + NCF.fornitore);
            var fornitore = [];
            //*********************** */
            var mailOptions = {
                from: 'controllo.qualità@vgcilindri.it',
                to: fornitore.mainAddress,
                cc: fornitore.cc,
                subject: 'Non conformità numero: ' + NCF.codiceNCF + ' del ' + NCF.data,
                html: htmlNCF
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            break;
    }
});


function getNCF(codiceNCF) {
    /***
     * Query SELECT su Database locale NCF
     * Resistuisce un oggetto formattato come:
     * Fornitore:
     * Nr. Ordine:
     * Operatore:
     * Codice NCF: 
     * Descrizione:
     * Blabla:
     */
}

function updateDB(NCF) {
    /**
     * UPDATE QUERY
     */
}

function insertDB(NCF) {
    /**
     * INSERT QUERY
     */
}

function contaRigheDB() {
    /**
     * Return numero di righe
     */
}

/*
//Gestione Post Request della Dashboard
app.post('/previewData', function (req, res) {
    var response = req.NFC + "-TESTPOST";
    res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
});
*/

function NCFDashboard(NCF, fornitore, codiceProdotto, stato, data) {
    this.ncf = NCF;
    this.fornitore = fornitore;
    this.codiceProdotto = codiceProdotto;
    this.stato = stato;
    this.data = data;
}

