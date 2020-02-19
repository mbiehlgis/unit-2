var map;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [36.20, 138.25],
        zoom: 2,
        minZoom: 5,
        maxBounds: [(25.2, 125.7), (45.7, 148.54)]
    });//^different optional map parameters 

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    	subdomains: 'abcd',
    	maxZoom: 19
    }).addTo(map);

    //call getData function
    getData();
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

function drawCities(response){
    //creates marker options
    var geojsonMarkerOptions = {
        radius: 7,
        fillColor: "#95003A",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map

    //adding circle markers to map
    L.geoJson(response, {
        pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
}

//function to retrieve the data and place it on the map
function getData(){
    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){
            drawCities(response);
            //createLegend(response);
            //createSequenceUI(response);
        });
};

$(document).ready(createMap);
