var express = require('express');
var path = require('path');
var formidable = require('formidable');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var fs = require('fs');
var session = require('express-session');
var mysql = require('mysql');
var conexiune = mysql.createConnection({
	host:"eu-cdbr-west-03.cleardb.net",
	user:"bb3aceb5f21b91",
	password:"ac838a4c",
	database:"heroku_1798208f3443111",
	multipleStatements: true
});

conexiune.connect(function(err){
	if (err) throw err;
	console.log("Conectat la baza de date");
});

var app=express();
const http=require('http')
const socket = require('socket.io');
const server = new http.createServer(app);  
var  io = socket(server)
io = io.listen(server);
io.on("connection", function (socket)  {  
    console.log("Conectare");
	socket.on('disconnect', function() {conexiune_index=null;console.log('Deconectare')});
});
app.set('view engine', 'ejs');
console.log(__dirname);
console.log(path.join(__dirname, "Resurse"));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "Resurse")));
app.use(express.static(path.join(__dirname, "Poze_uploadate")));
app.use(session({
	secret: 'abcdefg',
	resave: true,
	saveUninitialized: false
}));


//--------------------------------------gets---------------------------------------
app.get('/', function(req, res){
	conexiune.query("select * from anunt; " +
					"select distinct Marime_Ax from anunt order by 1; " + 
					"select distinct Categorie from anunt; " + 
					"select Taguri from anunt;" + 
					"select max(Pret) Pret from anunt;",
	function(err, rezultat, campuri){
		if(err) throw err;
		
		var tags = "";
		for (let i of rezultat[3]) {
			tags += i.Taguri + ", ";
		}
		var t = [];
		t = tags.split(", ");
		
		res.render('pagini/index',{	anunturi:rezultat[0],
									marimi:rezultat[1],
									categ:rezultat[2],
									taguri:t,
									pretMax:rezultat[4],
									utilizator:req.session.utilizator});
	});
});

app.get('/logout', function(req, res){
	console.log("logout");
	req.session.destroy();
	res.redirect("/index");
});

app.get('/anunt_:nr', function(req, res) {
	var idAnunt=req.params.nr;
	conexiune.query(`select * from anunt join user using (Username) where idAnunt =${idAnunt}`, function(err, rezultat, campuri){
		if(err) throw err;
		res.render('pagini/pagina_anunt',{ anunt_unic:rezultat[0],utilizator:req.session.utilizator});
	});
});

app.get('/index', function(req, res){
	conexiune.query("select * from anunt; " +
					"select distinct Marime_Ax from anunt order by 1; " + 
					"select distinct Categorie from anunt; " + 
					"select Taguri from anunt;" + 
					"select max(Pret) Pret from anunt;",
	function(err, rezultat, campuri){
		if(err) throw err;
		
		var tags = "";
		for (let i of rezultat[3]) {
			tags += i.Taguri + ", ";
		}
		var t = [];
		t = tags.split(", ");
		
		res.render('pagini/index',{	anunturi:rezultat[0],
									marimi:rezultat[1],
									categ:rezultat[2],
									taguri:t,
									pretMax:rezultat[4],
									utilizator:req.session.utilizator});
	});
});

app.get('/utilizatori', function(req, res){
	
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
		conexiune.query("select * from user",function(err, rezultat, campuri){
			if(err) throw err;
			res.render('pagini/utilizatori',{useri:rezultat, utilizator:req.session.utilizator});
		});
	} else{
		res.render('pagini/404',{mesaj:"Nu aveti acces", utilizator:req.session.utilizator});
	}

});

app.get('/*', function(req, res){	

	res.render('pagini/'+req.url, {utilizator:req.session.utilizator, port:s_port},function(err, rezRandare){
		console.log(req.url);
		if(err) {
			if(err.message.includes("Failed to lookup view"))
				res.status(404).render('pagini/404',{utilizator:req.session.utilizator});
			else
				throw err;
		}
		else{
			res.send(rezRandare);
		}
	});

});

app.post('/chat', function(req, res) {

	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		console.log("primit mesaj")
		io.sockets.emit('mesaj_nou', fields.nume, fields.emoji, fields.mesaj);
		
		res.send("ok");
	});
	
});

