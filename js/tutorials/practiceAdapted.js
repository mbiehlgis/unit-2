var mymap = L.map('mapid').setView([39.5, -105], 3).setMinZoom(3);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

Esri_WorldImagery.addTo(mymap);


function getData(){
    //load the data
    $.getJSON("data/MegaCities.geojson", function(response){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response).addTo(mymap);
        });
};

function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(mymap);

    //call getData function
    getData();
};

L.geoJSON(response).addTo(mymap); //l.geoJSON creates a geojson layer and adds it to the map

$(document).ready(createMap);

// // code below adds points to a layer at any instance of a latlng with a circle marker
// var geojsonMarkerOptions = {
//     radius: 10,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };
// //^ these all are qualities for the marker
// L.geoJSON(geojsonFeature, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).addTo(mymap);
//
// //onEachFeature will apply a function or action to each object before adding it to a geoJSON layer
// function onEachFeature(feature, layer) {
//     // does this feature have a property named popupContent?
//     if (feature.properties && feature.properties.popupContent) {
//         layer.bindPopup(feature.properties.popupContent);
//     }
// }
//
// L.geoJSON(geojsonFeature, {
//     onEachFeature: onEachFeature
// }).addTo(mymap);
