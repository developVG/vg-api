module.exports = {
    getHtml: function (report) {
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
    },
    getData: function () {
        Number.prototype.padLeft = function (base, chr) {
            var len = (String(base || 10).length - String(this).length) + 1;
            return len > 0 ? new Array(len).join(chr || '0') + this : this;
        }

        var d = new Date,
            dformat = [d.getFullYear(), (d.getMonth() + 1).padLeft(), d.getDate().padLeft()].join('-') + ' ' +
                [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()].join(':');

        return dformat;
    },
    setPdfName: function (ncf) {
        return (ncf.toString() + '.pdf');
    },
    setHtmlTemplateName: function (ncf) {
        return (ncf.toString() + '.html');
    }

}