window.onload = function() {


    var theme_b = document.getElementById("light-dark");
    document.getElementsByTagName("main")[0].className = localStorage.getItem("theme");

    theme_b.onclick = function() {
        var element = document.getElementsByTagName("main");
        if (element[0].className == "light") {
            element[0].className = "dark";
            localStorage.setItem("theme","dark");
            document.getElementById("light-dark").innerHTML = '<i class="material-icons">brightness_low</i>';
        } else {
            element[0].className = "light";
            localStorage.setItem("theme","light");
            document.getElementById("light-dark").innerHTML = '<i class="material-icons">brightness_2</i>';
        }
    
    }
    

    
    var listRama = document.getElementsByClassName("cu_rama");
    for (let elem of listRama) {
        if (elem.innerHTML == 0)
            elem.innerHTML = "Nu";
        else 
            elem.innerHTML = "Da";
    }

    var zile = ["Luni","Marti","Miercuri","Joi","Vineri","Sambata","Duminica"];
    var zile_en = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    var luni = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
    var luni_en = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    var data_publicare = document.getElementsByClassName("data_publicare");
    for (let elem of data_publicare) {
        var d = elem.innerHTML.slice(0,3);
        for (let i = 0; i < zile_en.length; i++) {
            if (d == zile_en[i])     d = zile[i];
        }       

        var l = elem.innerHTML.slice(4,7);
        for (let i = 0; i < luni_en.length; i++) {
            if (l == luni_en[i])     {l = luni[i]; var l_index = i + 1;}     
        }

        var dnr = elem.innerHTML.slice(8,10);
        var an = elem.innerHTML.slice(11,15);
        elem.innerHTML = "<time datetime=\"" + an + "-" + l_index + "-" + dnr + "\">" +  
                dnr + "/" + l + "/" + an + " (" + d + ") </time>";
    } 


    

    var invalid = 0;
    document.getElementById("i_text").onblur = function() {
        
        for (let i of document.getElementById("i_text").value) {
            if ((i >= "a" && i <= "z") || (i >= "A" && i <= "Z"))
                invalid = 1;
        }
        if (invalid == 0 && document.getElementById("i_text").value != "") {
            document.getElementById("i_text").style.borderColor = "Red";
            document.getElementById("i_text").value = ""; 
            document.getElementById("invalid").innerHTML = " Invalid input!";
            document.getElementById("invalid").style.color = "Red";
        } else {
            document.getElementById("i_text").style.borderColor = "grey";
            document.getElementById("invalid").innerHTML = "";
            invalid = 0;
        }
        
    }



    document.getElementById("filtreaza").onclick = function() {
        
        var cu_rama = document.getElementById("i_rama").checked;
        var pretMax = parseInt(document.getElementById("i_pret").value);
        var den = document.getElementById("i_text").value;
        var radios = document.getElementsByName("gr_radio");
        var categ = "";
        for (let rad of radios) {
            if (rad.checked) {
                categ = rad.value;
                break;
            }
        }
        var tipRama = document.getElementById("i_tip").value;
        var taguri = document.getElementById("i_tag").options;
        var tag = [];
        for (let opt of taguri) {
            if (opt.selected)
                tag.push(opt.value);
        }
        var texta = document.getElementById("i_textarea").value;

        var anunturi = document.querySelectorAll("#an article");
        for (var anunt of anunturi) {

            anunt.style.display = "block";
            
            var rama = anunt.getElementsByClassName("cu_rama")[0];
            var pret = parseInt(anunt.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]);
            var denumire = anunt.getElementsByClassName("denumire")[0].innerHTML;
            var categorie = anunt.getElementsByClassName("categorie")[0].innerHTML.split(" ")[2];
            var tip = anunt.getElementsByClassName("marime")[0].innerHTML[1];
            var taguri = anunt.getElementsByClassName("taguri")[0].innerHTML;
            var textaUser = anunt.getElementsByClassName("username")[0].innerHTML.split(" ")[2];

            var conditie1 = (cu_rama && rama.innerHTML=="Nu") || (!cu_rama && rama.innerHTML == "Da"); 
            var conditie2 = (pret > pretMax);
            var conditie3 = (denumire.toLowerCase().indexOf(den.toLowerCase()) == -1);
            if (den == "")  conditie3 = 0;
            var conditie4 = (categorie.toLowerCase() != categ.toLowerCase());
            if (categ == "Toate")   conditie4 = 0;
            var conditie5 = (tipRama != tip)
            if (tipRama == "0") conditie5 = 0;
            var conditie6 = 1;
            for (let i of tag) {
                if (taguri.indexOf(i) != -1)
                    conditie6 = 0;
            }
            if (tag[0] == "toate")  conditie6 = 0;
            var conditie7 = (texta.indexOf(textaUser) == -1);
            if (texta == "")    conditie7 = 0;

            var conditieTotala = (conditie1 || conditie2 || conditie3 || conditie4 || conditie5 || conditie6 || conditie7);
            
            if (conditieTotala)  {
                anunt.style.display = "none";
            } else if (invalid) {
                anunt.style.display = "block";
            }
        }
        document.getElementById("pretTotal").innerHTML = "";
    
    }




    document.getElementById("reset").onclick = function() {
        
        var anunturi = document.querySelectorAll("#an article");
        for (var anunt of anunturi){
            anunt.style.display = "block";
        }

        document.getElementById("i_rama").checked = 1;
        document.getElementById("i_pret").value = document.getElementById("i_pret").max;
        document.getElementById("o_pret").innerHTML = document.getElementById("i_pret").max;
        document.getElementById("i_text").value = "";
        var radios = document.getElementsByName("gr_radio");
        for (let rad of radios) {
            if (rad.value == "Toate") {
                rad.checked = 1;
            } else {
                rad.checked = 0;
            }
        }
        document.getElementById("i_tip").value = 0;
        var taguri = document.getElementById("i_tag").options;
        for (let opt of taguri) {
            if (opt.value == "toate")
                opt.selected = 1;
            else opt.selected = 0;
        }
        document.getElementById("i_textarea").value = "";
    
        document.getElementById("pretTotal").innerHTML = "";
    
    }


    

    document.getElementById("asc").onclick = function() {

        var anunturi = document.querySelectorAll("#an article");

        var v_anunturi = Array.from(anunturi);
        v_anunturi.sort(function(a,b) {
            if (parseInt(a.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]) == parseInt(b.getElementsByClassName("pret")[0].innerHTML.split(" ")[0])) {
                return b.getElementsByClassName("denumire")[0].innerHTML.localeCompare(a.getElementsByClassName("denumire")[0].innerHTML);
            }
            return parseInt(a.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]) - parseInt(b.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]);
        });

        for(let i=0; i< v_anunturi.length;i++){
			v_anunturi[i].style.order = i;
        }
        
        document.getElementById("pretTotal").innerHTML = "";
    
    }




    document.getElementById("desc").onclick = function() {
        
        var anunturi = document.querySelectorAll("#an article");

        var v_anunturi = Array.from(anunturi);
        v_anunturi.sort(function(a,b) {
            if (a.getElementsByClassName("denumire")[0].innerHTML == b.getElementsByClassName("denumire")[0].innerHTML) {
                return a.getElementsByClassName("denumire")[0].innerHTML.localeCompare(b.getElementsByClassName("denumire")[0].innerHTML);
            }
            return parseInt(a.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]) - parseInt(b.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]);
        });
        
        for(let i=0; i < v_anunturi.length;i++){
            v_anunturi[i].style.order = v_anunturi.length - i - 1;
        }
        
        document.getElementById("pretTotal").innerHTML = "";

    }




    var anunturi = document.querySelectorAll("#an article");
    for (var anunt of anunturi)
        anunt.style.display = "block";

    document.getElementById("calcul").onclick = function() {
        
        var sum = 0;
        var anunturi = document.querySelectorAll("#an article");
        for (var anunt of anunturi){
            if (anunt.style.display == "block")
                sum += parseInt(anunt.getElementsByClassName("pret")[0].innerHTML.split(" ")[0]);
        }            
        document.getElementById("pretTotal").innerHTML = "Suma preturi: " + sum + " lei";

    }

    var filtre =document.querySelectorAll("#filtre > *:not(h3)");
    for (let el of filtre) {
            el.style.display = "none";
    }
    document.getElementById("filter_display").onclick = function() {
        var filtre =document.querySelectorAll("#filtre > *:not(h3)");
        for (let el of filtre) {
            if (el.style.display != "none")
                el.style.display = "none";
            else el.style.display = "inline-block";
        }
    }



    var linkuriMeniu = document.querySelectorAll("ul.menu>li");
    var locatie = window.location.pathname;
    
    if (locatie == "/galerie_imagini" || locatie == "/video")
        linkuriMeniu[1].style.backgroundColor = "grey";
    else if (locatie == "/" || locatie == "/index" || locatie == "/index#anunturi" || locatie == "/index#despre")
        linkuriMeniu[0].style.backgroundColor = "grey";

    linkuriMeniu[0].onclick = function () {
        document.getElementById("ch-menu").checked = false;
    }
    

    var linkuriInterne=document.querySelectorAll("ul.menu a[href*='#']");
    for (var lnk of linkuriInterne ) {
        var paghref = lnk.href.substring(lnk.href.lastIndexOf("/"),lnk.href.lastIndexOf("#"));
        var locationhref = window.location.href;
        var paglocation = locationhref.substring(locationhref.lastIndexOf("/"),locationhref.lastIndexOf("#"));
        
        if(paglocation == paghref)
            lnk.onclick = clickLink;
    }
    var idIntervalPlimbare = -1;

    function clickLink(ev) { 
        
        ev.preventDefault();
        clearInterval(idIntervalPlimbare);
        var lnk = ev.target;
        var coordScroll;
        var poz = lnk.href.indexOf("#");
        var idElemScroll = lnk.href.substring(poz + 1);
        if(idElemScroll == "") {
            coordScroll = 0;
        } else {
            coordScroll = getOffsetTop(document.getElementById(idElemScroll));
        }
        var distanta=coordScroll-document.documentElement.scrollTop;
        pas = distanta < 0 ? -20 : 20;
        idIntervalPlimbare=setInterval(plimba,10,pas,coordScroll,lnk.href.substring(lnk.href.lastIndexOf("#") + 1));
    
    }
        
    function getOffsetTop(elem) {
        
        var rez = elem.offsetTop;
        while (elem.offsetParent && elem.offsetParent != document.body) {
            elem = elem.offsetParent;
            rez += elem.offsetTop;
        } return rez;
    
    }
        
    function plimba(pas,coordScroll, href) {
        
        scrollVechi=document.documentElement.scrollTop;
        document.documentElement.scrollTop+=pas
        if (pas>0 && coordScroll <= document.documentElement.scrollTop || 
            pas<0 && coordScroll >= document.documentElement.scrollTop || 
            scrollVechi == document.documentElement.scrollTop) {
            clearInterval(idIntervalPlimbare);
            window.location.hash = href;
        }
    }


}