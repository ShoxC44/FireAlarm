//Khoi tao express module
const express = require("express");
const app = express();

app.use(express.static("views"));
app.use(express.static("support_libraries"));

// //Khoi tao server
const server = app.listen(3030,function(){
	let port = server.address().port;
	console.log("Server running at port "+port);
});

//Khoi tao database
const database = require("./helper_module/database");

//Khoi tao mosca
const mosca = require("mosca");
const moscaSettings = { 
    port: 1883,
    bundle: true,
    static: './'
}

//Khoi tao session
const session = require("express-session")({
	secret:"Secret make a women women",
	resave: true,
    saveUninitialized: true,
    maxAge: 3600*1000
});
app.use(session);

//Khoi tao socket.io
const iosession = require("express-socket.io-session");

const io = require('socket.io')(server);
io.use(iosession(session,{
	autoSave:true
}));

const mqttServer = new mosca.Server(moscaSettings);
// mqttServer.attachHttpServer(server);

//Khoi tao view engine thanh ejs
const ejs = require("ejs");
app.set("view engine","ejs");

//Khoi tao module body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Phân luồng
app.get("/",function(req,res){
    res.render("pages/login");
});

app.post("/login",function(req,res){
    let loginInformation = req.body;
	database.findAccount({name:loginInformation.username,password:loginInformation.password},function(result){
        console.log(result);
        if(result){
            req.session.user = true;
            req.session.username = result.name;
            req.session.state = result.state;
            res.redirect("/home");
        }else{
            res.redirect("/");
        }
    });
});

app.get("/home",function(req,res){
    if(checkSignIn(req,res)){
        res.render("pages/home_page",{username:req.session.username});
    };
});

app.get('/logout',function(req,res){
	let user = req.session.user;
	let name = req.session.username;
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Logout from " + user + " " + name);
			res.redirect('/');
		}
	});
});

//Phuc vu thu vien
// app.get("iot_config_page.js",function(req,res){
//     if(checkSignIn(req,res)){

//     }
// });

mqttServer.on("published",function(packet,client){
    console.log(packet.topic.toString());
    console.log(packet.payload.toString());
    let topic = packet.topic.toString();
    let topicSplited = topic.split("/");
    let topicName = topicSplited[0];
    let arduinoId = topicSplited[1];
    let data = packet.payload.toString();
    let dataSplited = data.split("_");
    let dataTime = dataSplited[0];
    let dataValue = dataSplited[1];
    if(topicName==="fire_value"){
        let fireValue = {
            deviceId: arduinoId,
            value: dataValue,
            time: dataTime
        }
        database.addFireValue(fireValue,function(result){
            console.log(result.value);
        });
    }
});

//Xu li tin hieu socket
io.on("connection",function(socket){
    let socketSession = socket.handshake.session;
    let user = socketSession.user;
    if(!user){
        socket.disconnect();
    }
});

//Các hàm khi kết thúc chương trình
process.on("SIGTERM", function () {
    endProgram();
});

process.on("SIGINT", function () {
    endProgram();
});

function checkSignIn(req,res){
	if(req.session.user){
		return true;
	}else{
		console.log("Bad behavior from user to access page");
        res.redirect("/");
        return false;
	}
}

async function endProgram(){
    process.exit(0);
}