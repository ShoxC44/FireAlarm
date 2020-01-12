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
    else console.log("Connect MongoDB Success");
});
const Schema = mongoose.Schema;

let accountSchema = new Schema({
    name: Schema.Types.String,
    password: Schema.Types.String,
    state: Schema.Types.Boolean,
    permission: Schema.Types.Number
});

let Account = databaseConnection.model('account',accountSchema);

exports.mongoose = mongoose;

exports.findAccount = function(searchOption,callback){
    Account.findOne(searchOption,function(err,result){
        if (err) return handleError(err);
        else{
            callback(result);
        }
    });
}

let fireValueSchema = new Schema({
    deviceId: Schema.Types.String,
    value: Schema.Types.Number,
    time: Schema.Types.Date,
    detail: Schema.Types.String
});

let FireValue = databaseConnection.model('fire_value',fireValueSchema);

exports.addFireValue = function(fireValue,callback){
    let addFireValue = new FireValue({
        deviceId: fireValue.deviceId,
        value: fireValue.value,
        time: fireValue.time,
        detail: fireValue.detail
    });
    addFireValue.save(function(err,value){
        if(err){
            console.log(err);
            callback(false);
            return handleError(err);
        }else {
            callback(true);
        }
    });
}

let deviceSchema = new Schema({
    deviceId: Schema.Types.String,
    state: Schema.Types.Boolean,
    location: Schema.Types.String,
    note: Schema.Types.String,
    lat: Schema.Types.Number,
    lon: Schema.Types.Number,
    pair: Schema.Types.Boolean,
    status: Schema.Types.Number,
    hotline: Schema.Types.String
});

let Device = databaseConnection.model('device',deviceSchema);

exports.addDevice = function(deviceData,callback){
    let device = new Device({deviceId:deviceData.deviceId,
                            state: deviceData.state,
                            location: deviceData.location,
                            note: deviceData.note,
                            lat: deviceData.lat,
                            lon: deviceData.lon,
                            pair: deviceData.pair,
                            status: deviceData.status,
                            hotline: deviceData.hotline});
    device.save(function(err){
        if(err){
            console.log(err);
            callback(false);
            return handleError(err);
        }else{
            callback(true);
        }
    });
}

exports.findDevice = function(searchOption,callback){
    Device.find(searchOption,function(err,result){
        if(err){
            console.log(err);
        }else callback(result);
    });
}

// exports.findDeviceByUserId = function(userId,callback){
//     Device.find({user: mongoose.Types.ObjectId(userId)},function(err,result){
//         if(err){
//             console.log(err);
//         }else callback(result);
//     });
// }

exports.findDeviceByDeviceId = function(deviceId,callback){
    Device.find({deviceId: deviceId},function(err,result){
        if(err){
            console.log(err);
        }else callback(result);
    });
}

exports.findDeviceByMongoId = function(deviceId,callback){
    Device.find({_id: mongoose.Types.ObjectId(deviceId)},function(err,result){
        if(err){
            console.log(err);
        }else callback(result);
    });
}
