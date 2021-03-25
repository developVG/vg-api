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
var server_config_file = {
    server: 'SRV-FILE',
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
        rowCollectionOnRequestCompletion: true,
        instanceName: 'SERVER_FILE',
    }
};

// Variabili
const tableValues = 'codice_ncf, codice_prodotto, nome_fornitore, conto_fornitore, data, descrizione, quantità, dimensione_lotto, tipologia_controllo, rilevazione, classe_difetto, dettaglio, nome_operatore, commessa, scarto, foto, stato, azione_comunicata, costi_sostenuti, addebito_costi, chiusura_ncf, costi_riconosciuti, merce_in_scarto';
var TYPES = require('tedious').TYPES;
var path = require('path');
var serverUtils = require("./serverUtils.js");
const { request } = require('http');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/images')
    },
    filename: function (req, file, cb) {

        cb(null, req.body.codiceNCF + Date.now().toString() + '.png')
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 9999999999}
});
//Setup
app.use(express.static('public'));
app.use('/images', express.static('uploads/images'));
app.use('/pdfNCF', express.static('pdfStorage'));

app.listen(PORT, hostname, () => {
    console.log("[" + serverUtils.getData() + "] " + "SERVER RUNNING");
});

app.use(bodyParser.json({limit:'3000mb'})); app.use(bodyParser.urlencoded({extended:true, limit:'mb'}));

/**
 * Endpoint per il submit del form NCF
 * 
 * @var report rappresenta l'oggetto NCF strutturato come:
 *      @param codiceNCF codice articolo
 *      @param codiceBarre generato dinamicamente tramite il progressivo con la funzione serverUtilis.creaProgressivo()
 *      @param fornitore stringa contenente il nome del fornitore
 *      @param data di invio (non dell'apertura) del report, strutturata come DD/MM/AAAA HH:MM:SS
 *      @param progressivo numero NCF
 *      @param descrizione descrizione dell'articolo identificato da codiceNCF
 *      @param quantità numero di articoli non conformi
 *      @param dimLotto dimensione lotto articoli non conformi
 *      @param tipoControllo stringa che identifica la tipologia di analisi effettuata ("Campione" o "Intero Lotto")
 *      @param rilevazione stringa che identifica il momento in cui è stata identificata la non conformità ("Accettazione" o "Produzione")
 *      @param classeDifetto stringa che rappresenta la tipologia di NCF
 *      @param dettaglio stringa contenente la descrizione scritta dall'operatore della NCF
 *      @param operatoreDettaglio stringa contenente il nome dell'operatore
 *      @param commessa stringa contenente il numero di commessa modificata
 *      @param scarto boolean che identifica o meno la messa in scarto degli articoli legati alla NCF. Se "Sì" innesca la generazione del PDF da stampare e 
 *      collegare agli oggetti scartati, se "No" rimanda a una pagina di conferma.
 *      @param foto array con i path delle foto associate alla NCF
 *      @param radioMailNotifica boolean per l'invio della mail al responsabile qualità
 * 
 */
