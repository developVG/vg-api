//Dipendenze
const express = require('express');
const multer = require('multer');
const puppeteer = require("puppeteer");
const fs = require('fs')
const app = express();
var ip = require("ip");
const hostname = '10.10.1.23';
var bodyParser = require("body-parser");
const PORT = 3001;
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);
const nodemailer = require("nodemailer");
const https = require("https");
const http = require("http");
const Connection = require('tedious').Connection;
var server_config_business = {
    server: 'srv-business',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
        }
    },
    options: {
        encrypt: false,
        trustedConnection: true,
        trustServerCertificate: true,
        rowCollectionOnRequestCompletion: true

    }
};
var server_config_file = {
    server: 'SRV-FILE',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
        }
    },
    options: {
        encrypt: false,
        trustedConnection: true,
        trustServerCertificate: true,
        rowCollectionOnRequestCompletion: true,
        instanceName: 'SERVER_FILE',
    }
};

// Variabili
const tableValues = 'codice_ncf, codice_prodotto, nome_fornitore, conto_fornitore, data, descrizione, quantità, dimensione_lotto, tipologia_controllo, rilevazione, classe_difetto, dettaglio, nome_operatore, commessa, scarto, foto, stato, azione_comunicata, costi_sostenuti, addebito_costi, chiusura_ncf, costi_riconosciuti, merce_in_scarto, note_interne, valore_pezzo';
var TYPES = require('tedious').TYPES;
var path = require('path');
var serverUtils = require("./serverUtils.js");
const { request } = require('http');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/uploads/images')
    },
    filename: function(req, file, cb) {

        cb(null, req.body.codiceNCF + Date.now().toString() + '.png')
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 9999999999 }
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Setup
app.use(express.static('public'));
app.use('/images', express.static('uploads/images'));
app.use('/pdfNCF', express.static('pdfStorage'));
app.use('/disegni', express.static('J://Images'));

app.listen(PORT, hostname, () => {
    console.log("[" + serverUtils.getData() + "] " + "SERVER API STARTED");
});

app.use(bodyParser.json({ limit: '3000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: 'mb' }));

/**
 * Submit del form NCF
 */
app.post('/uploadmultiple', upload.any(), (req, res, next) => {
    creaCodiceNCF(function(error, response) {
        console.log("[" + serverUtils.getData() + "] " + "SERVER API: CREATA NCF " + response);
        var report = {
            codiceNCF: response,
            codiceBarre: response.substr(4),
            codiceProdotto: req.body.codiceProdotto,
            fornitore: req.body.fornitore,
            contoFornitore: req.body.fornitorecontoname,
            data: serverUtils.getData(),
            descrizione: req.body.descrizioneReport,
            quantità: req.body.quantitàNonConformità,
            dimLotto: req.body.quantitàLottoAnalisi,
            tipoControllo: req.body.radioAnalisiEffettuata,
            rilevazione: req.body.radioRilevatoIn,
            classeDifetto: req.body.radioClassificazioneDifetto,
            dettaglio: req.body.dettaglioDifettoPerFornitore,
            operatoreDettaglio: req.body.nomeOperatore,
            emailOperatore: req.body.emailOperatore,
            commessa: req.body.commessa,
            scarto: parseInt(req.body.radioScarto),
            requirePdf: (req.body.radioScarto == "0") ? "0" : "1",
            foto: [],
            stato: 1,
            valorePezzo: req.body.valorepezzo,
            noteInterne: ''
        };
        req.files.forEach(element => report.foto.push(element.path));
        //var htmlTemplateName = path.join(__dirname, 'htmlTemplateStorage', response.substr(4) + ".html");
        //var pdfName = path.join(__dirname, 'pdfStorage', response.substr(4) + ".pdf");
        insertDB(report, function(error, testresp) {
            //Mail notifica + mail di conferma ad operatore -> Doppio destinatario
            if (req.body.radioMailNotifica == 'Sì' && report.requirePdf == '1') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=3&mailOperatore=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                urlInvioMail.searchParams.set('mailOperatore', report.emailOperatore);
                http.get(urlInvioMail, (resp) => {;
                }).on("error", (err) => {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA CONNESSIONE A 10.10.1.23:3001/invioMail, LOG: " + err.message);
                });
                res.status(200).redirect("/confirmation.html");
            }
            //Solo mail di conferma ad operatore
            if (req.body.radioMailNotifica == 'No' && report.requirePdf == '1') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=4&mailOperatore=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                urlInvioMail.searchParams.set('mailOperatore', report.emailOperatore);
                http.get(urlInvioMail, (resp) => {;
                }).on("error", (err) => {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA CONNESSIONE A 10.10.1.23:3001/invioMail, LOG: " + err.message);
                });
                res.status(200).redirect("/confirmation.html");
            }
            //Solo mail di notifica
            if (req.body.radioMailNotifica == 'Sì' && report.requirePdf == '0') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                http.get(urlInvioMail, (resp) => {;
                }).on("error", (err) => {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA CONNESSIONE A 10.10.1.23:3001/invioMail, LOG: " + err.message);
                });
                res.status(200).redirect("/confirmation.html");
            }
            //Nessuna Mail
            if (req.body.radioMailNotifica == 'No' && report.requirePdf == '0') {
                res.status(200).redirect("/confirmation.html");
            }
        });
        //Generazione PDF
        /*
        if (report.requirePdf == "1") {
            var pdfHTMLtemplate = serverUtils.getHtml(report);

            (async () => {
                await appendFile(htmlTemplateName, pdfHTMLtemplate);
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
                await page.goto(path.join(htmlTemplateName), { waitUntil: "networkidle2" });
                await page.pdf({
                    path: pdfName,
                    pageRanges: "1",
                    format: "A4",
                    printBackground: true
                });
                await browser.close;
                var data = await fs.readFileSync(pdfName);
                res.contentType("application/pdf");
     /insertDB(report);
                if (req.body.radioMailNotifica == "Sì") {
                    var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=1');
                    urlInvioMail.searchParams.set('codiceNCF', response);
                    http.get(urlInvioMail, (resp) => {
                        ;
                    }).on("error", (err) => {
                        console.log("Errore invio mail: " + err.message);
                    });
                }
                res.status(200).send(data);
            })();
        } else {
              insertDB(report);
            if (req.body.radioMailNotifica == "Sì") {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                http.get(urlInvioMail, (resp) => {
                    ;
                }).on("error", (err) => {
                    console.log("Errore invio mail: " + err.message);
                });
            }
            res.status(200).redirect("/confirmation.html")
        }
        */
    });
})

