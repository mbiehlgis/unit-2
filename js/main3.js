var map;
var minValue;

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

function pointToLayer(feature, latlng){
    //creates marker options
    var attribute = "Pop_1980";
    var geojsonMarkerOptions = {
        //radius: 7,
        fillColor: "#95003A",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    //create a Leaflet GeoJSON layer and add it to the map

    L.geoJson(feature, {
        pointToLayer: function (feature, latlng){
            console.log(feature.properties)
            var attValue = Number(feature.properties[attribute]);

            //check if attributes are correct
            console.log(feature.properties, attValue);

            //check here
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circles
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
}

function createPropSymbols(data, map){
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

function calcMinValue(data){
    //console.log(data)
    var allValues = []; //create empty array to store values in

    for(var prefecture of data.features){
        for(var year = 1980; year <= 2010; year += 5){
            var value = prefecture.properties["Pop_" + String(year)];
            allValues.push(value);
        }
        // console.log(value)
    }
    var minValue = Math.min(...allValues)
    // console.log(minValue);
    return minValue;
}

function calcPropRadius(attValue) {
    // console.log(attValue);
     //constant factor adjusts symbol sizes evenly
     var minRadius = 5;

     //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
     // console.log(radius)
     return radius;
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){
            minValue = calcMinValue(response);
            createPropSymbols(response);
            //createLegend(response);
            //createSequenceUI(response);

        });
};

$(document).ready(createMap);
