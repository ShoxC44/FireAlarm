let mapDevice = $("#map_device");

function initMap(){
    var uluru = {lat: -25.344, lng: 131.036};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        mapDevice[0], {zoom: 4, center: uluru});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: uluru, map: map});
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

buttonDeviceAdd.on("click",function(event){
    event.preventDefault();

    
});