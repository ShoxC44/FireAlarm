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

exports.mongoose = mongoose;

exports.findAccount = function(searchOption,callback){
    Account.findOne(searchOption,function(err,result){
        if (err) return handleError(err);
        callback(result);
    });
}

let fireValueSchema = new Schema({
    deviceId: Schema.Types.String,
    value: Schema.Types.Number,
    time: Schema.Types.Date
});

let FireValue = databaseConnection.model('fire_value',fireValueSchema);

exports.addFireValue = function(fireValue,callback){
    let addFireValue = new FireValue({
        deviceId: fireValue.deviceId,
        value: fireValue.value,
        time: fireValue.time
    });
    addFireValue.save(function(err,value){
        if(err){
            console.log(err);
        }else callback(value);
    });
}

let deviceSchema = new Schema({
    deviceId: Schema.Types.String,
    state: Schema.Types.Boolean,
    location: Schema.Types.String,
    user: Schema.Types.ObjectId,
    hint: Schema.Types.String
});

let Device = databaseConnection.model('device',deviceSchema);

exports.addDevice = function(userId,deviceData,callback){
    let device = new Device({deviceId:deviceData.deviceId,
                            state: false,
                            location: deviceData.location,
                            user: userId,
                            hint: deviceData.hint});
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

exports.findDeviceByUserId = function(userId,callback){
    Device.find({user: mongoose.Types.ObjectId(userId)},function(err,result){
        if(err){
            console.log(err);
        }else callback(result);
    });
}
