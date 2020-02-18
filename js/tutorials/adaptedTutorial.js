/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [20, 0],
        zoom: 2,
        minZoom: 1.5
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MegaCities.geojson", function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
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

            // applying popup function to geojson data
           //  L.geoJson(response, {
           //     onEachFeature: onEachFeature
           // }).addTo(map);
        });
};

$(document).ready(createMap);
