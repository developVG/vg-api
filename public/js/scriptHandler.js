

function checkform() {
    console.log("Prova");
    if (document.controlloNonConformità.codiceArticoloTextField.value == "Prova") {
        alert("please enter start_date");
    }
}

function updateSelect() {
    var x = document.getElementById("codiceArticoloTextField");

    if (x.value == "Prova") {
        alert("Inserisci un valore corretto");
    }

    var selection = document.getElementById("cars");
    var opt = document.createElement('option');
    opt.value = x.value;
    opt.innerHTML = x.value;
    cars.appendChild(opt);
}

function fornitoreExtraUpdate() {
    var x = document.getElementById("fornitoreLabel");
    var y = document.getElementById("fornitoreExtraDiv");

    if (x.value == "Altro") {
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }
}

function submitData() {
    var nomeOperatore = document.getElementById("nomeOperatoreID").innerHTML;
    console.log(nomeOperatore);
}

function submitReport() {
    //Non-NULL fields
    var codiceNCF = document.getElementById("codiceNCFID").value;
    //
    if (codiceNCF == "") {
        alert("Inserire codice NCF!");
    } else {
        document.getElementById("submitButton").setAttribute("disabled", "")
    }
}

$(document).ready(function () {
    validate();
    $('#codiceNCFID').change(validate);

});


/*
Aggiungere tutti gli altri campi obbligatori
*/
function validate() {
    if ($('#codiceNCFID').val().length > 0) {
        console.log("CODICE NCF INSERITO");
        $("#submitButton").prop("disabled", false);
    }
    else {
        console.log("CODICE NCF NULLO");
        $("#submitButton").prop('disabled', true);
    }
}
