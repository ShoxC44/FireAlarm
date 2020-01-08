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
const mqttServer = new mosca.Server(moscaSettings);
mqttServer.attachHttpServer(server);

//Khoi tao session
const session = require("express-session")({
	secret:"Secret make a women women",
	resave: true,
    saveUninitialized: true,
    maxAge: 3600*1000
});
app.use(session);

//Khoi tao socket.io
// const iosession = require("express-socket.io-session");

// const io = require('socket.io')(server);
// io.use(iosession(session,{
// 	autoSave:true
// }));

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
            req.session.userId = result._id;
            console.log(req.session);
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

app.get("/report_graph",function(req,res){
    if(checkSignIn(req,res)){
        res.render("pages/graph_page",{username:req.session.username});
    };
})

app.get("/logout",function(req,res){
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

//Xu li API call
app.post("/request_mqtt_token",function(req,res){
    if(checkSignIn(req,res)){
        res.status(200);
        return res.send("Hello");
    };
});

app.post("/add_device",function(req,res){
    if(checkSignIn){
        let deviceId = req.body.deviceId;
        database.findDeviceByDeviceId(deviceId,function(result){
            if(result[0]!=undefined){
                let device = result[0];
                device.pair = true;
                if(req.body.lat){
                    device.lat = req.body.lat;
                }
                if(req.body.lon){
                    device.lon = req.body.lon;
                }
                if(req.body.note){
                    device.note = req.body.note;
                }
                device.save(function(err,device){
                    if(err) console.log(err);
                    else {
                        res.status(200);
                        res.send("Pair Success");
                    }
                });
            }
        })
    }
});

app.post("/find_all_device",function(req,res){
    if(checkSignIn){
        database.findDevice({},function(result){
            res.status(200);
                return res.send(result);
        });
    }
});

app.post("/find_device",function(req,res){
    if(checkSignIn){
        database.findDevice(req.body,function(result){
            res.status(200);
                return res.send(result);
        });
    }
});

app.post("/test_device",function(req,res){
    if(checkSignIn){
        let testDeviceId = req.body.deviceId;
        database.findDeviceByDeviceId(testDeviceId,function(result){
            res.status(200);
            return res.send(result.state);
        })
    }
});

//Phuc vu thu vien
// app.get("iot_config_page.js",function(req,res){
//     if(checkSignIn(req,res)){

//     }
// });

mqttServer.on("published",function(packet,client){
    let topic = packet.topic.toString();
    let topicSplited = topic.split("/");
    let topicName = topicSplited[0];
    let deviceId = topicSplited[1];
    let data = packet.payload.toString();
    if(topicName==="fire_value"){
        let dataSplited = data.split("_");
        let dataTime = dataSplited[0];
        let dataValue = dataSplited[1];
        let fireValue = {
            deviceId: deviceId,
            value: dataValue,
            time: dataTime
        }
        database.addFireValue(fireValue,function(result){
            console.log(result.value);
        });
    }else if(topicName==="connectionDevice"){
        if(data.charAt(0)==='0'){
            database.findDeviceByDeviceId(deviceId,function(result){
                if(result[0]!=undefined){
                    console.log(result[0]);
                    let device = result[0];
                    device.state = false;
                    device.save();
                }else{
                    console.log("No device with id: " + deviceId);
                }
            });
        }else if(data.charAt(0)==='1'){
            database.findDeviceByDeviceId(deviceId,function(result){
                if(result[0]!=undefined){
                    console.log(result[0]);
                        let device = result[0];
                        device.state = true;
                        device.save();
                }else{
                    let deviceData = data.split(":");
                    let deviceLocation = deviceData[1];
                    let deviceLat = deviceData[2];
                    let deviceLon = deviceData[3];
                    let newDevice = {
                        deviceId: deviceId,
                        state: true,
                        location: deviceLocation,
                        note: "",
                        lat: deviceLat,
                        lon: deviceLon,
                        pair:false
                    }
                    database.addDevice(newDevice,function(result){
                        if(result) console.log("Device "+deviceId+" added");
                    });
                }
            });
        }
    }
});

//Xu li tin hieu socket
// io.on("connection",function(socket){
//     let socketSession = socket.handshake.session;
//     let user = socketSession.user;
//     if(!user){
//         socket.disconnect();
//     }
// });

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