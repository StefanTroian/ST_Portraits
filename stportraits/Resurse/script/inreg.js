function validateForm() {
    var p1 = document.getElementById("parola").value;
    var p2 = document.getElementById("reparola").value;
    var email_verif = document.getElementById("email").value;
    var reze = email_verif.match(new RegExp("^[a-zA-Z0-9\\-_]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,3}$"))
    var rezp = (p1 == p2)
    
    if (rezp == false) {
        alert("Parolele nu coincid")
    }
    if (!reze) {
        alert("Email incorect")
    }

    return rezp && reze
}