//-------------------------------------posts---------------------------------------
//-------------------------------------inreg-----------------------------------------------------
var parolaServer="stportraits";
app.post("/inregistrare",function(req, res){
	var username;
	var path_imagine;
	var formular= formidable.IncomingForm()
	//nr ordine: 4
	formular.parse(req, function(err, campuriText, campuriFisier){
		var eroare="";
		if(campuriText.username==""){
			eroare+="Username nesetat<br>";
		}
		if(campuriText.nume==""){
			eroare+="Nume nesetat<br>";
		}
		if(campuriText.prenume==""){
			eroare+="Prenume nesetat<br>";
		}
		if(campuriText.parola==""){
			eroare+="Parola nesetat<br>";
		}
		if(campuriText.email==""){
			eroare+="Email nesetat<br>";
		}
		if(!campuriText.email.match(new RegExp("^[a-zA-Z0-9\\-_]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,3}$"))) {
			eroare+="Email incorect<br>";
		}

		if (eroare == "") {
			unescapedusername = campuriText.username
			unescapedmail = campuriText.email
			
			var parolaCriptata=mysql.escape(crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"));
			campuriText.username=mysql.escape(campuriText.username)
			campuriText.nume=mysql.escape(campuriText.nume)
			campuriText.prenume=mysql.escape(campuriText.prenume)
			campuriText.email=mysql.escape(campuriText.email)
			campuriText.imagine=mysql.escape(campuriText.imagine)
		
			var user_existent = `select Username from user where username=${campuriText.username}`
			conexiune.query(user_existent, function(err, rez, campuri){
				if (err) {
					console.log(err);
					throw err;
				}
				if (rez.length != 0){
					eroare+="Username deja existent<br>";
					res.render("pagini/inregistrare",{err:eroare,raspuns:"Completati corect campurile"});
				} else {
						
					var comanda=`insert into user (Username,Nume,Prenume,Mail,Parola,Imagine_user) values( ${campuriText.username},${campuriText.nume},${campuriText.prenume},${campuriText.email},${parolaCriptata},'${path_imagine}')`;
					conexiune.query(comanda, function(err, rez, campuri){
						if (err) {
							console.log(err);
							throw err;
						}
						trimiteMail(unescapedusername, unescapedmail);
						// res.render("pagini/inregistrare",{err:"",raspuns:"Date introduse"});
						res.redirect("login");
					})
						
				}
			})

		} else {
			res.render("pagini/inregistrare",{err:eroare,raspuns:"Completati corect campurile"});
		}

	})

	//nr ordine: 1
	formular.on("field", function(name,field){
		if (name == 'username')
			if(!(field.includes('\\') || field.includes('/')))
				username=field;
			else {
				username="defaultFolder";
			}
	});
	
	//nr ordine: 2
	formular.on("fileBegin", function(name,campFisier){
		console.log("inceput upload: ", campFisier);
		if(campFisier && campFisier.name!=""){
			var cale=__dirname+"/Poze_uploadate/"+username
			if (!fs.existsSync(cale))
				fs.mkdirSync(cale);
			campFisier.path=cale+"/"+campFisier.name;
			path_imagine = username+"/"+campFisier.name;
		}
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
});

async function trimiteMail(username, email){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{ 
			user:"stportraits00@gmail.com",
			pass:"tehniciweb99"
		},
		tls:{
			rejectUnauthorized:false
		}
	});

	await transp.sendMail({
		from:"stportraits00@gmail.com",
		to:email,
		subject:"Buna," + username,
		text:"Bine ai venit in comunitatea STportratits",
		html:`<h1>Buna, ${username}!</h1><p><span style='font-size:28px; background-color: grey;'>Bine ai venit</span> in comunitatea STportraits!</p>`,
	})
	console.log("trimis mail");
}

async function trimiteMailblocat(nume,prenume,email){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{ 
			user:"stportraits00@gmail.com",
			pass:"tehniciweb99"
		},
		tls:{
			rejectUnauthorized:false
		}
	});

	await transp.sendMail({
		from:"stportraits00@gmail.com",
		to:email,
		subject:"Buna!",
		text:"Nu ai fost cuminte, "+nume+" "+prenume+", asa ca te-am blocat!",
		html:`<p>Nu ai fost cuminte,${nume} ${prenume}, asa ca te-am blocat!</p>`,
	})
	console.log("trimis mail blocat");
}

