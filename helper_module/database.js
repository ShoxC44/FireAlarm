const mongoose = require("mongoose");
mongoose.pluralize(null);

let option = {
    "authSource": "admin",
    "useNewUrlParser": true, 
    "useUnifiedTopology": true,
    "user": "root",
    "pass": "123456a@"
}

const databaseConnection = mongoose.createConnection("mongodb://127.0.0.1:27017/iottest",option,function(err){
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

let account = databaseConnection.model('account',accountSchema);

exports.findAccount = function(searchOption,callback){
    account.findOne(searchOption,function(err,result){
        if (err) return handleError(err);
        callback(result);
    });
}