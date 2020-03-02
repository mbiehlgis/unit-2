var map;
var minValue;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [36.20, 138.25],
        zoom: 2,
        minZoom: 5,
        maxBounds: [(25.2, 125.7), (45.7, 148.54)],
        pitch: 60,
        bearing: -60
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

// function onEachFeature(feature, layer) {
//     //no property named popupContent; instead, create html string with all properties
//     var popupContent = "";
//     if (feature.properties) {
//         //loop to add feature property names and values to html string
//         for (var property in feature.properties){
//             popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
//         }
//         layer.bindPopup(popupContent);
//     };
// };

function calcPropRadius(attValue) {
    // console.log(attValue);
     //constant factor adjusts symbol sizes evenly
     var minRadius = 5;

     //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
     // console.log(radius)
     return radius;
};

function pointToLayer(feature, latlng, attributes){
    //creates marker options
    var attribute = attributes[0];
    console.log(attribute);
    var geojsonMarkerOptions = {
        //radius: 7,
        fillColor: "#95003A",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    //create a Leaflet GeoJSON layer and add it to the map
    var attValue = Number(feature.properties[attribute]);

    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    var popupContent = "<p><b>Prefecture:</b> " + feature.properties.Prefecture + "</p>";

    var year = attribute.split("_")[1];
        popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    layer.bindPopup(popupContent);

    return layer;
};

//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
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

//Step 1: Create new sequence controls
function createSequenceControls(){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="step" id="reverse">Reverse</button>');
    $('#panel').append('<button class="step" id="forward">Forward</button>')
    //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.step').click(function(){
            //get the old index value
            var index = $('.range-slider').val();

            //Step 6: increment or decrement depending on button clicked
            if ($(this).attr('id') == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if ($(this).attr('id') == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //Step 8: update slider
            $('.range-slider').val(index);

            //Called in both step button and slider event listener handlers
           //Step 9: pass new attribute to update symbols
           updatePropSymbols(attributes[index]);
        });
        //Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Prefecture:</b> " + props.Prefecture + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
    };
})};
};



function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){
            var attributes = processData(response);
            minValue = calcMinValue(response);
            createPropSymbols(response,attributes);
            //createLegend(response);
            createSequenceControls(response);
        });
};


$(document).ready(createMap);