//-------------------------------------anunt-----------------------------------------------------
var parolaServer="stportraits";
app.post("/publica_anunt",function(req, res){
	var utilizator = req.session.utilizator;
	var path_imagine;
	var formular= formidable.IncomingForm()
	
	//nr ordine: 4
	formular.parse(req, function(err, campuriText, campuriFisier){
		console.log("parsare")
		var eroare="";
		if(campuriText.denumire==""){
			eroare+="Denumire nesetat<br>";
		}
		if(campuriText.descriere==""){
			eroare+="Descriere nesetat<br>";
		}
		if(campuriText.categorie==""){
			eroare+="Categorie nesetat<br>";
		}
		if(campuriText.pret==""){
			eroare+="Pret nesetat<br>";
		}
		if(campuriText.marime==""){
			eroare+="Marime nesetat<br>";
		}
		if(campuriText.tag==""){
			eroare+="Tag nesetat<br>";
		}
		if(campuriText.rama==""){
			eroare+="Rama nesetat<br>";
		}
		if(campuriText.timp==""){
			eroare+="Timp nesetat<br>";
		}
		if(campuriText.despre==""){
			eroare+="Despre nesetat<br>";
		}

		if (eroare == "") {
			
			campuriText.denumire=mysql.escape(campuriText.denumire)
			campuriText.descriere=mysql.escape(campuriText.descriere)
			campuriText.categorie=mysql.escape(campuriText.categorie)
			campuriText.pret=mysql.escape(campuriText.pret)
			campuriText.imagine=mysql.escape(campuriText.imagine)
			campuriText.marime=mysql.escape(campuriText.marime)
			campuriText.tag=mysql.escape(campuriText.tag)
			if (campuriText.rama == 'on') {
				campuriText.rama='1';
			} else {
				campuriText.rama='0';
			}
			campuriText.timp=mysql.escape(campuriText.timp)
			campuriText.despre=mysql.escape(campuriText.despre)

			var comanda=`insert into anunt (Denumire,Descriere,Imagine,Categorie,Pret,Data_publicare,Marime_Ax,Taguri,Rama,Timp_realiare,Despre_vanzator,Username) values( ${campuriText.denumire},${campuriText.descriere},'/Imagini/Anunt/${path_imagine}',${campuriText.categorie},${campuriText.pret},CURDATE(),${campuriText.marime},${campuriText.tag},'${campuriText.rama}',${campuriText.timp},${campuriText.despre},'${utilizator.username}')`;
			console.log(comanda);
			conexiune.query(comanda, function(err, rez, campuri){
				if (err) {
					console.log(err);
					throw err;
				}
				res.redirect("/index");
			})

		} else {
			res.render("pagini/publica_anunt",{err:eroare,raspuns:"Completati corect campurile"});
		}
	
	})
	
	//nr ordine: 2
	formular.on("fileBegin", function(name,campFisier){
		console.log("inceput upload: ", campFisier);
		if(campFisier && campFisier.name!=""){
			var cale=__dirname+"/Resurse/Imagini/Anunt"
			if (!fs.existsSync(cale))
				fs.mkdirSync(cale);
			campFisier.path=cale+"/"+campFisier.name;
			path_imagine = campFisier.name;
		}
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
});

//--------------------------------------login si logout---------------------------------
app.post("/login",function(req, res){
	
	var formular= formidable.IncomingForm()
	
	formular.parse(req, function(err, campuriText, campuriFisier){
		var parolaCriptata=mysql.escape(crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"));
		unescapedUser = campuriText.username;
		campuriText.username=mysql.escape(campuriText.username);

		conexiune.query(`select * from anunt; select distinct Marime_Ax from anunt order by 1; select distinct Categorie from anunt; select Taguri from anunt;select max(Pret) Pret from anunt;select Rol, Mail, Nume, Prenume, Blocat, Imagine_user from user where Username=${campuriText.username} and Parola=${parolaCriptata};`,
			function(err, rezultat, campuri){
				if(err) throw err;
				
					var tags = "";
					for (let i of rezultat[3]) {
						tags += i.Taguri + ", ";
					}
					var t = [];
					t = tags.split(", ");

				const newLocal = 1;
				if(rezultat[5] && rezultat[5].length==1 && rezultat[5][0].Blocat == 1){

					res.render('pagini/login',{	mesaj:"Esti blocat!"});

				} else if(rezultat[5] && rezultat[5].length==1 ){

					req.session.utilizator={
						rol:rezultat[5][0].Rol,
						username:unescapedUser,
						nume:rezultat[5][0].Nume,
						prenume:rezultat[5][0].Prenume,
						blocat:rezultat[5][0].Blocat,
						mail:rezultat[5][0].Mail,
						imagine_u:rezultat[5][0].Imagine_user
					}

					// res.render("pagini/index", {utilizator:req.session.utilizator,
					// 							anunturi:rezultat[0],
					// 							marimi:rezultat[1],
					// 							categ:rezultat[2],
					// 							taguri:t,
					// 							pretMax:rezultat[4]});
					res.redirect("index");
				} else {
					res.render('pagini/login',{	mesaj:"Username sau parola incorecta!"});
				}
				
		});
	});
});

//------------------------------------------------useri blocare -------------------------------------------
app.post("/blocheaza_utilizator",function(req, res){
	
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
		var formular= formidable.IncomingForm()
	
		formular.parse(req, function(err, campuriText, campuriFisier){
			var blocat = Math.abs(parseInt(campuriText.blocat)-1);

			var comanda=`update user set Blocat = ${blocat} where Username = '${campuriText.username}'`;
			conexiune.query(comanda, function(err, rez, campuri){
				if (err) {
					console.log(err);
					throw err;
				}
				if (blocat==1){
					trimiteMailblocat(campuriText.nume, campuriText.prenume, campuriText.email);
				}
			});
		});
	}
	res.redirect("/utilizatori");
	
});


s_port=process.env.PORT || 5000
server.listen(s_port)
