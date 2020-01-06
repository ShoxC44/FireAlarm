let mapDevice = $("#map_device");
let mqttClient = "";
let deviceData = [];
let choosenDeviceId = "";

const REQUEST_COORDINATION_CODE = "1";

$().ready(function() {
    $.ajax({
        url: 'request_mqtt_token',
        type: 'POST',
        data: 'string',
        success: function (data) {
            console.log(data);
        },
        error: function (e) {
            console.log(e.message);
        }
    });
    startConnect();
});

let map = "";
function initMap(){
    var hanoi = {lat: 21.027, lng: 105.83};
    // The map, centered at Uluru
    map = new google.maps.Map(
        mapDevice[0], {zoom: 10, center: hanoi});
}

// Su dung mapbox
// mapboxgl.accessToken = 'pk.eyJ1Ijoic3VnYTA0MDQ5NiIsImEiOiJjazR3bWZmN3U0OGZyM2xxODYwdzRpdmtoIn0.pp2brYim_yIbSXEapFGjsg';
// var map = new mapboxgl.Map({
//     container: 'map_device',
//     style: 'mapbox://styles/mapbox/streets-v11'
// });

let buttonDeviceReload = $("#button_device_reload");
let buttonDeviceTest = $("#button_device_test");
let buttonDeviceConfig = $("#button_device_config");
let buttonDeviceAdd = $("#button_device_add");
let labelDeviceDetail = $("#label_device_detail");
let tableDevice = $("#table_device");
let buttonSubmitDeviceForm = $("#btn_device_submit");
let buttonGetDeviceLocation = $("#btn_device_reloadLocation");
let textviewDeviceLocation = $("#device_location");
let textviewDeviceId = $("#device_id");
let textviewDeviceHint = $("#device_hint");
let textviewDeviceLat = $("#device_lat");
let textviewDeviceLon = $("#device_lon");
let formState = "None";

buttonDeviceAdd.on("click",function(event){
    event.preventDefault();
    console.log("Button Add clicked");
    labelDeviceDetail.html("Add Device");
    buttonSubmitDeviceForm.html("Add");
    formState = "Add";
});

buttonDeviceConfig.on("click",function(event){
    event.preventDefault();
    console.log("Button Config clicked");
    labelDeviceDetail.html("Config Device");
    buttonSubmitDeviceForm.html("Submit");
    formState = "Config";
});

buttonDeviceReload.on("click",function(event){
    event.preventDefault();
    console.log("Button Reload clicked");
    formState = "None";
    let searchData = {};
    $.ajax({
        url: 'find_device',
        type: 'POST',
        data: searchData,
        success: function (data) {
            tableDevice.empty();
            deviceData = data;
            console.log(deviceData);
            data.forEach(device => {
                mqttClient.subscribe("fireValue/"+device._id);
                tableDevice.append("<tr onclick=\"chooseDevice(this.id)\" id=\""+device._id+"\"><td>"+device._id+"</td><td>"+device.state+"</td><td id=\"fireValue_"+device._id+"\"></td></tr>")
            });
        },
        error: function (e) {
            console.log(e.message);
        }
    });
});

function chooseDevice(deviceId){
    console.log("Click");
    console.log(deviceId);
    choosenDeviceId = deviceId;
    deviceData.forEach(device => {
        if(device._id === deviceId){
            textviewDeviceId.val(deviceId);
            textviewDeviceLocation.val(device.location);
            textviewDeviceHint.val(device.hint);
        }
    });
}

buttonDeviceTest.on("click",function(event){
    event.preventDefault();
    console.log("Button Test clicked");
    formState = "None";
    if(choosenDeviceId!=""){
        $.ajax({
            url: 'test_device',
            type: 'POST',
            data: {deviceId: choosenDeviceId},
            success: function (data) {
                if(data){
                    alert("Device Connected");
                }else{
                    alert("Device not Connected");
                }
            },
            error: function (e) {
                console.log(e.message);
            }
        });
    }else{
        alert("Choose one device to test");
    }
});

buttonSubmitDeviceForm.on("click",function(event){
    event.preventDefault();
    if(formState==="None"){
        alert("Choose a funtion for submitted form");
    }else if(formState==="Add"){
        let deviceData = {
            id: textviewDeviceId.val(),
            location: textviewDeviceLocation.val(),
            hint: textviewDeviceHint.val(),
            lat: textviewDeviceLat.val(),
            lon: textviewDeviceLon.val()
        } 
        console.log(deviceData);
        $.ajax({
            url: 'add_device',
            type: 'POST',
            data: deviceData,
            success: function (data) {
                console.log(data);
            },
            error: function (e) {
                console.log(e.message);
            }
        });
    }
});

buttonGetDeviceLocation.on("click",function(event){
    event.preventDefault();
    mqttClient.subscribe("configurationDevice/"+choosenDeviceId+"/coordinate");
    let mqttMessage = new Paho.MQTT.Message(REQUEST_COORDINATION_CODE);
    mqttMessage.destinationName = "configurationDevice/"+choosenDeviceId+"/request";
    mqttClient.send(mqttMessage);
});

function startConnect() {
    // Generate a random mqttClient ID
    let clientID = "clientID-" + parseInt(Math.random() * 100);

    // Initialize new Paho mqttClient connection
    mqttClient = new Paho.MQTT.Client("127.0.0.1", Number("3030"), clientID);

    // Set callback handlers
    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    // Connect the mqttClient, if successful, call onConnect function
    mqttClient.connect({ 
        onSuccess: onConnect,
    });
}

function onConnect() {
    console.log("Connected");
}

function onConnectionLost(responseObject) {
    console.log("Connection Lost");
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.destinationName);
    let splitDestinationName = message.destinationName.split('/');
    let topicName = splitDestinationName[0];
    if(topicName==="fireValue"){
        let fireValueId = message.destinationName.replace('/','_');
        $("#"+fireValueId).html(message.payloadString);
    }else if(topicName==="configurationDevice"){
        let deviceId = splitDestinationName[1];
        let option = splitDestinationName[2];
        if(option==="coordinate"){
            if(choosenDeviceId===deviceId){
                let deviceLat = Number.parseFloat(message.payloadString.split(":")[0]);
                let deviceLon = Number.parseFloat(message.payloadString.split(":")[1]);
                textviewDeviceLat.val(deviceLat);
                textviewDeviceLon.val(deviceLon);
                let deviceCoordinate = {lat: deviceLat, lng: deviceLon};
                var marker = new google.maps.Marker({position: deviceCoordinate, map: map});
            }
        }
    }
    
}

// Called when the disconnection button is pressed
function startDisconnect() {
    mqttClient.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}