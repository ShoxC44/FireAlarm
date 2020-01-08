const mongoose = require("mongoose");
mongoose.pluralize(null);

let option = {
    "authSource": "admin",
    "useNewUrlParser": true, 
    "useUnifiedTopology": true,
    "user": "root",
    "pass": "123456a@"
}

const databaseConnection = mongoose.createConnection("mongodb://127.0.0.1:27017/firealarm",option,function(err){
    if(err) console.log("Can not connect to mongodb");
    else console.log("Connect Success");
});

const Schema = mongoose.Schema;

let accountSchema = new Schema({
    name: Schema.Types.String,
    password: Schema.Types.String,
    state: Schema.Types.Boolean,
    permission: Schema.Types.Number
});

let Account = databaseConnection.model('account',accountSchema);
let testAccount = new Account({name: "testaccount",password:"123456a@",state:true,permission:1});
testAccount.save(function(err){
    if (err) {
        console.log("Error");
        return handleError(err);
    }
});

let deviceSchema = new Schema({
    deviceId: Schema.Types.String,
    state: Schema.Types.Boolean,
    location: Schema.Types.String,
    note: Schema.Types.String,
    lat: Schema.Types.Number,
    lon: Schema.Types.Number
});

let Device = databaseConnection.model('device',deviceSchema);
// let testDevice = new Device({hostDeviceId:mongoose.Types.ObjectId(),state:true,location:"B1234"});
// testDevice.save(function(err){
//     if(err) {
//         console.log("Error");
//         return handleError(err);
//     }
// });

let fireValueSchema = new Schema({
    deviceId: Schema.Types.String,
    value: Schema.Types.Number,
    time: Schema.Types.Date,
    detail: Schema.Types.String
});

let FireValue = databaseConnection.model('fire_value',fireValueSchema);