app.post('/uploadmultiple', upload.any(), (req, res, next) => {

    creaCodiceNCF(function (error, response) {
        console.log("Creato codice ncf: " + response);
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
            stato: 1
        };

        //Salvataggio path dei files caricati all'interno dell'array report.foto
        req.files.forEach(element => report.foto.push(element.path));

        //var htmlTemplateName = path.join(__dirname, 'htmlTemplateStorage', response.substr(4) + ".html");
        //var pdfName = path.join(__dirname, 'pdfStorage', response.substr(4) + ".pdf");
        insertDB(report, function (error, testresp) {
            //Mail notifica + mail di conferma ad operatore -> Doppio destinatario
            if (req.body.radioMailNotifica == 'Sì' && report.requirePdf == '1') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=3&mailOperatore=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                urlInvioMail.searchParams.set('mailOperatore', report.emailOperatore);
                http.get(urlInvioMail, (resp) => {
                    ;
                }).on("error", (err) => {
                    console.log("Errore invio mail: " + err.message);
                });
                res.status(200).redirect("/confirmation.html");
            }

            //Solo mail di conferma ad operatore
            if (req.body.radioMailNotifica == 'No' && report.requirePdf == '1') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=4&mailOperatore=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                urlInvioMail.searchParams.set('mailOperatore', report.emailOperatore);
                http.get(urlInvioMail, (resp) => {
                    ;
                }).on("error", (err) => {
                    console.log("Errore invio mail: " + err.message);
                });
                res.status(200).redirect("/confirmation.html");
            }

            //Solo mail di notifica
            if (req.body.radioMailNotifica == 'Sì' && report.requirePdf == '0') {
                var urlInvioMail = new URL('http://10.10.1.23:3001/invioMail?codiceNCF=1&tipoMail=1');
                urlInvioMail.searchParams.set('codiceNCF', response);
                http.get(urlInvioMail, (resp) => {
                    ;
                }).on("error", (err) => {
                    console.log("Errore invio mail: " + err.message);
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
        merceInScarto: checkNullString(req.body.merceInScarto)
    }
    req.files.forEach(element => updatedNCF.foto.push(element.path));

    updateDB(updatedNCF);

    res.header("Access-Control-Allow-Origin", "*").status(200).send("Ok");
});

function checkNullString(string) {
    if (string == 'null' || string == 'NULL')
        return 'NULL';
    else {
        return string;
    }
}

app.route('/fotoNCF').get(function (req, res) {
    console.log(req.query.numeroNCF);
})

/**
 * Endpoint per la popolazione della dashboard adibita alla gestione delle NCF da parte del superuser
 * 
 * ATTUALMENTE MOCKATA
 */
app.get('/dashboardData', function (req, res) {
    //Chiamata SQL e inserimento in una variabile di tutti i report
    /***************************MOCK******************************/
    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to SERVER-BUSINESS...");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    /***************************MOCK******************************/
    var queryString = "SELECT codice_ncf, nome_fornitore, codice_prodotto, stato, data FROM NCF.dbo.ncfdata ORDER BY codice_ncf DESC";
    function executeStatement() {
        pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log('Query Executed...');
                jsonArray = [];
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                jsonArray.forEach(element => {
                    response.push(new NCFDashboard(element.codice_ncf, element.nome_fornitore, element.codice_prodotto, element.stato, element.data));
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
                console.log("Closing connection to SERVER-BUSINESS...");
                connection.close();
            }
        });

        connection.execSql(pippo);
    }
});

app.get('/confirmation.html', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*").status(200).sendFile(path.join(__dirname, '\\public\\confirmationPage.html'));
});

app.get('/confirmationcss', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*").status(200).sendFile(path.join(__dirname, '\\public\\css\\confirmationPage.css'));
});

/**
 * Endopoint per il form di submit NCF
 * 
 * Acquisisce il codice articolo dalla query in formato http://10.10.1.23:3003/elencoFornitori?codiceFornitori=codicearticolo dove
 * @param codicearticolo è il codice dell'articolo richiesto dal client
 * 
 * Se il codice articolo è vuoto (per esempio se è stato cancellato dopo un inserimento errato), non viene effettuata nessuna query per non appesantire 
 * la webapp con query senza filtri che resistuirebbero > 10.000 righe.
 * 
 * La response è formata da un JSON con dati formattati in questo modo:
 * @param codart codice articolo
 * @param conto codice univoco del fornitore
 * @param descr descrizione dell'articolo 
 * @param fornitore stringa con nome del fornitore
 * @param giacenzeMAG1 numero di articoli presenti in magazzino
 * @param impegniWIP
 * @param marca 
 * @param primoOPdaevadere 
 * @param ubicazione
 */
app.get('/elencoFornitori', function (req, res) {
    console.log("Richiesta fornitori per codice articolo: " + req.query.codiceFornitori);
    var connection = new Connection(server_config_business);
    var response = [];
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to SERVER-BUSINESS...");
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
                console.log("Closing connection to SERVER-BUSINESS...");
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

app.get('/elencoOperatori', function (req, res) {
    console.log('Richiesto elenco operatori V.G.');
    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to SERVER-BUSINESS...");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = "SELECT * FROM ANAGRAFICHE.dbo.mailinglist"
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
                console.log("Closing connection to SERVER-BUSINESS...");
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

app.get('/ncf', function (req, res) {
    console.log('Richiesti dati per: ' + req.query.codiceNCF);
    var numeroNCF = req.query.codiceNCF;
    var queryString = "SELECT * FROM NCF.dbo.ncfdata WHERE codice_ncf='" + numeroNCF + "'";

    var connection = new Connection(server_config_file);
    var response = [];
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to SERVER-BUSINESS...");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log('Query Executed...');
                jsonArray = [];
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
                res.header("Access-Control-Allow-Origin", "*").status(200).send(jsonArray);
                console.log("Closing connection to SERVER-BUSINESS...");
                connection.close();
            }
        });

        connection.execSql(pippo);
    }
});

/**
 * Endpoint per l'invio mail a seguito di due possibili eventi:
 * 1) Dalla dashboard superuser si vuole inviare una NCF a un fornitore
 * 2) Dal form di submit NCF si vuole avvisare il responsabile qualità dell'apertura di un nuovo report
 * 
 * @param req.query.tipoMail 1 per il caso 1) precedentemnente descritto, 2 per il caso 2) precedentemente descritto
 * 
 * Si appoggia alla funzione getNcf() per acquisire un oggetto NCF
 * Si appoggia alla funzione serverUtils.getHtml(NCF) per generare una preview HTML della NCF da inserire nella mail
 * 
 * ATTUALMENTE MAIL NON CONFIGURATE
 */