/**
 * Update dati dalla Dashboard Superuser
 */

app.post('/updateFromDashboard', upload.any(), (req, res, next) => {
    var updatedNCF = {
        codiceNCF: 'NCF-' + req.body.codiceNCF,
        codiceProdotto: req.body.codiceProdotto,
        nomeFornitore: req.body.nomeFornitore,
        contoFornitore: '',
        data: req.body.data + ' 00:00:00.000',
        descrizione: req.body.descrizione,
        quantità: req.body.quantità,
        dimensioneLotto: req.body.lotto,
        tipologiaControllo: req.body.tipologiaControllo,
        rilevazione: req.body.rilevazione,
        classificazione: req.body.classificazione,
        dettaglio: req.body.dettaglio,
        nomeOperatore: '',
        commessa: req.body.commessa,
        scarto: '',
        foto: [],
        stato: req.body.stato,
        azioneComunicata: req.body.azioneComunicata,
        costiSostenuti: req.body.costiSostenuti,
        addebitoCosti: checkNullString(req.body.addebitoCosti),
        chiusuraNCF: req.body.chiusuraNCF,
        costiRiconosciuti: req.body.costiRiconosciuti,
        merceInScarto: checkNullString(req.body.merceInScarto),
        noteInterne: req.body.noteInterne,
        valorePezzo: req.body.valorePezzo
    }
    req.files.forEach(element => updatedNCF.foto.push(element.path));
    updateDB(updatedNCF);
    res.header("Access-Control-Allow-Origin", "*").status(200).send("Ok");
});


/**
 * Update dati da Dashboard Utente
 */
app.post('/updateFromDashboardUtente', upload.any(), (req, res, next) => {
    var updatedNCF = {
        codiceNCF: 'NCF-' + req.body.codiceNCF,
        codiceProdotto: req.body.codiceProdotto,
        nomeFornitore: req.body.nomeFornitore,
        contoFornitore: '',
        data: req.body.data + ' 00:00:00.000',
        descrizione: req.body.descrizione,
        quantità: req.body.quantità,
        dimensioneLotto: req.body.lotto,
        tipologiaControllo: req.body.tipologiaControllo,
        rilevazione: req.body.rilevazione,
        classificazione: req.body.classificazione,
        dettaglio: req.body.dettaglio,
        nomeOperatore: '',
        commessa: req.body.commessa,
        scarto: '',
        foto: [],
        stato: req.body.stato,
        noteInterne: req.body.noteInterne,
        valorePezzo: req.body.valorePezzo
    }
    req.files.forEach(element => updatedNCF.foto.push(element.path));
    updateDButente(updatedNCF);
    res.header("Access-Control-Allow-Origin", "*").status(200).send("Ok");
});

/**
 * 
 * Controlla se una stirnga è nulla o meno, utilizzata in updateFromDashboard
 */
function checkNullString(string) {
    if (string == 'null' || string == 'NULL')
        return 'NULL';
    else {
        return string;
    }
}

/**
 * ?
 */
app.route('/fotoNCF').get(function(req, res) {
    console.log(req.query.numeroNCF);
})

/**
 * Popolazione della Dashboard Superuser e Utente
 */
