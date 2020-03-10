var map;
var minValue;
var attributes = []; //making a global attribute variable with an empty array
var dataStats = {}; //making a global variable list to append max, mean, and min values to

//function to instantiate the Leaflet map
function createMap(){

    map = L.map('mapid', {
        center: [36.20, 138.25],
        zoom: 2,
        minZoom: 4.4,
        maxZoom: 8,
        maxBounds: [(25.2, 115.7), (45.7, 155.54)],
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    	subdomains: 'abcd',
    	maxZoom: 30
    }).addTo(map);
    map.zoomControl.setPosition('bottomright');
    getData();
};


function calcPropRadius(attValue) {

     var minRadius = 4.5;

                  //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

     return radius;
};


function createPropSymbols(data, attributes){

    L.geoJson(data, {

        pointToLayer: function(feature, latlng){

            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function calcStats(data){

    var allValues = []; //create empty array to store values in

    for(var prefecture of data.features){

        for(var year = 1980; year <= 2010; year += 5){

            var value = prefecture.properties["Pop_" + String(year)];

            allValues.push(value);
        }
    }
    var minValue = Math.min(...allValues);

    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
    console.log(dataStats) //checking if list is being added to

    return minValue;
}

function createSequenceControls(attributes){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {

            var container = L.DomUtil.create('div', 'sequence-control-container');

            $(container).append('<input class="range-slider" type="range">');

            $(container).append('<button class="step" id="reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward">Forward</button>');

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());

    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        //console.log(index);
        updatePropSymbols(attributes[index]);
    });

    //$('#panel').append('<button class="step" id="reverse">Reverse</button>');//appending button classes to panel
    //$('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="img/left_arrow.svg">'); // linking each button to the appropriate svg
    $('#forward').html('<img src="img/right_arrow.svg">');

    $('.step').click(function(){

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
            var popupContent = createPopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();

            popup.setContent(popupContent).update();
    };

    var year = attribute.split("_")[1];
    $('span.year').html(year);

})};
    // updateLegend(attributes);
};

function pointToLayer(feature, latlng, attributes){
    //creates marker options
    var attribute = attributes[0];

    var geojsonMarkerOptions = {
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

    var popupContent = createPopupContent(feature.properties, attribute);

    layer.bindPopup(popupContent, {
          offset: new L.Point(0, -geojsonMarkerOptions.radius * 0.5)
       });
    return layer;
};

function createPopupContent(properties, attribute){

    var popupContent = "<p><b>Prefecture:</b> " + properties.Prefecture + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];

    popupContent += "<p><b>Population in " + year + ":</b> " + properties[attribute] + " people</p>";

    return popupContent;
};

function createLegend(attributes){

    var legendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

                $(container).append('<div id="temporal-legend">Population in <span class="year">1980</span></div>');

            var svg = '<svg id="attribute-legend" width="160px" height="60px">';
//STARTED WORK HERE//
            var circles = ["max", "mean", "min"];

            for (var i=0; i<circles.length; i++){

                var radius = calcPropRadius(dataStats[circles[i]]);

                var cy = 59 - radius

                svg += '<circle class="legend-circle" id="' + circles[i] + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>'
          }

            svg += "</svg>";
//End of work sesh
            $(container).append(svg);

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new legendControl());

    //updateLegend(attributes[0]);
};

function processData(data){

    var properties = data.features[0].properties;

    //push each attribute name into global attributes array
    for (var attribute in properties){ // looping through values with an index of "Pop" and pushing them to the array if they have a value greater than 0
        //only take attributes with population values

        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);

        };
    };

    return attributes; //returns attributes array to be used in callback
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){
            var attributes = processData(response); //variable created within this function, I could have also made attributes a global variable at the beginning
            minValue = calcStats(response);
            calcStats(response);
            createPropSymbols(response,attributes);
            createLegend(attributes);
            createSequenceControls(attributes);
            calcStats(response);
        });
};

$(document).ready(createMap);


// ---- back to top button ----
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