app.get('/invioMail', function (req, res) {

    //Ottengo oggetto NCF
    var NCF = getNCF(req.query.codiceNCF, function (error, response) {

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

        //var htmlNCF = serverUtils.getHtml(NCF);
        switch (req.query.tipoMail) {
            case '1':
                console.log("Invio notifica a stefano.valente@vgcilindri.it per NCF numero: " + response[0].codice_ncf);
                //Mail di notifica per apertura report NCF
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: 'stefano.valente@vgcilindri.it',
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + myJson,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,
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
                /*
                var mailOptions = {
                    from: 'controllo.qualità@vgcilindri.it',
                    to: fornitore.mainAddress,
                    cc: fornitore.cc,
                    subject: 'Non conformità numero: ' + NCF.codiceNCF + ' del ' + myJson,
                    html: htmlNCF
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
                */

                var mailingListTo = [];
                var mailingListCc = [];

                getMailAnagrafiche(req.query.contoFornitore, function (erTipo2, respTipo2) {

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

                    if(mailingListTo.length == 0){
                        mailingListTo.push('stefano.valente@vgcilindri.it');
                    }
                    if(mailingListCc.length == 0){
                        mailingListCc.push('lorenzo.galassi@vgcilindri.it');
                    }

                    var mailOptions = {
                        from: 'quality@vgcilindri.it',
                        to: mailingListTo,
                        cc: mailingListCc,
                        subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + myJson,
                        html: serverUtils.getMailQualityHtml(response[0], myJson),
                        attachments: attachmentsArray,

                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });

                });
                break;
            case '3':
                console.log("Invio notifica a stefano.valente@vgcilindri.it e a: " + req.query.mailOperatore + " per ncf: " + response[0].codice_ncf);

                var mailingList = [
                    'stefano.valente@vgcilindri.it',
                    req.query.mailOperatore,
                ];

                //Mail di notifica per apertura report NCF
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: mailingList,
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf + ' del ' + myJson,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,

                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
                break;
            case '4':
                console.log("Invio mail di conferma a: " + req.query.mailOperatore + " per ncf: " + response[0].codice_ncf);

                var mailingList = [
                    req.query.mailOperatore,
                ];

                //Mail di notifica per apertura report NCF
                var mailOptions = {
                    from: 'quality@vgcilindri.it',
                    to: mailingList,
                    cc: 'lorenzo.galassi@vgcilindri.it',
                    subject: 'Non conformità numero: ' + response[0].codice_ncf.substr(-4) + ' del ' + myJson,
                    html: serverUtils.getMailQualityHtml(response[0], myJson),
                    attachments: attachmentsArray,

                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
                break;
        }
    });
});

app.get('/mailFornitore', function (req, res) {
    
    var wait = getNCF('NCF-' + req.query.contoFornitore, function (reqz, resz) {
        getMailAnagrafiche(resz[0].conto_fornitore, function (request, response) {
            res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
        });
    });
});