app.get('/dashboardData', function(req, res) {
    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function(err) {
        if (err) {
            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA CONNESSIONE A SERVER_FILE PER ACQUISIZIONE DATI DASHBOARD, LOG: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    var queryString = "SELECT codice_ncf, nome_fornitore, codice_prodotto, stato, data FROM NCF.dbo.ncfdata ORDER BY codice_ncf DESC";

    function executeStatement() {
        pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY SU SERVER_FILE, LOG: " + err.message);
            } else {
                jsonArray = [];
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                jsonArray.forEach(element => {
                    response.push(new NCFDashboard(element.codice_ncf, element.nome_fornitore, element.codice_prodotto, element.stato, element.data));
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
});

/**
 * Esposizione pagina di conferma post invio di un submit
 */
app.get('/confirmation.html', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*").status(200).sendFile(path.join(__dirname, '\\public\\confirmationPage.html'));
});

/**
 * Esposizione pagina di conferma post invio di un submit
 */
app.get('/confirmationcss', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*").status(200).sendFile(path.join(__dirname, '\\public\\css\\confirmationPage.css'));
});

/**
 * Elenco fornitori per form NCF
 */
app.get('/elencoFornitori', function(req, res) {
    var connection = new Connection(server_config_business);
    var response = [];
    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString;
        if (req.query.codiceFornitori != "") {
            queryString = `SELECT DISTINCT mo_codart as codart, concat(ar_descr,' ',ar_desint) as descr, td_conto as conto, an_descr1 as fornitore, tb_desmarc as marca, M1.ap_esist as giacenzeMAG1, M4.ap_esist as impegniWIP, ar_ubicaz as ubicazione, '12/05/92' as primoOPdaevadere FROM SEDAR.DBO.movord LEFT JOIN SEDAR.DBO.testord on td_tipork=mo_tipork and td_anno=mo_anno and td_numord=mo_numord and td_serie=mo_serie LEFT JOIN SEDAR.DBO.artico on mo_codart=ar_codart LEFT JOIN SEDAR.DBO.anagra on an_conto=td_conto LEFT JOIN SEDAR.DBO.tabmarc on tb_codmarc=ar_codmarc LEFT JOIN SEDAR.DBO.artpro as M1 on ar_codart=M1.ap_codart and M1.ap_magaz='1' LEFT JOIN SEDAR.DBO.artpro as M4 on ar_codart=M4.ap_codart and M4.ap_magaz='4' WHERE (td_tipork='O' or td_tipork='H') and TD_ANNO>2017 and an_descr1<>'Fornitore TRANSITORIO' and an_descr1<>'Nostro Magazzino' and mo_codart='${req.query.codiceFornitori}' order by mo_codart`
        } else {
            queryString = `SELECT DISTINCT mo_codart as codart, concat(ar_descr,' ',ar_desint) as descr, td_conto as conto, an_descr1 as fornitore, tb_desmarc as marca, M1.ap_esist as giacenzeMAG1, M4.ap_esist as impegniWIP, ar_ubicaz as ubicazione, '12/05/92' as primoOPdaevadere FROM SEDAR.DBO.movord LEFT JOIN SEDAR.DBO.testord on td_tipork=mo_tipork and td_anno=mo_anno and td_numord=mo_numord and td_serie=mo_serie LEFT JOIN SEDAR.DBO.artico on mo_codart=ar_codart LEFT JOIN SEDAR.DBO.anagra on an_conto=td_conto LEFT JOIN SEDAR.DBO.tabmarc on tb_codmarc=ar_codmarc LEFT JOIN SEDAR.DBO.artpro as M1 on ar_codart=M1.ap_codart and M1.ap_magaz='1' LEFT JOIN SEDAR.DBO.artpro as M4 on ar_codart=M4.ap_codart and M4.ap_magaz='4' WHERE (td_tipork='O' or td_tipork='H') and TD_ANNO>2017 and an_descr1<>'Fornitore TRANSITORIO' and an_descr1<>'Nostro Magazzino' order by mo_codart`
        }
        pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE ELENCO FORNITORI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(jsonArray);
                connection.close();
            }
        });
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

/**
 * Elenco Operatori per form NCF
 */
app.get('/elencoOperatori', function(req, res) {
    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = "SELECT * FROM ANAGRAFICHE.dbo.mailinglist"
        pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE ELENCO OPERATORI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(jsonArray);
                connection.close();
            }
        });
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

/**
 * Ricerca di una non conformità dato il codice (N.B. la query deve contenere il prefisso 'NCF-')
 */
app.get('/ncf', function(req, res) {
    var numeroNCF = req.query.codiceNCF;
    var queryString = "SELECT * FROM NCF.dbo.ncfdata WHERE codice_ncf='" + numeroNCF + "'";

    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE DI UNA NCF, LOG: " + err.message);
            } else {
                jsonArray = [];
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(jsonArray);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
});

/**
 * Invio Mail
 * 1) Notifica a stefanovalente@vgcilindri.it
 * 2) Report a fornitore (se mail non presente, invio a stefanovalente@vgcilindri.it)
 * 3) Notifica alla mail collegata all'utente che ha creato il submit + al responsabile qualità (stefanovalente@vgcilindri.it)
 * 4) Notifica alla mail collegata all'utente che ha creato il submit
 */
app.get('/invioMail', function(req, res) {
    var NCF = getNCF(req.query.codiceNCF, function(error, response) {

        var transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            secureConnection: false,
            port: 587,
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: 'quality@vgcilindri.it',
                pass: 'Lof02291'
            }
        });
        var attachmentsArray = [];
        var tempObj = {};
        var myJson = JSON.stringify(response[0].data).replace(/[a-z]/gi, ' ').replace(/"/g, '');
        var dataFormattata = serverUtils.fixDate(myJson);
        if (response[0].foto != '') {
            var thePath = response[0].foto;
            thePath.split(/[,.]/).forEach(item => {
                if (item != 'png' && item != 'png,' && item != ',png') {
                    tempObj['path'] = item + '.png';
                    tempObj['encoding'] = 'base64';
                    attachmentsArray.push(tempObj);
                    tempObj = {};
                }
            });
        }
        switch (req.query.tipoMail) {
            case '1':
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: INVIO MAIL NOTIFICA A stefanovalente@vgcilindri.it PER NCF " + response[0].codice_ncf);
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: 'stefano.valente@vgcilindri.it',
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + dataFormattata,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'INVIO MAIL DI NOTIFICA A stefanovalente@vgcilindri.it, LOG: " + error.message);
                    }
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: MAIL DI NOTIFICA A stefanovalente@vgcilindri.it INVIATA");
                });
                break;
            case '2':
                var mailingListTo = [];
                var mailingListCc = [];
                getMailAnagrafiche(req.query.contoFornitore, function(erTipo2, respTipo2) {
                    if (respTipo2[0]) {
                        if (respTipo2[0].a1 != ' ' && respTipo2[0].a1 != '') {
                            mailingListTo.push(respTipo2[0].a1);
                        }
                        if (respTipo2[0].a2 != ' ' && respTipo2[0].a2 != '') {
                            mailingListTo.push(respTipo2[0].a2);
                        }
                        if (respTipo2[0].a3 != ' ' && respTipo2[0].a3 != '') {
                            mailingListTo.push(respTipo2[0].a3);
                        }
                        if (respTipo2[0].a4 != ' ' && respTipo2[0].a4 != '') {
                            mailingListTo.push(respTipo2[0].a4);
                        }
                        if (respTipo2[0].a5 != ' ' && respTipo2[0].a5 != '') {
                            mailingListTo.push(respTipo2[0].a5);
                        }

                        if (respTipo2[0].cc1 != ' ' && respTipo2[0].cc1 != '') {
                            mailingListCc.push(respTipo2[0].cc1);
                        }
                        if (respTipo2[0].cc2 != ' ' && respTipo2[0].cc2 != '') {
                            mailingListCc.push(respTipo2[0].cc2);
                        }
                        if (respTipo2[0].cc3 != ' ' && respTipo2[0].cc3 != '') {
                            mailingListCc.push(respTipo2[0].c3);
                        }
                        if (respTipo2[0].cc4 != ' ' && respTipo2[0].cc4 != '') {
                            mailingListCc.push(respTipo2[0].cc4);
                        }
                        if (respTipo2[0].cc5 != ' ' && respTipo2[0].cc5 != '') {
                            mailingListCc.push(respTipo2[0].cc5);
                        }
                    }
                    if (mailingListTo.length == 0) {
                        mailingListTo.push('stefano.valente@vgcilindri.it');
                    }
                    if (mailingListCc.length == 0) {
                        mailingListCc.push('lorenzo.galassi@vgcilindri.it');
                    }
                    var mailOptions = {
                        from: 'quality@vgcilindri.it',
                        to: mailingListTo,
                        cc: mailingListCc,
                        subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + dataFormattata,
                        html: serverUtils.getMailFornitoreHtml(response[0], myJson),
                        attachments: attachmentsArray,

                    };
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'INVIO MAIL DI NOTIFICA A " + mailingListTo + ", LOG: " + error.message);
                        }
                        console.log("[" + serverUtils.getData() + "] " + "SERVER API: MAIL DI NOTIFICA A " + mailingListTo + " INVIATA");
                    });
                });
                break;
            case '3':
                var mailingList = [
                    'stefano.valente@vgcilindri.it',
                    req.query.mailOperatore,
                ];
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: mailingList,
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + dataFormattata,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,

                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'INVIO MAIL DI NOTIFICA A stefanovalente@vgcilindri.it e " + req.query.mailOperatore + " LOG: " + error.message);
                    }
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: MAIL DI NOTIFICA A " + req.query.mailOperatore + " E A steafanovalente@vgcilindri.it INVIATA");
                });
                break;
            case '4':
                var mailingList = [
                    req.query.mailOperatore,
                ];
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: mailingList,
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf.substr(-4) + ' del ' + dataFormattata,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,

                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'INVIO MAIL DI NOTIFICA A " + req.query.mailOperatore + " LOG: " + error.message);
                    }
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: MAIL DI NOTIFICA A " + req.query.mailOperatore + " INVIATA");
                });
                break;
        }
    });
});

