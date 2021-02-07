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