function getMailAnagrafiche(contoFornitore, callback) {
    var connection = new Connection(server_config_business);
    var response = {};
    var realConto = parseInt(contoFornitore);
    connection.on('connect', function (err) {
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
        var pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);

            } else {
                var jsonArray = [];

                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
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

function getNCF(codiceNCF, callback) {

    var connection = new Connection(server_config_file);
    var response = {};
    connection.on('connect', function (err) {
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
        var pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                jsonArray = []
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
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

function updateDB(NCF) {
    var oggetto = getNCF(NCF.codiceNCF, function (error, response) {
        NCF.contoFornitore = response[0].conto_fornitore;
        NCF.nomeOperatore = response[0].nome_operatore;
        NCF.scarto = response[0].scarto;

        Array.isArray(response[0].foto) ? NCF.foto.concat(response[0].foto) : NCF.foto.push(response[0].foto);

        var connection = new Connection(server_config_file);

        connection.on('connect', function (err) {
            if (err) {
                console.error(err.message);
            } else {
                // If no error, then good to proceed.
                console.log("Connected to SERVER-FILE - UPDATE QUERY START");
                executeStatement();
            }
        });

        connection.connect();

        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;

        function executeStatement() {
            var queryString = `UPDATE NCF.dbo.ncfdata SET codice_prodotto='${NCF.codiceProdotto}', nome_fornitore= '${NCF.nomeFornitore}', conto_fornitore= '${NCF.contoFornitore}', data= '${NCF.data}', descrizione= '${NCF.descrizione}', quantità= ${NCF.quantità}, dimensione_lotto= ${NCF.dimensioneLotto}, tipologia_controllo= '${NCF.tipologiaControllo}', rilevazione= '${NCF.rilevazione}', classe_difetto= '${NCF.classificazione}', dettaglio= '${NCF.dettaglio}', nome_operatore= '${NCF.nomeOperatore}', commessa= '${NCF.commessa}', scarto= '${NCF.scarto}', foto= '${NCF.foto}', stato= ${NCF.stato}, azione_comunicata= '${NCF.azioneComunicata}', costi_sostenuti= ${NCF.costiSostenuti}, addebito_costi= ${NCF.addebitoCosti}, chiusura_ncf= '${NCF.chiusuraNCF}', costi_riconosciuti= ${NCF.costiSostenuti}, merce_in_scarto= '${NCF.merceInScarto}' WHERE codice_ncf='${NCF.codiceNCF}';`
            var pippo = new Request(queryString, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('UPDATE QUERY EXECUTED');
                    console.log("Closing connection to SERVER-FILE...");
                    connection.close();
                }
            });
            connection.execSql(pippo);
        }
    });

}


/**
 * 
 * @param NCF oggetto che rappresenta una non conformità, formattato come:
 * - codice_ncf (autogenerato)
 * - codice_prodotto
 * - nome_fornitore
 * - conto_fornitore
 * - data
 * - descrizione
 * - quantità
 * - dimensione_lotto
 * - tipologia_controllo 
 * - rilevazione
 * - classificazione_difetto
 * - dettaglio_difetto
 * - nome_operatore
 * - commessa
 * - 
 */

/**
codiceNCF: creaCodiceNCF(), 
        codiceBarre: creaCodiceNCF().substr(-4),
        codiceProdotto: req.body.codiceProdotto,
        fornitore: req.body.fornitore,
        data: serverUtils.getData(),
        descrizione: req.body.descrizioneReport,
        quantità: req.body.quantitàNonConformità,
        dimLotto: req.body.quantitàLottoAnalisi,
        tipoControllo: req.body.radioAnalisiEffettuata,
        rilevazione: req.body.radioRilevatoIn,
        classeDifetto: req.body.radioClassificazioneDifetto,
        dettaglio: req.body.dettaglioDifettoPerFornitore,
        operatoreDettaglio: req.body.nomeOperatore,
        commessa: req.body.commessa,
        scarto: parseINt(req.body.radioScarto),
        requirePdf: (req.body.radioScarto == "0") ? "0" : "1",
        foto: [],
        stato: 1
 */
function insertDB(NCF, callback) {
    var connection = new Connection(server_config_file);

    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Connected to SERVER-FILE - INSERT QUERY START");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = `INSERT INTO NCF.dbo.ncfdata (${tableValues}) VALUES ('${NCF.codiceNCF}', '${NCF.codiceProdotto}', '${NCF.fornitore}', '${NCF.contoFornitore}', '${NCF.data}', '${NCF.descrizione}', '${NCF.quantità}', '${NCF.dimLotto}', '${NCF.tipoControllo}', '${NCF.rilevazione}', '${NCF.classeDifetto}', '${NCF.dettaglio}', '${NCF.operatoreDettaglio}', '${NCF.commessa}', '${NCF.scarto}', '${NCF.foto}', '${NCF.stato}', NULL, NULL, NULL, NULL, NULL, NULL)`;
        var pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log('INSERT QUERY EXECUTED');
                console.log("Closing connection to SERVER-FILE...");
                callback(null, 'ok');
                connection.close();
            }
        });

        connection.execSql(pippo);
    }
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

/**
 * 
 * @returns 
 */

function creaCodiceNCF(callback) {
    var ncfPrefix = "NCF";
    var separator = "-";
    var currentYear = new Date().getFullYear().toString().substr(-2);
    var connection = new Connection(server_config_file);
    var response = "";
    connection.on('connect', function (err) {
        if (err) {
            console.error(err.message);
        } else {
            // If no error, then good to proceed.
            console.log("Creazione codice NCF - Connected to SERVER-FILE...");
            executeStatement();
        }
    });
    connection.connect();
    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

    function executeStatement() {
        var queryString = `SELECT ${tableValues} FROM NCF.dbo.ncfdata`;
        var pippo = new Request(queryString, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log('Query Executed...');
                var numeroNCFTotali;
                if (!(rowCount)) { numeroNCFTotali = "0001" }
                if (rowCount < 10 && rowCount > 0) { numeroNCFTotali = "000" + ++rowCount }
                if (rowCount < 100 && rowCount > 9) { numeroNCFTotali = "00" + ++rowCount }
                if (rowCount < 1000 && rowCount > 99) { numeroNCFTotali = "0" + ++rowCount }
                if (rowCount < 10000 && rowCount > 999) { numeroNCFTotali = "" + ++rowCount }
                response = ncfPrefix + separator + currentYear + numeroNCFTotali;
                callback(null, response);
                connection.close();
            }
        });
        connection.execSql(pippo);
    }
}