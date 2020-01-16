let mapDevice = $("#map_device");
let mqttClient = "";
let deviceData = [];
let choosenDeviceId = "";
let mqttHost = "ws://" + window.location.host;

const REQUEST_COORDINATION_CODE = "1";
let subscribeTopic = [];

let googleLocationMarkerList = [];
let alertLocationList = [];
let googleAlertLocationMarkerList = [];

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
    let hanoi = {lat: 21.027, lng: 105.83};
    map = new google.maps.Map(
        mapDevice[0], {zoom: 10, center: hanoi});
}

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
let textviewDeviceNote = $("#device_note");
let textviewDeviceLat = $("#device_lat");
let textviewDeviceLon = $("#device_lon");
let textviewDeviceHotline = $("#device_hotline");
let formState = "None";

buttonDeviceAdd.on("click",function(event){
    event.preventDefault();
    console.log("Button Add clicked");
    labelDeviceDetail.html("Pair Device");
    buttonSubmitDeviceForm.html("Pair");
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
    subscribeTopic.forEach(topic => {
        mqttClient.unsubscribe(topic,function(err){
            console.log(err);
        })
    });
    formState = "None";
    let searchData = {};
    $.ajax({
        url: 'find_all_device',
        type: 'POST',
        data: searchData,
        success: function (data) {
            tableDevice.empty();
            deviceData = data;
            console.log(deviceData);
            data.forEach(device => {
                let stringTopic = "fireValue/"+device.deviceId;
                mqttClient.subscribe(stringTopic);
                subscribeTopic.push(stringTopic);
                tableDevice.append("<tr onclick=\"chooseDevice(this.id)\" id=\""+device.deviceId+"\"><td>"+device.deviceId+"</td><td>"+device.state+"</td><td id=\"fireValue_"+device.deviceId+"\">"+device.status+"</td></tr>")
            });
        },
        error: function (e) {
            console.log(e.message);
        }
    });
});

function chooseDevice(deviceId){
    choosenDeviceId = deviceId;
    $.ajax({
        url: 'find_device',
        type: 'POST',
        data: {deviceId: deviceId},
        success: function (device) {
            console.log(device);
            if(device[0]!=undefined){
                textviewDeviceId.val(deviceId);
                textviewDeviceLocation.val(device[0].location);
                textviewDeviceNote.val(device[0].note);
                textviewDeviceHotline.val(device[0].hotline);
                if(device[0].lat!=undefined){
                    textviewDeviceLat.val(device[0].lat);
                }
                if(device[0].lon!=undefined){
                    textviewDeviceLon.val(device[0].lon);
                }
            }else{
               alert("Device not exist in database");
            }
        },
        error: function (e) {
            console.log(e.message);
        }
    });
}

buttonDeviceTest.on("click",function(event){
    event.preventDefault();
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
            deviceId: textviewDeviceId.val(),
            note: textviewDeviceNote.val(),
            lat: textviewDeviceLat.val(),
            lon: textviewDeviceLon.val()
        }
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
    let stringTopic = "configurationDevice/"+choosenDeviceId+"/coordinate";
    mqttClient.subscribe(stringTopic);
    subscribeTopic.push(stringTopic);
    mqttClient.publish("configurationDevice/"+choosenDeviceId+"/request",REQUEST_COORDINATION_CODE);
});

function startConnect() {
    mqttClient = mqtt.connect(mqttHost,{
        connectTimeout: 60000,
        will: {
            topic: 'connectionDevice',
            payload: '0',
            qos: 1,
            retain: true
        },
        resubscribe: true
    });

    mqttClient.on("connect",function () {
        console.log("Connected");
    });
    mqttClient.on("message",function(topic,message,packet){
        let splitTopic = topic.split('/');
        let topicName = splitTopic[0];
        let deviceId = splitTopic[1];
        if(topicName==="fireValue"){
            let fireValueId = topic.replace('/','_');
            let fireValue = message.toString().split("_")[1];
            $("#"+fireValueId).html(fireValue);
            if(fireValue==1){
                if(confirm("Device with id " + deviceId + " has fire alerted at level 1")){
                    $.ajax({
                        url: 'find_device',
                        type: 'POST',
                        data: {deviceId: deviceId},
                        success: function (device) {
                            console.log(device);
                            if(device[0]!=undefined){
                                textviewDeviceId.val(deviceId);
                                textviewDeviceLocation.val(device[0].location);
                                textviewDeviceNote.val(device[0].note);
                                textviewDeviceHotline.val(device[0].hotline);
                                if(device[0].lat!=undefined){
                                    textviewDeviceLat.val(device[0].lat);
                                }
                                if(device[0].lon!=undefined){
                                    textviewDeviceLon.val(device[0].lon);
                                }
                                if(device[0].lat!=undefined&&device[0].lon!=undefined){
                                    let alertMarker = new google.maps.Marker({
                                        position: new google.maps.LatLng(device[0].lat,device[0].lon),
                                        title: "Location: " + device[0].location + " and hotline: " + device[0].hotline,
                                        map: map
                                    });
                                    googleAlertLocationMarkerList.push(alertMarker);
                                    googleLocationMarkerList.push(device);
                                }
                            }else{
                               alert("Device not exist in database");
                            }
                        },
                        error: function (e) {
                            console.log(e.message);
                        }
                    });
                }else{
                    console.log("Cancel");
                }
            }else if(fireValue==2){
                if(confirm("Device with id " + deviceId + " has fire alerted at level 2")){
                    $.ajax({
                        url: 'find_device',
                        type: 'POST',
                        data: {deviceId: deviceId},
                        success: function (device) {
                            console.log(device);
                            if(device[0]!=undefined){
                                textviewDeviceId.val(deviceId);
                                textviewDeviceLocation.val(device[0].location);
                                textviewDeviceNote.val(device[0].note);
                                textviewDeviceHotline.val(device[0].hotline);
                                if(device[0].lat!=undefined){
                                    textviewDeviceLat.val(device[0].lat);
                                }
                                if(device[0].lon!=undefined){
                                    textviewDeviceLon.val(device[0].lon);
                                }
                                if(device[0].lat!=undefined&&device[0].lon!=undefined){
                                    let alertMarker = new google.maps.Marker({
                                        position: new google.maps.LatLng(device[0].lat,device[0].lon),
                                        title: "Location: " + device[0].location + " and hotline: " + device[0].hotline,
                                        map: map
                                    });
                                    googleAlertLocationMarkerList.push(alertMarker);
                                    googleLocationMarkerList.push(device);
                                }
                            }else{
                               alert("Device not exist in database");
                            }
                        },
                        error: function (e) {
                            console.log(e.message);
                        }
                    });
                }else{
                    console.log("Cancel");
                }
            }
        }else if(topicName==="configurationDevice"){
            let option = splitTopic[2];
            if(option==="coordinate"){
                if(choosenDeviceId===deviceId){
                    let deviceLat = Number.parseFloat(message.toString().split(":")[0]);
                    let deviceLon = Number.parseFloat(message.toString().split(":")[1]);
                    textviewDeviceLat.val(deviceLat);
                    textviewDeviceLon.val(deviceLon);
                    let deviceCoordinate = {lat: deviceLat, lng: deviceLon};
                    let marker = new google.maps.Marker({position: deviceCoordinate, map: map});
                }
            }
        }
    });
    mqttClient.on("close",function(){
        console.log("Disconnect with broker");
        alert("Disconnect from Broker, reload page");
    })
}