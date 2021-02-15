

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