var map;
var minValue;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [36.20, 138.25],
        zoom: 2,
        minZoom: 4.7,
        maxBounds: [(25.2, 115.7), (45.7, 155.54)],
        pitch: 60,
        bearing: -60
    });//^different optional map parameters

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    	subdomains: 'abcd',
    	maxZoom: 30
    }).addTo(map);

    //call getData function
    getData();
};

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
function createSequenceControls(attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    // Ex3.6: set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        console.log(index);
        updatePropSymbols(attributes[index]);
    });
    $('#panel').append('<button class="step" id="reverse">Reverse</button>');//appending button classes to panel
    $('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="img/left_arrow.svg">'); // linking each button to the appropriate svg
    $('#forward').html('<img src="img/right_arrow.svg">');
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
           console.log(attributes)
            updatePropSymbols(attributes[index]); //calling updatePropSymbols function and can only pass in attributes since it was defined in the callback ajax function
        });

//Step 10: Resize proportional symbols according to new attribute values
// updates prop symbols to be in sync with slider position
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
    var attributes = []; //setting the attributes array to prepare the values needed for the other functions within the getData function

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){ // looping through values with an index of "Pop" and pushing them to the array if they have a value greater than 0
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes; //returns attributes array to be used in callback
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){
            var attributes = processData(response); //variable created within this function, I could have also made attributes a global variable at the beginning
            minValue = calcMinValue(response);
            createPropSymbols(response,attributes);
            //createLegend(response);
            createSequenceControls(attributes);
        });
};

$(document).ready(createMap);
