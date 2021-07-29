module.exports = {
    getHtml: function(report) {
        var markup = `
    <!Doctype HTML>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <title>fixed layout</title>
        <link rel="stylesheet" type="text/css" href="C:/Users/vg_admin/Desktop/Quality/vgapi/public/pdf/pdfStyle.css">
    </head>
    
    <body>
    
        <div id="container">
            <div id="feedback">
                <div id="logoSection">
                    <img src="http://www.vgcilindri.it/wp-content/uploads/logo-270x104.png" style='height: 100%; width: 100%; object-fit: contain'>
                </div>
                <div id="codiceNCFSection">
                    <p style="font-size:xx-large;"></p>
                    <label>${report.codiceProdotto}</label>
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
                    <label style="font-size:20px;">${report.codiceNCF}</label>
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
    getData: function() {
        Number.prototype.padLeft = function(base, chr) {
            var len = (String(base || 10).length - String(this).length) + 1;
            return len > 0 ? new Array(len).join(chr || '0') + this : this;
        }

        var d = new Date,
            dformat = [d.getFullYear(), (d.getMonth() + 1).padLeft(), d.getDate().padLeft()].join('-') + ' ' + [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()
            ].join(':');

        return dformat;
    },
    formatDate: function(input) {
        var datePart = input.match(/\d+/g),
            year = datePart[0].substring(2), // get only two digits
            month = datePart[1],
            day = datePart[2];
        return day + '/' + month + '/' + year;
    },
    fixDate: function(dateString) {
        //var input = 'YYYY-MM-DD hh:mm:ss.mmm'
        //var output = 'DD-MM-YY hh:mm'
        var tokenArray = [];

        dateString.split(/[- :.]/).forEach(item => {
            tokenArray.push(item);
        });

        return tokenArray[2] + '-' + tokenArray[1] + '-' + tokenArray[0].substr(-2) + ' ' + tokenArray[3] + ':' + tokenArray[4];
    },
    fixDateFornitore: function(input) {
        //var input = 'YYYY-MM-DD hh:mm:ss.mmm'
        //var output = 'DD-MM-YY'
        var tokenArray = [];

        input.split(/[- :.]/).forEach(item => {
            tokenArray.push(item);
        });

        return tokenArray[2] + '-' + tokenArray[1] + '-' + tokenArray[0];
    },
    getTestoAzioneComunicata: function(input) {
        switch (input) {
            case 'AD - Accettato in Deroga':
                return `
        [Accettato in Deroga] La V.G. accetta in deroga il materiale nonostante la difettosità senza nulla rendere o addebitare al fornitore.
        La non conformità è stata comunicata al fornitore affinchè ne prenda atto ed effettui tempestivamente le dovute verifiche interne ed azioni correttive.
        `;
            case 'RA - Reso per Accredito':
                return `
        [Reso per Accredito] Il materiale non è accettabile e la V.G. richiede il riaccredito del valore della merce.
        La merce non conforme è pronta per il ritiro, in attesa di vostra comunicazione a riguardo. In alternativa al reso, la V.G. provvederà alla rottamazione della merce se indicato dal fornitore.      
        `;
            case 'RI - Ripristino Interno':
                return `
        [Ripristino Interno] La V.G. ha provveduto a ripristinare internamente la merce non conforme per poter proseguire la produzione per poter mantenere le scadenze pianificate.      
        `;
            case 'RG - Reso per Ripristino':
                return `
        [Reso in Garanzia per Ripristino/Reintegro] Il materiale non è accettabile e la V.G. richiede ripristino/reintegro del lotto non conforme.
        La merce non conforme è pronta per il ritiro, in attesa di vostra comunicazione a riguardo. In alternativa al reso, la V.G. provvederà alla rottamazione della merce se indicato dal fornitore.
        `;
            case 'NI - Non Inviata':
                return `
        NCF non inviata al fornitore
        `;
            case 'RO - Reso per Accredito + RIORDINO':
                return `
        [Reso per Accredito + Riordino] Il materiale non è accettabile e la V.G. richiede il riaccredito del valore della merce.
        La merce non conforme è pronta per il ritiro, in attesa di vostra comunicazione a riguardo. In alternativa al reso, la V.G. provvederà alla rottamazione della merce se indicato dal fornitore.
        RICHIESTO REINTEGRO IMMEDIATO.
        `;
            case 'SE - Segnalazione':
                return `
        [Segnalazione Fornitore] La V.G. comunica quanto riportato. 
        La non conformità è stata comunicata al fornitore affinchè ne prenda atto ed effettui tempestivamente le dovute verifiche interne ed azioni correttive.
        `;
            case 'RF - Reso Fornitore già concordato':
                break;
        }
    },
    getMailQualityHtml: function(report, data) {

        var realcode = report.codice_ncf.substr(-4);

        var realScarto = report.scarto == true ? 'Sì' : 'No';

        var commessa = report.commessa == '' ? '0' : '1';
        var commessaMarkup;
        if (commessa == '1') {
            commessaMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Modifica commessa: ${report.commessa}</li>`;
        } else {
            commessaMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Commessa non indicata</li>`;
        }

        var dettaglio = report.dettaglio == '' ? '0' : '1';
        var dettaglioMarkup;
        if (dettaglio == '1') {
            dettaglioMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Dettaglio: ${report.dettaglio}</li>`
        } else {
            dettaglioMarkup = ``;
        }


        var quantitàNCFpresente = report.quantità > 0 ? 1 : 0;
        var dimensioneLottoPresente = report.dimensione_lotto > 0 ? 1 : 0;
        var dimensioniMarkup;
        if (quantitàNCFpresente == 1 && dimensioneLottoPresente == 1) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: ${report.quantità} su ${report.dimensione_lotto}</li>
      `;
        } else if (quantitàNCFpresente == 1 && dimensioneLottoPresente == 0) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: ${report.quantità}</li>
      `;
        } else if (quantitàNCFpresente == 0) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: Non definita</li>
      `;
        }

        var realDate = this.fixDate(data);

        var markup = `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office">
        
        <head>
          <meta charset="utf-8"> <!-- utf-8 works for most cases -->
          <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
          <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
          <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
          <!-- Tell iOS not to automatically link certain text strings. -->
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        
          <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
          <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
        
          <!-- Web Font / @font-face : BEGIN -->
          <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
        
          <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
          <!--[if mso]>
                <style>
                    * {
                        font-family: sans-serif !important;
                    }
                </style>
            <![endif]-->
        
          <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
          <!--[if !mso]><!-->
          <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
          <!--<![endif]-->
        
          <!-- Web Font / @font-face : END -->
        
          <!-- CSS Reset : BEGIN -->
          <style>
            /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
            :root {
              color-scheme: light;
              supported-color-schemes: light;
            }
        
            /* What it does: Remove spaces around the email design added by some email clients. */
            /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
            html,
            body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
            }
        
            /* What it does: Stops email clients resizing small text. */
            * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
        
            /* What it does: Centers email on Android 4.4 */
            div[style*="margin: 16px 0"] {
              margin: 0 !important;
            }
        
            /* What it does: forces Samsung Android mail clients to use the entire viewport */
            #MessageViewBody,
            #MessageWebViewDiv {
              width: 100% !important;
            }
        
            /* What it does: Stops Outlook from adding extra spacing to tables. */
            table,
            td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
            }
        
            /* What it does: Fixes webkit padding issue. */
            table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
            }
        
            /* What it does: Uses a better rendering method when resizing images in IE. */
            img {
              -ms-interpolation-mode: bicubic;
            }
        
            /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
            a {
              text-decoration: none;
            }
        
            /* What it does: A work-around for email clients meddling in triggered links. */
            a[x-apple-data-detectors],
            /* iOS */
            .unstyle-auto-detected-links a,
            .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
        
            /* What it does: Prevents Gmail from changing the text color in conversation threads. */
            .im {
              color: inherit !important;
            }
        
            /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
            .a6S {
              display: none !important;
              opacity: 0.01 !important;
            }
        
            /* If the above doesn't work, add a .g-img class to any image in question. */
            img.g-img+div {
              display: none !important;
            }
        
            /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
            /* Create one of these media queries for each additional viewport size you'd like to fix */
        
            /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
            @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                min-width: 320px !important;
              }
            }
        
            /* iPhone 6, 6S, 7, 8, and X */
            @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                min-width: 375px !important;
              }
            }
        
            /* iPhone 6+, 7+, and 8+ */
            @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                min-width: 414px !important;
              }
            }
          </style>
          <!-- CSS Reset : END -->
        
          <!-- Progressive Enhancements : BEGIN -->
          <style>
            /* What it does: Hover styles for buttons */
            .button-td,
            .button-a {
              transition: all 100ms ease-in;
            }
        
            .button-td-primary:hover,
            .button-a-primary:hover {
              background: #555555 !important;
              border-color: #555555 !important;
            }
        
            /* Media Queries */
            @media screen and (max-width: 480px) {
        
              /* What it does: Forces table cells into full-width rows. */
              .stack-column,
              .stack-column-center {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
              }
        
              /* And center justify these ones. */
              .stack-column-center {
                text-align: center !important;
              }
        
              /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
              .center-on-narrow {
                text-align: center !important;
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
                float: none !important;
              }
        
              table.center-on-narrow {
                display: inline-block !important;
              }
        
              /* What it does: Adjust typography on small screens to improve readability */
              .email-container p {
                font-size: 17px !important;
              }
            }
          </style>
          <!-- Progressive Enhancements : END -->
        
        </head>
        <!--
            The email background color (#222222) is defined in three places:
            1. body tag: for most email clients
            2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
            3. mso conditional: For Windows 10 Mail
        -->
        
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
          <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
            <!--[if mso | IE]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
            <tr>
            <td>
            <![endif]-->
        
            <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
            <!-- Preview Text Spacing Hack : BEGIN -->
            <div
              style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>
            <!-- Preview Text Spacing Hack : END -->
        
            <!--
                    Set the email width. Defined in two places:
                    1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
                    2. MSO tags for Desktop Windows Outlook enforce a 680px width.
                    Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
                -->
            <div style="max-width: 680px; margin: 0 auto;" class="email-container">
              <!--[if mso]>
                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
                    <tr>
                    <td>
                    <![endif]-->
        
              <!-- Email Body : BEGIN -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">
                <!-- Email Header : BEGIN -->
                <span></span>
        <tr>
          <hr style="border: 0; height: 5px; background-color: red;">
          <h1
            style="margin: 0px 0px 0px; font-size: 30px; font-family: sans-serif; line-height: 30px; color: #333333; font-weight: normal;">
            V.G. S.R.L.</h1>
          <h5
            style="margin: 0px 0px 0px; font-size: 10px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Via Emilia Ponente, 390 - 48014 Castel Bolognese (RA)
          </h5>
          <h5
            style="margin: 0px 0px 0px; font-size: 10px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Tel. +39 0546 51708 - Fax +39 0546 51301
          </h5>
          <hr style="border: 0; height: 5px; background-color: red;">
        </tr>
                <!-- Email Header : END -->
        
                <!-- 1 Column Text + Button : BEGIN -->
                <tr>
                  <td style="background-color: #ffffff;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                         
                           <h1
                    style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
                    Non Conformità Numero: <b>NCF 21${realcode}</b></h1>
                    <h1
                    style="margin: 0 0 15px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">Del: <b>${realDate}</b></h1>
                          <ul style="padding: 0; margin: 0; list-style-type: disc;">
                            <li style="margin:0 0 10px 30px;" class="list-item-first">Codice Prodotto: ${report.codice_prodotto}</li>
                            <li style="margin:0 0 10px 30px;">Nome Fornitore: ${report.nome_fornitore}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Descrizione: ${report.descrizione}</li>
                            ${dimensioniMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Tipologia Controllo: ${report.tipologia_controllo}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Rilevazione: ${report.rilevazione}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Classe Difetto: ${report.classe_difetto}</li>
                            ${dettaglioMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Nome Operatore: ${report.nome_operatore}</li>
                            ${commessaMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Scarto: ${realScarto}</li>
                          </ul>
                        </td>
                      </tr> 
        
                    </table>
                  </td>
                </tr>
                <!-- 1 Column Text + Button : END -->
        
          </center>
        </body>
        
        </html>
        `
        return markup;
    },
    getMailFornitoreHtml: function(report, data) {

        var realcode = report.codice_ncf.substr(-4);

        var realScarto = report.scarto == true ? 'Sì' : 'No';

        var commessa = report.commessa == '' ? '0' : '1';
        var commessaMarkup;
        if (commessa == '1') {
            commessaMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Modifica commessa: ${report.commessa}</li>`;
        } else {
            commessaMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Commessa non indicata</li>`;
        }

        var dettaglio = report.dettaglio == '' ? '0' : '1';
        var dettaglioMarkup;
        if (dettaglio == '1') {
            dettaglioMarkup = `<li style="margin:0 0 10px 30px;" class="list-item-last">Dettaglio: ${report.dettaglio}</li>`
        } else {
            dettaglioMarkup = ``;
        }

        var realDate = this.fixDateFornitore(data);

        var quantitàNCFpresente = report.quantità > 0 ? 1 : 0;
        var dimensioneLottoPresente = report.dimensione_lotto > 0 ? 1 : 0;
        var dimensioniMarkup;
        if (quantitàNCFpresente == 1 && dimensioneLottoPresente == 1) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: ${report.quantità} su ${report.dimensione_lotto}</li>
      `;
        } else if (quantitàNCFpresente == 1 && dimensioneLottoPresente == 0) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: ${report.quantità}</li>
      `;
        } else if (quantitàNCFpresente == 0) {
            dimensioniMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Quantità: Non definita</li>
      `;
        }

        var realCosti = report.costi_sostenuti > 0 ? 1 : 0;
        var realAddebitoCosti = report.addebito_costi > 0 ? 1 : 0;
        var costiMarkup;
        if (realCosti == 1 && realAddebitoCosti == 1) {
            costiMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Costi Addebitati: ${report.costi_sostenuti}€ (sostenuti da V.G. per gestione NCF)</li>
      `;
        } else if (realCosti == 1 && realAddebitoCosti == 0) {
            costiMarkup = `
      <li style="margin:0 0 10px 30px;" class="list-item-last">Costi Sostenuti: ${report.costi_sostenuti}€ (non addebitati al fornitore)</li>
      `;
        } else if (realCosti == 0) {
            costiMarkup = ``;
        }

        var realAnalisiEffettuata = report.tipologia_controllo == "LOTTO" ? 'INTERO LOTTO' : 'CAMPIONE';

        var realPrezzoTotaleMerce = Math.round(((report.valore_pezzo * report.quantità) + Number.EPSILON) * 100) / 100;
        var prezzoTotaleMarkup = `
    <li style="margin:0 0 10px 30px;" class="list-item-last">Valore Merce: ${realPrezzoTotaleMerce}€ (${report.valore_pezzo}x${report.quantità}PZ)</li>
    `;

        var markup = `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office">
        
        <head>
          <meta charset="utf-8"> <!-- utf-8 works for most cases -->
          <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
          <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
          <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
          <!-- Tell iOS not to automatically link certain text strings. -->
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        
          <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
          <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
        
          <!-- Web Font / @font-face : BEGIN -->
          <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
        
          <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
          <!--[if mso]>
                <style>
                    * {
                        font-family: sans-serif !important;
                    }
                </style>
            <![endif]-->
        
          <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
          <!--[if !mso]><!-->
          <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
          <!--<![endif]-->
        
          <!-- Web Font / @font-face : END -->
        
          <!-- CSS Reset : BEGIN -->
          <style>
            /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
            :root {
              color-scheme: light;
              supported-color-schemes: light;
            }
        
            /* What it does: Remove spaces around the email design added by some email clients. */
            /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
            html,
            body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
            }
        
            /* What it does: Stops email clients resizing small text. */
            * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
        
            /* What it does: Centers email on Android 4.4 */
            div[style*="margin: 16px 0"] {
              margin: 0 !important;
            }
        
            /* What it does: forces Samsung Android mail clients to use the entire viewport */
            #MessageViewBody,
            #MessageWebViewDiv {
              width: 100% !important;
            }
        
            /* What it does: Stops Outlook from adding extra spacing to tables. */
            table,
            td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
            }
        
            /* What it does: Fixes webkit padding issue. */
            table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
            }
        
            /* What it does: Uses a better rendering method when resizing images in IE. */
            img {
              -ms-interpolation-mode: bicubic;
            }
        
            /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
            a {
              text-decoration: none;
            }
        
            /* What it does: A work-around for email clients meddling in triggered links. */
            a[x-apple-data-detectors],
            /* iOS */
            .unstyle-auto-detected-links a,
            .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
        
            /* What it does: Prevents Gmail from changing the text color in conversation threads. */
            .im {
              color: inherit !important;
            }
        
            /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
            .a6S {
              display: none !important;
              opacity: 0.01 !important;
            }
        
            /* If the above doesn't work, add a .g-img class to any image in question. */
            img.g-img+div {
              display: none !important;
            }
        
            /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
            /* Create one of these media queries for each additional viewport size you'd like to fix */
        
            /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
            @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                min-width: 320px !important;
              }
            }
        
            /* iPhone 6, 6S, 7, 8, and X */
            @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                min-width: 375px !important;
              }
            }
        
            /* iPhone 6+, 7+, and 8+ */
            @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                min-width: 414px !important;
              }
            }
          </style>
          <!-- CSS Reset : END -->
        
          <!-- Progressive Enhancements : BEGIN -->
          <style>
            /* What it does: Hover styles for buttons */
            .button-td,
            .button-a {
              transition: all 100ms ease-in;
            }
        
            .button-td-primary:hover,
            .button-a-primary:hover {
              background: #555555 !important;
              border-color: #555555 !important;
            }
        
            /* Media Queries */
            @media screen and (max-width: 480px) {
        
              /* What it does: Forces table cells into full-width rows. */
              .stack-column,
              .stack-column-center {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
              }
        
              /* And center justify these ones. */
              .stack-column-center {
                text-align: center !important;
              }
        
              /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
              .center-on-narrow {
                text-align: center !important;
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
                float: none !important;
              }
        
              table.center-on-narrow {
                display: inline-block !important;
              }
        
              /* What it does: Adjust typography on small screens to improve readability */
              .email-container p {
                font-size: 17px !important;
              }
            }
          </style>
          <!-- Progressive Enhancements : END -->
        
        </head>
        <!--
            The email background color (#222222) is defined in three places:
            1. body tag: for most email clients
            2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
            3. mso conditional: For Windows 10 Mail
        -->
        
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
          <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
            <!--[if mso | IE]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
            <tr>
            <td>
            <![endif]-->
        
            <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
            <!-- Preview Text Spacing Hack : BEGIN -->
            <div
              style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>
            <!-- Preview Text Spacing Hack : END -->
        
            <!--
                    Set the email width. Defined in two places:
                    1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
                    2. MSO tags for Desktop Windows Outlook enforce a 680px width.
                    Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
                -->
            <div style="max-width: 680px; margin: 0 auto;" class="email-container">
              <!--[if mso]>
                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
                    <tr>
                    <td>
                    <![endif]-->
        
              <!-- Email Body : BEGIN -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">
                <!-- Email Header : BEGIN -->
                <span></span>
        <tr>
          <hr style="border: 0; height: 5px; background-color: red;">
          <h1
            style="margin: 0px 0px 0px; font-size: 30px; font-family: sans-serif; line-height: 30px; color: #333333; font-weight: normal;">
            V.G. S.R.L.</h1>
          <h5
            style="margin: 0px 0px 0px; font-size: 10px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Via Emilia Ponente, 390 - 48014 Castel Bolognese (RA)
          </h5>
          <h5
            style="margin: 0px 0px 0px; font-size: 10px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Tel. +39 0546 51708 - Fax +39 0546 51301
          </h5>
          <hr style="border: 0; height: 5px; background-color: red;">
        </tr>
                <!-- Email Header : END -->
        
                <!-- 1 Column Text + Button : BEGIN -->
                <tr>
                  <td style="background-color: #ffffff;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                         
                           <h1
                    style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
                    Non Conformità Fornitore: <b>NCF 21${realcode}</b></h1>
                    <h1
                    style="margin: 0 0 15px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">Del: <b>${realDate}</b></h1>
                          <ul style="padding: 0; margin: 0; list-style-type: disc;">
                            <li style="margin:0 0 10px 30px;">Fornitore: ${report.nome_fornitore}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-first">Codice Prodotto: ${report.codice_prodotto}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Descrizione: ${report.descrizione}</li>
                            ${dimensioniMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Tipologia Controllo: ${realAnalisiEffettuata}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Rilevazione: ${report.rilevazione}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Classe Difetto: ${report.classe_difetto}</li>
                            ${dettaglioMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Azione Comunicata: ${this.getTestoAzioneComunicata(report.azione_comunicata)}</li>
                            ${costiMarkup}
                            ${prezzoTotaleMarkup}
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Riferimento Spedizione Fornitore: ${report.riferimentoC}</li>
                            <li style="margin:0 0 10px 30px;" class="list-item-last">Riferimento Spedizione VG: ${report.riferimentoVG}</li>
                          </ul>
                        </td>
                      </tr> 
        
                    </table>
                  </td>
                </tr>
                <!-- 1 Column Text + Button : END -->
                <!-- Email Footer : BEGIN -->
                <span></span>
                <table>
                <footer>
                <tr>
                   <hr style="border: 0; height: 5px; background-color: red;">
                   <dd
                   style="margin: 0px 0px 0px; font-size: 18px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
                   Stefano Valente
                 </dd>
                  <dd
            style="margin: 0px 0px 0px; font-size: 13px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Responsabile Qualità
          </dd>
          <dd
            style="margin: 0px 0px 0px; font-size: 13px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Cell: 347 3451920
          </dd>
          <dd
            style="margin: 0px 0px 0px; font-size: 13px; font-family: sans-serif; line-height: 18px; color: #555555; font-weight: normal;">
            Mail: quality@vgcilindri.it, stefano.valente@vgcilindri.it
          </dd>
          <hr style="border: 0; height: 5px; background-color: red;">
        </tr>
        </footer>
                <!-- Email Footer : END -->
                </table>
          </center>
        </body>
        
        </html>
        `
        return markup;
    },
    getMailRottamazioniMultiple: function(elencoNCF) {

        var tableMarkup = ``;

        elencoNCF.forEach(ncf => {

            var tempMarkup = `
          <tr>
             <td>${(ncf.codice_ncf.substr(-6))}</td>
             <td>${(ncf.conto_fornitore.toString().substr(-4))}</td>
             <td>${ncf.codice_prodotto}</td>
             <td>${ncf.descrizione}</td>
             <td>${ncf.quantità}</td>
             <td>${this.fixDateFornitore((JSON.stringify(ncf.data).replace(/[a-z]/gi, ' ').replace(/"/g, '')))}</td>
             <td>${ncf.note_interne}</td>
          </tr>
          `
            tableMarkup += tempMarkup;
        });


        var markup = `<!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <!-- Tell iOS not to automatically link certain text strings. -->
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
      <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
      <!--[if gte mso 9]>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
    
      <!-- Web Font / @font-face : BEGIN -->
      <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
    
      <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
      <!--[if mso]>
            <style>
                * {
                    font-family: sans-serif !important;
                }
            </style>
        <![endif]-->
    
      <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
      <!--[if !mso]><!-->
      <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
      <!--<![endif]-->
    
      <!-- Web Font / @font-face : END -->
    
      <!-- CSS Reset : BEGIN -->
      <style>
        /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
        :root {
          color-scheme: light;
          supported-color-schemes: light;
        }
    
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
    
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
    
        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
    
        /* What it does: forces Samsung Android mail clients to use the entire viewport */
        #MessageViewBody,
        #MessageWebViewDiv {
          width: 100% !important;
        }
    
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
    
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
    
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
    
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
    
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],
        /* iOS */
        .unstyle-auto-detected-links a,
        .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
    
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
    
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
    
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img+div {
          display: none !important;
        }
    
        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */
    
        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
          u~div .email-container {
            min-width: 320px !important;
          }
        }
    
        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
          u~div .email-container {
            min-width: 375px !important;
          }
        }
    
        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
          u~div .email-container {
            min-width: 414px !important;
          }
        }
      </style>
      <!-- CSS Reset : END -->
    
      <!-- Progressive Enhancements : BEGIN -->
      <style>
        /* What it does: Hover styles for buttons */
        .button-td,
        .button-a {
          transition: all 100ms ease-in;
        }
    
        .button-td-primary:hover,
        .button-a-primary:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
    
        /* Media Queries */
        @media screen and (max-width: 480px) {
    
          /* What it does: Forces table cells into full-width rows. */
          .stack-column,
          .stack-column-center {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            direction: ltr !important;
          }
    
          /* And center justify these ones. */
          .stack-column-center {
            text-align: center !important;
          }
    
          /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
          .center-on-narrow {
            text-align: center !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
            float: none !important;
          }
    
          table.center-on-narrow {
            display: inline-block !important;
          }
    
          /* What it does: Adjust typography on small screens to improve readability */
          .email-container p {
            font-size: 17px !important;
          }
        }
      </style>
      <!-- Progressive Enhancements : END -->
      <style>
      table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          border: 1px solid #ddd;
      }
      
      th,
      td {
          text-align: left;
          padding: 8px;
      }
      
      tr:nth-child(even) {
          background-color: #f2f2f2
      }
  </style>
    </head>
    <!--
        The email background color (#222222) is defined in three places:
        1. body tag: for most email clients
        2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
        3. mso conditional: For Windows 10 Mail
    -->
    
    <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
      <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
        <!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
        <tr>
        <td>
        <![endif]-->
    
        <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
        <!-- Preview Text Spacing Hack : BEGIN -->
        <div
          style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <!-- Preview Text Spacing Hack : END -->
    
        <!--
                Set the email width. Defined in two places:
                1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
                2. MSO tags for Desktop Windows Outlook enforce a 680px width.
                Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
            -->
        <div style="max-width: 680px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
                <tr>
                <td>
                <![endif]-->
    
          <!-- Email Body : BEGIN -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">
  
            <!-- 1 Column Text + Button : BEGIN -->
            <tr>
              <td style="background-color: #ffffff;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                     
                       <h1
                style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
                Richiesta <b>Rottamazione</b> Interna</h1>
                
                    </td>
                  </tr> 
    
                </table>
                <div style="overflow-x:auto;">
      <table>
          <tr>
              <th>NCF</th>
              <th>Conto F.</th>
              <th>Codice</th>
              <th>Descrizione</th>
              <th>Q.tà</th>
              <th>Data</th>
              <th>Note Interne</th>
          </tr>
          ${tableMarkup}
          </table>
      </div>
              </td>
            </tr>
            
            
            </table>
      </center>
    </body>
    
    </html>
    `

        return markup;
    },
    getMailRottamazioneSingola: function(ncf) {


        var tableMarkup = `
        <tr>
        
        <td>${(ncf.codice_ncf.substr(-6))}</td>
        <td>${(ncf.conto_fornitore.toString().substr(-4))}</td>
        <td>${ncf.codice_prodotto}</td>
        <td>${ncf.descrizione}</td>
        <td>${ncf.quantità}</td>
        <td>${this.fixDateFornitore((JSON.stringify(ncf.data).replace(/[a-z]/gi, ' ').replace(/"/g, '')))}</td>
        <td>${ncf.note_interne}</td>
     
        </tr>
        `



        var markup = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <!-- Tell iOS not to automatically link certain text strings. -->
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
    <!--[if gte mso 9]>
      <xml>
          <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
  
    <!-- Web Font / @font-face : BEGIN -->
    <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
  
    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
    <!--[if mso]>
          <style>
              * {
                  font-family: sans-serif !important;
              }
          </style>
      <![endif]-->
  
    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
    <!--[if !mso]><!-->
    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
    <!--<![endif]-->
  
    <!-- Web Font / @font-face : END -->
  
    <!-- CSS Reset : BEGIN -->
    <style>
      /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
      :root {
        color-scheme: light;
        supported-color-schemes: light;
      }
  
      /* What it does: Remove spaces around the email design added by some email clients. */
      /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
      }
  
      /* What it does: Stops email clients resizing small text. */
      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
  
      /* What it does: Centers email on Android 4.4 */
      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }
  
      /* What it does: forces Samsung Android mail clients to use the entire viewport */
      #MessageViewBody,
      #MessageWebViewDiv {
        width: 100% !important;
      }
  
      /* What it does: Stops Outlook from adding extra spacing to tables. */
      table,
      td {
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
      }
  
      /* What it does: Fixes webkit padding issue. */
      table {
        border-spacing: 0 !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 0 auto !important;
      }
  
      /* What it does: Uses a better rendering method when resizing images in IE. */
      img {
        -ms-interpolation-mode: bicubic;
      }
  
      /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
      a {
        text-decoration: none;
      }
  
      /* What it does: A work-around for email clients meddling in triggered links. */
      a[x-apple-data-detectors],
      /* iOS */
      .unstyle-auto-detected-links a,
      .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
  
      /* What it does: Prevents Gmail from changing the text color in conversation threads. */
      .im {
        color: inherit !important;
      }
  
      /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
      .a6S {
        display: none !important;
        opacity: 0.01 !important;
      }
  
      /* If the above doesn't work, add a .g-img class to any image in question. */
      img.g-img+div {
        display: none !important;
      }
  
      /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
      /* Create one of these media queries for each additional viewport size you'd like to fix */
  
      /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
        u~div .email-container {
          min-width: 320px !important;
        }
      }
  
      /* iPhone 6, 6S, 7, 8, and X */
      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
        u~div .email-container {
          min-width: 375px !important;
        }
      }
  
      /* iPhone 6+, 7+, and 8+ */
      @media only screen and (min-device-width: 414px) {
        u~div .email-container {
          min-width: 414px !important;
        }
      }
    </style>
    <!-- CSS Reset : END -->
  
    <!-- Progressive Enhancements : BEGIN -->
    <style>
      /* What it does: Hover styles for buttons */
      .button-td,
      .button-a {
        transition: all 100ms ease-in;
      }
  
      .button-td-primary:hover,
      .button-a-primary:hover {
        background: #555555 !important;
        border-color: #555555 !important;
      }
  
      /* Media Queries */
      @media screen and (max-width: 480px) {
  
        /* What it does: Forces table cells into full-width rows. */
        .stack-column,
        .stack-column-center {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          direction: ltr !important;
        }
  
        /* And center justify these ones. */
        .stack-column-center {
          text-align: center !important;
        }
  
        /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
        .center-on-narrow {
          text-align: center !important;
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
          float: none !important;
        }
  
        table.center-on-narrow {
          display: inline-block !important;
        }
  
        /* What it does: Adjust typography on small screens to improve readability */
        .email-container p {
          font-size: 17px !important;
        }
      }
    </style>
    <!-- Progressive Enhancements : END -->
    <style>
    table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        border: 1px solid #ddd;
    }
    
    th,
    td {
        text-align: left;
        padding: 8px;
    }
    
    tr:nth-child(even) {
        background-color: #f2f2f2
    }
</style>
  </head>
  <!--
      The email background color (#222222) is defined in three places:
      1. body tag: for most email clients
      2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
      3. mso conditional: For Windows 10 Mail
  -->
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
    <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
      <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
      <tr>
      <td>
      <![endif]-->
  
      <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
      <!-- Preview Text Spacing Hack : BEGIN -->
      <div
        style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
      </div>
      <!-- Preview Text Spacing Hack : END -->
  
      <!--
              Set the email width. Defined in two places:
              1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
              2. MSO tags for Desktop Windows Outlook enforce a 680px width.
              Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
          -->
      <div style="max-width: 680px; margin: 0 auto;" class="email-container">
        <!--[if mso]>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
              <tr>
              <td>
              <![endif]-->
  
        <!-- Email Body : BEGIN -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">

          <!-- 1 Column Text + Button : BEGIN -->
          <tr>
            <td style="background-color: #ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                   
                     <h1
              style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
              Richiesta <b>Rottamazione</b> Interna</h1>
              
                  </td>
                </tr> 
  
              </table>
              <div style="overflow-x:auto;">
    <table>
        <tr>
        <th>NCF</th>
        <th>Conto F.</th>
        <th>Codice</th>
        <th>Descrizione</th>
        <th>Q.tà</th>
        <th>Data</th>
        <th>Note Interne</th>
        </tr>
        ${tableMarkup}
        </table>
    </div>
            </td>
          </tr>
          
          
          </table>
    </center>
  </body>
  
  </html>
  `

        return markup;
    },
    getMailResoSingolo: function(ncf) {


        var tableMarkup = `
    <tr>
    <td>${(ncf.codice_ncf.substr(-6))}</td>
    <td>${(ncf.conto_fornitore.toString().substr(-4))}</td>
    <td>${ncf.codice_prodotto}</td>
    <td>${ncf.descrizione}</td>
    <td>${ncf.quantità}</td>
    <td>${this.fixDateFornitore((JSON.stringify(ncf.data).replace(/[a-z]/gi, ' ').replace(/"/g, '')))}</td>
    <td>${ncf.note_interne.concat(' ', ncf.azione_comunicata)}</td>
    </tr>
    `



        var markup = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
<meta charset="utf-8"> <!-- utf-8 works for most cases -->
<meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
<meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
<meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
<!-- Tell iOS not to automatically link certain text strings. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->

<!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
<!--[if gte mso 9]>
  <xml>
      <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->

<!-- Web Font / @font-face : BEGIN -->
<!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->

<!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
<!--[if mso]>
      <style>
          * {
              font-family: sans-serif !important;
          }
      </style>
  <![endif]-->

<!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
<!--[if !mso]><!-->
<!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
<!--<![endif]-->

<!-- Web Font / @font-face : END -->

<!-- CSS Reset : BEGIN -->
<style>
  /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
  :root {
    color-scheme: light;
    supported-color-schemes: light;
  }

  /* What it does: Remove spaces around the email design added by some email clients. */
  /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
  html,
  body {
    margin: 0 auto !important;
    padding: 0 !important;
    height: 100% !important;
    width: 100% !important;
  }

  /* What it does: Stops email clients resizing small text. */
  * {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }

  /* What it does: Centers email on Android 4.4 */
  div[style*="margin: 16px 0"] {
    margin: 0 !important;
  }

  /* What it does: forces Samsung Android mail clients to use the entire viewport */
  #MessageViewBody,
  #MessageWebViewDiv {
    width: 100% !important;
  }

  /* What it does: Stops Outlook from adding extra spacing to tables. */
  table,
  td {
    mso-table-lspace: 0pt !important;
    mso-table-rspace: 0pt !important;
  }

  /* What it does: Fixes webkit padding issue. */
  table {
    border-spacing: 0 !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin: 0 auto !important;
  }

  /* What it does: Uses a better rendering method when resizing images in IE. */
  img {
    -ms-interpolation-mode: bicubic;
  }

  /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
  a {
    text-decoration: none;
  }

  /* What it does: A work-around for email clients meddling in triggered links. */
  a[x-apple-data-detectors],
  /* iOS */
  .unstyle-auto-detected-links a,
  .aBn {
    border-bottom: 0 !important;
    cursor: default !important;
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
  }

  /* What it does: Prevents Gmail from changing the text color in conversation threads. */
  .im {
    color: inherit !important;
  }

  /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
  .a6S {
    display: none !important;
    opacity: 0.01 !important;
  }

  /* If the above doesn't work, add a .g-img class to any image in question. */
  img.g-img+div {
    display: none !important;
  }

  /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
  /* Create one of these media queries for each additional viewport size you'd like to fix */

  /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
  @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
    u~div .email-container {
      min-width: 320px !important;
    }
  }

  /* iPhone 6, 6S, 7, 8, and X */
  @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
    u~div .email-container {
      min-width: 375px !important;
    }
  }

  /* iPhone 6+, 7+, and 8+ */
  @media only screen and (min-device-width: 414px) {
    u~div .email-container {
      min-width: 414px !important;
    }
  }
</style>
<!-- CSS Reset : END -->

<!-- Progressive Enhancements : BEGIN -->
<style>
  /* What it does: Hover styles for buttons */
  .button-td,
  .button-a {
    transition: all 100ms ease-in;
  }

  .button-td-primary:hover,
  .button-a-primary:hover {
    background: #555555 !important;
    border-color: #555555 !important;
  }

  /* Media Queries */
  @media screen and (max-width: 480px) {

    /* What it does: Forces table cells into full-width rows. */
    .stack-column,
    .stack-column-center {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      direction: ltr !important;
    }

    /* And center justify these ones. */
    .stack-column-center {
      text-align: center !important;
    }

    /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
    .center-on-narrow {
      text-align: center !important;
      display: block !important;
      margin-left: auto !important;
      margin-right: auto !important;
      float: none !important;
    }

    table.center-on-narrow {
      display: inline-block !important;
    }

    /* What it does: Adjust typography on small screens to improve readability */
    .email-container p {
      font-size: 17px !important;
    }
  }
</style>
<!-- Progressive Enhancements : END -->
<style>
table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    border: 1px solid #ddd;
}

th,
td {
    text-align: left;
    padding: 8px;
}

tr:nth-child(even) {
    background-color: #f2f2f2
}
</style>
</head>
<!--
  The email background color (#222222) is defined in three places:
  1. body tag: for most email clients
  2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
  3. mso conditional: For Windows 10 Mail
-->

<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
<center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
  <!--[if mso | IE]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
  <tr>
  <td>
  <![endif]-->

  <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
  <!-- Preview Text Spacing Hack : BEGIN -->
  <div
    style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  <!-- Preview Text Spacing Hack : END -->

  <!--
          Set the email width. Defined in two places:
          1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
          2. MSO tags for Desktop Windows Outlook enforce a 680px width.
          Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
      -->
  <div style="max-width: 680px; margin: 0 auto;" class="email-container">
    <!--[if mso]>
          <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
          <tr>
          <td>
          <![endif]-->

    <!-- Email Body : BEGIN -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">

      <!-- 1 Column Text + Button : BEGIN -->
      <tr>
        <td style="background-color: #ffffff;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
               
                 <h1
          style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
          Richiesta <b>Reso</b> Fornitore</h1>
          
              </td>
            </tr> 

          </table>
          <div style="overflow-x:auto;">
<table>
    <tr>
    <th>NCF</th>
    <th>Conto F.</th>
    <th>Codice</th>
    <th>Descrizione</th>
    <th>Q.tà</th>
    <th>Data</th>
    <th>Note Interne</th>
    </tr>
    ${tableMarkup}
    </table>
</div>
        </td>
      </tr>
      
      
      </table>
</center>
</body>

</html>
`

        return markup;
    },
    getMailResiMultipli: function(elencoNCF) {

        var tableMarkup = ``;

        elencoNCF.forEach(ncf => {

            var tempMarkup = `
        <tr>
        <td>${ncf.codice_ncf.substr(-6)}</td>
        <td>${ncf.conto_fornitore.toString().substr(-4)}</td>
        <td>${ncf.codice_prodotto}</td>
        <td>${ncf.descrizione}</td>
        <td>${ncf.quantità}</td>
        <td>${this.fixDateFornitore(JSON.stringify(ncf.data).replace(/[a-z]/gi, " ").replace(/"/g, ""))}</td>
        <td>${ncf.note_interne.concat(' ', ncf.azione_comunicata)}</td>
        </tr>
        `;
            tableMarkup += tempMarkup;
        });


        var markup = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <!-- Tell iOS not to automatically link certain text strings. -->
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
    <!--[if gte mso 9]>
      <xml>
          <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
  
    <!-- Web Font / @font-face : BEGIN -->
    <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->
  
    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
    <!--[if mso]>
          <style>
              * {
                  font-family: sans-serif !important;
              }
          </style>
      <![endif]-->
  
    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
    <!--[if !mso]><!-->
    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
    <!--<![endif]-->
  
    <!-- Web Font / @font-face : END -->
  
    <!-- CSS Reset : BEGIN -->
    <style>
      /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */
      :root {
        color-scheme: light;
        supported-color-schemes: light;
      }
  
      /* What it does: Remove spaces around the email design added by some email clients. */
      /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
      html,
      body {
        margin: 0 auto !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
      }
  
      /* What it does: Stops email clients resizing small text. */
      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
  
      /* What it does: Centers email on Android 4.4 */
      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }
  
      /* What it does: forces Samsung Android mail clients to use the entire viewport */
      #MessageViewBody,
      #MessageWebViewDiv {
        width: 100% !important;
      }
  
      /* What it does: Stops Outlook from adding extra spacing to tables. */
      table,
      td {
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
      }
  
      /* What it does: Fixes webkit padding issue. */
      table {
        border-spacing: 0 !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 0 auto !important;
      }
  
      /* What it does: Uses a better rendering method when resizing images in IE. */
      img {
        -ms-interpolation-mode: bicubic;
      }
  
      /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
      a {
        text-decoration: none;
      }
  
      /* What it does: A work-around for email clients meddling in triggered links. */
      a[x-apple-data-detectors],
      /* iOS */
      .unstyle-auto-detected-links a,
      .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
  
      /* What it does: Prevents Gmail from changing the text color in conversation threads. */
      .im {
        color: inherit !important;
      }
  
      /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
      .a6S {
        display: none !important;
        opacity: 0.01 !important;
      }
  
      /* If the above doesn't work, add a .g-img class to any image in question. */
      img.g-img+div {
        display: none !important;
      }
  
      /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
      /* Create one of these media queries for each additional viewport size you'd like to fix */
  
      /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
        u~div .email-container {
          min-width: 320px !important;
        }
      }
  
      /* iPhone 6, 6S, 7, 8, and X */
      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
        u~div .email-container {
          min-width: 375px !important;
        }
      }
  
      /* iPhone 6+, 7+, and 8+ */
      @media only screen and (min-device-width: 414px) {
        u~div .email-container {
          min-width: 414px !important;
        }
      }
    </style>
    <!-- CSS Reset : END -->
  
    <!-- Progressive Enhancements : BEGIN -->
    <style>
      /* What it does: Hover styles for buttons */
      .button-td,
      .button-a {
        transition: all 100ms ease-in;
      }
  
      .button-td-primary:hover,
      .button-a-primary:hover {
        background: #555555 !important;
        border-color: #555555 !important;
      }
  
      /* Media Queries */
      @media screen and (max-width: 480px) {
  
        /* What it does: Forces table cells into full-width rows. */
        .stack-column,
        .stack-column-center {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          direction: ltr !important;
        }
  
        /* And center justify these ones. */
        .stack-column-center {
          text-align: center !important;
        }
  
        /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
        .center-on-narrow {
          text-align: center !important;
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
          float: none !important;
        }
  
        table.center-on-narrow {
          display: inline-block !important;
        }
  
        /* What it does: Adjust typography on small screens to improve readability */
        .email-container p {
          font-size: 17px !important;
        }
      }
    </style>
    <!-- Progressive Enhancements : END -->
    <style>
    table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        border: 1px solid #ddd;
    }
    
    th,
    td {
        text-align: left;
        padding: 8px;
    }
    
    tr:nth-child(even) {
        background-color: #f2f2f2
    }
</style>
  </head>
  <!--
      The email background color (#222222) is defined in three places:
      1. body tag: for most email clients
      2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
      3. mso conditional: For Windows 10 Mail
  -->
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: white;">
    <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: white;">
      <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #222222;">
      <tr>
      <td>
      <![endif]-->
  
      <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
      <!-- Preview Text Spacing Hack : BEGIN -->
      <div
        style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
      </div>
      <!-- Preview Text Spacing Hack : END -->
  
      <!--
              Set the email width. Defined in two places:
              1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
              2. MSO tags for Desktop Windows Outlook enforce a 680px width.
              Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
          -->
      <div style="max-width: 680px; margin: 0 auto;" class="email-container">
        <!--[if mso]>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="680">
              <tr>
              <td>
              <![endif]-->
  
        <!-- Email Body : BEGIN -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;" id="tabellaPrincipale">

          <!-- 1 Column Text + Button : BEGIN -->
          <tr>
            <td style="background-color: #ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                   
                     <h1
              style="margin: 0px 0 0px; font-size: 20px; line-height: 25px; color: #333333; font-weight: normal;">
              Richiesta <b>Reso</b> Fornitore</h1>
              
                  </td>
                </tr> 
  
              </table>
              <div style="overflow-x:auto;">
    <table>
        <tr>
        <th>NCF</th>
        <th>Conto F.</th>
        <th>Codice</th>
        <th>Descrizione</th>
        <th>Q.tà</th>
        <th>Data</th>
        <th>Note Interne</th>
        </tr>
        ${tableMarkup}
        </table>
    </div>
            </td>
          </tr>
          
          
          </table>
    </center>
  </body>
  
  </html>
  `

        return markup;
    },
}