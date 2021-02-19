const express = require('express');
const multer = require('multer');
const puppeteer = require("puppeteer");
const fs = require('fs')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/uploads/images')
    },
    filename: function (req, file, cb) {
      
      cb(null, req.body.codiceNCF + Date.now().toString() +'.jpg')
    }
  })
const upload = multer({ storage: storage });
const app = express();
const hostname = '10.10.1.207';
const PORT = 3001;
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);

var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request
var serverUtils = require("./serverUtils.js");

app.use(express.static('public'));

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
    }else{
        res.status(200).redirect("/confirmation.html")
    }
})

app.listen(PORT, hostname, () => {
    console.log("[" + serverUtils.getData() + "] " + "SERVER RUNNING");
});

app.get('/confirmation.html', function(req, res){
    res.sendFile('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/public/confirmationPage.html');
});

app.get('/gif', function (req, res){
    res.sendFile('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/public/images/icons/source.gif');
});

app.get('/confirmation', function(req, res){
    res.header("Access-Control-Allow-Origin", "*").sendFile('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/12903j.html');
});

app.get('/confirmationcss', function(req, res){
    res.header("Access-Control-Allow-Origin", "*").sendFile('C:/Users/lorenzoga/Desktop/NonConformità/nonconformita/public/pdf/pdfStyle.css');
});

// Popolazione della Dashboard
app.get('/dashboardData', function(req,res){
    //Chiamata SQL e inserimento in una variabile di tutti i report
    /***************************MOCK******************************/
    var queryValueNFC = "12930";
    var queryValueFornitore = "Azienda Test 123";
    var queryValueCodiceProdotto = "91230";
    var queryValueStato = "1";
    var queryValueData = "12/02/21" //Sarà da formattare GG/MM/AA
    /***************************MOCK******************************/
    //Inserimento dei risultati in un array
    //Creazione di un JSON
    //Response col JSON
    var response = {};
    var keys = ["NCF", "Fornitore", "Codice Prodotto", "Stato", "Data"];
    response[keys[0]] = queryValueNFC;
    response[keys[1]] = queryValueFornitore;
    response[keys[2]] = queryValueCodiceProdotto;
    response[keys[3]] = queryValueStato;
    response[keys[4]] = queryValueData;
    res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
});

//Gestione Post Request della Dashboard
app.post('/previewData', function (req, res) {
    var response = req.NFC + "-TESTPOST";
    res.header("Access-Control-Allow-Origin", "*").status(200).send(response);
  });