

function checkform() {
    console.log("Prova");
    if(document.controlloNonConformità.codiceArticoloTextField.value == "Prova") {
        alert("please enter start_date");
    }
}

/*
Aggiorna la select in relazione al valore del campo "codiceArticoloTextField"
Si attiva ogni volta che il campo "codiceArticoloTextField" viene modificato
*/

function updateSelect() {

    var x = document.getElementById("codiceArticoloTextField");

    if (x.value == "Prova"){
        alert("Inserisci un valore corretto");
    }
    
    var selection = document.getElementById("cars");
    var opt = document.createElement('option');
    opt.value = x.value;
    opt.innerHTML = x.value;
    cars.appendChild(opt);
 }

 function generateRandomID() {
    var newID = Date.now() + Math.random();
    var x = document.getElementById("labelIDValue");
    x.innerHTML = newID.toFixed(0);
 }


function getCurrentDate() {
    var timeElapsed = Date.now();
    var now = new Date (timeElapsed);
    var x = document.getElementById("labelDataValue");
    x.innerHTML = now.toUTCString();
}