/**
 * Funzione di update usata quando dalla dashboard superuser
 * viene inviata la mail di report al fornitore, in automatico la NCF
 * relativa viene flaggata come "inviata" (stato 2)
 */
app.get('/updateStatus', function(req, res) {
    var connection = new Connection(server_config_file);
    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;

    function executeStatement() {
        var queryString = `UPDATE NCF.dbo.ncfdata SET stato= ${req.query.status} WHERE codice_ncf='${req.query.codiceNCF}';`
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: STATO DELLA NCF " + req.query.codiceNCF + " SETTATO SU 'INVIATA'");
                res.header("Access-Control-Allow-Origin", "*").status(200).send('0');
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
})

/**
 * Acquisizione mailing list fornitore
 */
app.get('/mailFornitore', function(req, res) {

    var wait = getNCF('NCF-' + req.query.contoFornitore, function(reqz, resz) {
        getMailAnagrafiche(resz[0].conto_fornitore, function(request, response) {
            res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
        });
    });
});

function getMailAnagrafiche(contoFornitore, callback) {
    var connection = new Connection(server_config_business);
    var response = {};
    var realConto = parseInt(contoFornitore);
    connection.on('connect', function(err) {
        if (err) {
            console.error("getMailAnagrafiche() error: " + err.message);
        } else {

            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = `SELECT ax_descr1 as a1, ax_descr2 as a2, ax_descr3 as a3, ax_descr4 as a4, ax_descr5 as a5, ax_descr6 as cc1, ax_descr7 as cc2, ax_descr8 as cc3, ax_descr9 as cc4, ax_descr10 as cc5 FROM SEDAR.DBO.anaext WHERE ax_descr1<>'' AND ax_conto = ${realConto}`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DELLE MAIL DA DB ANAGRAFICHE, LOG: " + err.message);
            } else {
                var jsonArray = [];
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;

                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                callback(null, response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
}

/**
 * Acquisizione elenco figli per webapp visualizzatore di disegni (10.10.1.23:3005)
 */
app.get('/elencoFigliVisualizzatoreDisegni', function(req, res) {
    var connection = new Connection(server_config_business);
    var response = {};
    connection.on('connect', function(err) {
        if (err) {
            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DEI CODICI PER IL VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;

    function executeStatement() {
        var queryString = `SELECT DISTINCT
        DB1.md_coddb,
        JJ.figlio,
        AR2.ar_descr,
        AR2.ar_desint,
        AR2.ar_ubicaz,
        --PADRE,
        riga,

        (JAR.ar_gruppo) AS GR,
        (j1.quant) as CONF,
        cast(j2.giac as int) as GIAC1,
        cast(j3.giac as int) as GIAC4,
        cast(j3.imp as int) as IMP4,
        cast(j2.ord as int) as ORD1




    --	DB1.md_codfigli,

    --	DB2.md_codfigli AS cod_figli2,

    --	DB3.md_codfigli AS cod_figli3,

    --	DB4.md_codfigli AS cod_figli4


FROM   SEDAR.dbo.movdis AS DB1
        inner join SEDAR.dbo.artico AS AR1 on DB1.md_coddb=AR1.ar_codart
        LEFT join SEDAR.dbo.artico AS AR2 on DB1.md_codfigli=AR2.ar_codart


        LEFT JOIN (
                SELECT MD.md_codfigli AS FIGLIO,CAST( MD.md_riga AS DECIMAL(12,4)) AS RIGA, MD.md_coddb AS PADRE
                FROM SEDAR.dbo.movdis AS MD
                    ) as JJ ON ((JJ.FIGLIO=DB1.md_codfigli AND JJ.RIGA=DB1.md_riga))
                    --DECOMMENTARE E AGGIUNGERE PARENTESI PER AVERE I FIGLI DI LIVELLO QUASI 999
                                --or (JJ.FIGLIO=DB2.md_codfigli AND JJ.RIGA=DB2.md_riga)
                                --or (JJ.FIGLIO=DB3.md_codfigli AND JJ.RIGA=DB3.md_riga)
                                --or (JJ.FIGLIO=DB4.md_codfigli AND JJ.RIGA=DB4.md_riga))
                                and
                                (JJ.PADRE=DB1.md_codDB)
        
        LEFT JOIN SEDAR.dbo.artico AS JAR on FIGLIO=JAR.ar_codart
        
        LEFT JOIN (
                  SELECT DISTINCT  j0.mo_codart as codice, CASE WHEN(j0.mo_quant)>0 THEN 'CONF' ELSE '-' END as quant FROM SEDAR.dbo.movord AS j0 where j0.mo_confermato='S' and j0.mo_flevas='C' and (j0.mo_tipork='H' OR j0.mo_tipork='Y') 
                                ) as j1 on j1.codice=figlio
                    
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6 AND tabmaga.tb_codmaga=1
                    ) AS j2 ON FIGLIO=j2.cod
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6  AND tabmaga.tb_codmaga=4
                    ) AS j3 ON FIGLIO=j3.cod			


where ((year(DB1.md_dtfival) = '2099' OR year(DB1.md_dtfival) is NULL)) AND DB1.md_coddb = '${req.query.codiceProdotto}'
order by riga	
`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE CODICI PER VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
});


/**
 * Acquisizione codici per autocomplete visualizzatore disegni
 */
app.get('/elencoCodici', function(req, res) {
    var connection = new Connection(server_config_business);
    var response = {};
    connection.on('connect', function(err) {
        if (err) {
            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DEI CODICI PER IL VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;

    function executeStatement() {
        var queryString = `SELECT ar_codart FROM SEDAR.DBO.artico where ar_blocco='N'`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE CODICI PER VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
})

/**
 * Acquisizione elenco figli per webapp visualizzatore di disegni (10.10.1.23:3005)
 */
app.get('/elencoPadriVisualizzatoreDisegni', function(req, res) {
    var connection = new Connection(server_config_business);
    var response = {};
    connection.on('connect', function(err) {
        if (err) {
            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DEI CODICI PER IL VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;

    function executeStatement() {
        var queryString = `SELECT DISTINCT
        DB1.md_coddb,
        JJ.figlio,
        AR2.ar_descr,
        AR2.ar_desint,
        AR2.ar_ubicaz,
        --PADRE,
        riga,

        (JAR.ar_gruppo) AS GR,
        (j1.quant) as CONF,
        cast(j2.giac as int) as GIAC1,
        cast(j3.giac as int) as GIAC4,
        cast(j3.imp as int) as IMP4,
        cast(j2.ord as int) as ORD1




    --	DB1.md_codfigli,

    --	DB2.md_codfigli AS cod_figli2,

    --	DB3.md_codfigli AS cod_figli3,

    --	DB4.md_codfigli AS cod_figli4


FROM   SEDAR.dbo.movdis AS DB1
        inner join SEDAR.dbo.artico AS AR1 on DB1.md_coddb=AR1.ar_codart
        LEFT join SEDAR.dbo.artico AS AR2 on DB1.md_codfigli=AR2.ar_codart


        LEFT JOIN (
                SELECT MD.md_codfigli AS FIGLIO,CAST( MD.md_riga AS DECIMAL(12,4)) AS RIGA, MD.md_coddb AS PADRE
                FROM SEDAR.dbo.movdis AS MD
                    ) as JJ ON ((JJ.FIGLIO=DB1.md_codfigli AND JJ.RIGA=DB1.md_riga))
                    --DECOMMENTARE E AGGIUNGERE PARENTESI PER AVERE I FIGLI DI LIVELLO QUASI 999
                                --or (JJ.FIGLIO=DB2.md_codfigli AND JJ.RIGA=DB2.md_riga)
                                --or (JJ.FIGLIO=DB3.md_codfigli AND JJ.RIGA=DB3.md_riga)
                                --or (JJ.FIGLIO=DB4.md_codfigli AND JJ.RIGA=DB4.md_riga))
                                and
                                (JJ.PADRE=DB1.md_codDB)
        
        LEFT JOIN SEDAR.dbo.artico AS JAR on FIGLIO=JAR.ar_codart
        
        LEFT JOIN (
                  SELECT DISTINCT  j0.mo_codart as codice, CASE WHEN(j0.mo_quant)>0 THEN 'CONF' ELSE '-' END as quant FROM SEDAR.dbo.movord AS j0 where j0.mo_confermato='S' and j0.mo_flevas='C' and (j0.mo_tipork='H' OR j0.mo_tipork='Y') 
                                ) as j1 on j1.codice=figlio
                    
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6 AND tabmaga.tb_codmaga=1
                    ) AS j2 ON FIGLIO=j2.cod
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6  AND tabmaga.tb_codmaga=4
                    ) AS j3 ON FIGLIO=j3.cod			


where ((year(DB1.md_dtfival) = '2099' OR year(DB1.md_dtfival) is NULL)) AND JJ.figlio = '${req.query.codiceProdotto}'
order by md_coddb
`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE CODICI PER VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
});

/**
 * Acquisizione codici prodotti per webapp visualizzatore di disegni (10.10.1.23:3005)
 */
app.get('/elencoCodiciVisualizzatoreDisegno', function(req, res) {
    var connection = new Connection(server_config_business);
    var response = {};
    connection.on('connect', function(err) {
        if (err) {
            console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DEI CODICI PER IL VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;

    function executeStatement() {
        var queryString = `SELECT DISTINCT
        AR1.ar_codart,
        AR1.ar_descr,
        AR1.ar_desint,
        AR1.ar_ubicaz,
        AR1.ar_gif1,

        (JAR.ar_gruppo) AS GR,
        (j2.giac) as GIAC1,
        (j3.giac) as GIAC4,
        (j3.imp) as IMP4,
        (j2.ord) as ORD1,
		AR1.ar_codmarc as codmarc

FROM   SEDAR.dbo.artico AS AR1
        LEFT join SEDAR.dbo.movdis AS DB1	 on DB1.md_coddb=AR1.ar_codart				
        LEFT JOIN SEDAR.dbo.artico AS JAR on DB1.md_coddb=JAR.ar_codart

                    
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6 AND tabmaga.tb_codmaga=1
                    ) AS j2 ON DB1.md_coddb=j2.cod
        LEFT JOIN (
                    SELECT	artpro.ap_codart as cod,
                            artpro.ap_esist as giac,
                            artpro.ap_impeg as imp,
                            artpro.ap_ordin as ord
                    FROM   SEDAR.dbo.artpro artpro 
                        LEFT OUTER JOIN SEDAR.dbo.tabmaga ON (artpro.ap_magaz=tabmaga.tb_codmaga)-- AND (artpro.codditt=tabmaga.codditt)
                        LEFT OUTER JOIN SEDAR.dbo.artico ON (artpro.ap_codart=artico.ar_codart)
                    WHERE  artpro.codditt='SEDAR' and artico.ar_gruppo>0 and artico.ar_gruppo<6  AND tabmaga.tb_codmaga=4
                    ) AS j3 ON DB1.md_coddb=j3.cod			


where  (YEAR(DB1.md_dtfival)='2099' OR YEAR(DB1.md_dtfival) is null ) and AR1.ar_codart = '${req.query.codiceArt}'
--WHERE LEFT(AR1.AR_CODART,3)='das'
order by AR1.ar_codart
`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY PER ACQUISIZIONE CODICI PER VISUALIZZATORE DI DISEGNI, LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
});

/**
 * Funzione che svolge la query per l'acquisizione dati di una NCF dato il codice.
 */
function getNCF(codiceNCF, callback) {

    var connection = new Connection(server_config_file);
    var response = {};
    connection.on('connect', function(err) {
        if (err) {
            console.error("getNcf() error: " + err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = `SELECT ${tableValues} FROM NCF.dbo.ncfdata WHERE codice_ncf='${codiceNCF}'`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'ACQUISIZIONE DATI PER LA NCF" + codiceNCF + ", LOG: " + err.message);
            } else {
                jsonArray = []
                rows.forEach(function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                response = jsonArray;
                callback(null, response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }

}

/**
 * Funzione di update dati dalla dashboard utente
 */
function updateDButente(NCF) {
    var oggetto = getNCF(NCF.codiceNCF, function(error, response) {
        NCF.contoFornitore = response[0].conto_fornitore;
        NCF.nomeOperatore = response[0].nome_operatore;
        NCF.scarto = response[0].scarto;

        Array.isArray(response[0].foto) ? NCF.foto.concat(response[0].foto) : NCF.foto.push(response[0].foto);

        var connection = new Connection(server_config_file);

        connection.on('connect', function(err) {
            if (err) {
                console.error(err.message);
            } else {
                executeStatement();
            }
        });
        connection.connect();
        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;

        function executeStatement() {
            var queryString = `UPDATE NCF.dbo.ncfdata SET codice_prodotto='${NCF.codiceProdotto}', nome_fornitore= '${NCF.nomeFornitore}', conto_fornitore= '${NCF.contoFornitore}', data= '${NCF.data}', descrizione= '${NCF.descrizione}', quantità= ${NCF.quantità}, dimensione_lotto= ${NCF.dimensioneLotto}, tipologia_controllo= '${NCF.tipologiaControllo}', rilevazione= '${NCF.rilevazione}', classe_difetto= '${NCF.classificazione}', dettaglio= '${NCF.dettaglio}', nome_operatore= '${NCF.nomeOperatore}', commessa= '${NCF.commessa}', foto= '${NCF.foto}', stato= ${NCF.stato}, note_interne= '${NCF.noteInterne}', valore_pezzo= ${NCF.valorePezzo} WHERE codice_ncf='${NCF.codiceNCF}';`
            var pippo = new Request(queryString, function(err, rowCount, rows) {
                if (err) {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'UPDATE DELLA NCF " + NCF.codiceNCF + " DA DASHBOARD UTENTE, LOG: " + err.message);
                } else {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: NCF " + NCF.codiceNCF + " AGGIORNATA DA DASHBOARD UTENTE");
                    connection.close();
                }
            });
            connection.execSql(pippo);
        }
    });
}

/**
 * Funzione di update del db. Utilizza getNCF per appendere dati alla stringa già esistente di foto
 * e per integrare il dataset con i valori mancanti (conto fornitore e nome operatore)
 */
function updateDB(NCF) {
    var oggetto = getNCF(NCF.codiceNCF, function(error, response) {
        NCF.contoFornitore = response[0].conto_fornitore;
        NCF.nomeOperatore = response[0].nome_operatore;
        NCF.scarto = response[0].scarto;

        Array.isArray(response[0].foto) ? NCF.foto.concat(response[0].foto) : NCF.foto.push(response[0].foto);

        var connection = new Connection(server_config_file);

        connection.on('connect', function(err) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'UPDATE DB PER NCF " + NCF.codiceNCF + ", LOG: " + err.message);
            } else {
                executeStatement();
            }
        });
        connection.connect();
        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;

        function executeStatement() {
            var queryString = `UPDATE NCF.dbo.ncfdata SET codice_prodotto='${NCF.codiceProdotto}', nome_fornitore= '${NCF.nomeFornitore}', conto_fornitore= '${NCF.contoFornitore}', data= '${NCF.data}', descrizione= '${NCF.descrizione}', quantità= ${NCF.quantità}, dimensione_lotto= ${NCF.dimensioneLotto}, tipologia_controllo= '${NCF.tipologiaControllo}', rilevazione= '${NCF.rilevazione}', classe_difetto= '${NCF.classificazione}', dettaglio= '${NCF.dettaglio}', nome_operatore= '${NCF.nomeOperatore}', commessa= '${NCF.commessa}', scarto= '${NCF.scarto}', foto= '${NCF.foto}', stato= ${NCF.stato}, azione_comunicata= '${NCF.azioneComunicata}', costi_sostenuti= ${NCF.costiSostenuti}, addebito_costi= ${NCF.addebitoCosti}, chiusura_ncf= '${NCF.chiusuraNCF}', costi_riconosciuti= ${NCF.costiSostenuti}, merce_in_scarto= '${NCF.merceInScarto}', note_interne= '${NCF.noteInterne}', valore_pezzo= ${NCF.valorePezzo} WHERE codice_ncf='${NCF.codiceNCF}';`
            var pippo = new Request(queryString, function(err, rowCount, rows) {
                if (err) {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA QUERY UPDATE DELLA NCF " + NCF.codiceNCF + ", LOG: " + err.message);
                } else {
                    console.log("[" + serverUtils.getData() + "] " + "SERVER API: NCF " + NCF.codiceNCF + " AGGIORNATA");
                    connection.close();
                }
            });
            connection.execSql(pippo);
        }
    });

}

/**
 *  Inserimento di una NCF all'interno del db
 */
function insertDB(NCF, callback) {
    var connection = new Connection(server_config_file);

    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        // var queryString = `INSERT INTO NCF.dbo.ncfdata (${tableValues}) VALUES ('${NCF.codiceNCF}', '${NCF.codiceProdotto}', '${NCF.fornitore}', '${NCF.contoFornitore}', '${NCF.data}', '${NCF.descrizione}', '${NCF.quantità}', '${NCF.dimLotto}', '${NCF.tipoControllo}', '${NCF.rilevazione}', '${NCF.classeDifetto}', '${NCF.dettaglio}', '${NCF.operatoreDettaglio}', '${NCF.commessa}', '${NCF.scarto}', '${NCF.foto}', '${NCF.stato}', 'SE - Segnalazione', NULL, '0', NULL, NULL, NULL, '${NCF.noteInterne}', ${NCF.valorePezzo})`;
        var queryString = `INSERT INTO NCF.dbo.ncfdata (${tableValues}) VALUES ('${NCF.codiceNCF}', '${NCF.codiceProdotto}', '${NCF.fornitore}', '${NCF.contoFornitore}', '${NCF.data}', '${NCF.descrizione}', '${NCF.quantità}', '${NCF.dimLotto}', '${NCF.tipoControllo}', '${NCF.rilevazione}', '${NCF.classeDifetto}', '${NCF.dettaglio}', '${NCF.operatoreDettaglio}', '${NCF.commessa}', '${NCF.scarto}', '${NCF.foto}', '${NCF.stato}', 'SE - Segnalazione', NULL, '0', NULL, NULL, NULL, NULL, NULL)`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELL'INSERIMENTO SU DB DELLA NCF " + NCF.codiceNCF + ", LOG: " + err.message);
            } else {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: NCF " + NCF.codiceNCF + " INSERITA NEL DB");
                callback(null, 'ok');
                connection.close();
            }
        });

        connection.execSql(pippo);
    }
}

/**
 * Costruttore per dati visibili sulla dashboard superuser
 */
function NCFDashboard(NCF, fornitore, codiceProdotto, stato, data) {
    this.ncf = NCF;
    this.fornitore = fornitore;
    this.codiceProdotto = codiceProdotto;
    this.stato = stato;
    this.data = data;
}

/**
 * Creazione codice progressivo delle NCF. Attualmente impostata per partire da 150
 */
function creaCodiceNCF(callback) {
    var ncfPrefix = "NCF";
    var separator = "-";
    var currentYear = new Date().getFullYear().toString().substr(-2);
    var connection = new Connection(server_config_file);
    var response = "";
    connection.on('connect', function(err) {
        if (err) {
            console.error(err.message);
        } else {
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = `SELECT ${tableValues} FROM NCF.dbo.ncfdata`;
        var pippo = new Request(queryString, function(err, rowCount, rows) {
            if (err) {
                console.log("[" + serverUtils.getData() + "] " + "SERVER API: ERRORE NELLA CREAZIONE DEL CODICE NCF, LOG: " + err.message);
            } else {
                var fakeRow = 149 + rowCount;
                var numeroNCFTotali;
                if (!(fakeRow)) { numeroNCFTotali = "0001" }
                if (fakeRow < 10 && fakeRow > 0) { numeroNCFTotali = "000" + ++fakeRow }
                if (fakeRow < 100 && fakeRow > 9) { numeroNCFTotali = "00" + ++fakeRow }
                if (fakeRow < 1000 && fakeRow > 99) { numeroNCFTotali = "0" + ++fakeRow }
                if (fakeRow < 10000 && fakeRow > 999) { numeroNCFTotali = "" + ++fakeRow }
                response = ncfPrefix + separator + currentYear + numeroNCFTotali;
                callback(null, response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
}