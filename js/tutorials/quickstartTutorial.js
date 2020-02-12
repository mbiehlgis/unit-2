var mymap = L.map('mapid').setView([51.505, -0.09], 13);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

Esri_WorldImagery.addTo(mymap);

// var marker = L.marker([51.5, -0.09]).addTo(mymap); // adds marker to map
//
// var circle = L.circle([51.508, -0.11], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(mymap); // adds circle polygon over area
//
// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(mymap); //adding a polygon, each set of coordinates is a point to connect to
//
// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon."); //easy pop-up shortcut, "bindPopup" adds popup text to each variable name
//
// var popup = L.popup()
//     .setLatLng([51.5, -0.09])
//     .setContent("I am a standalone popup.")
//     .openOn(mymap); // standalone popup separate from any object, popup locaion set on coordinates
//
// function onMapClick(e) {
//     alert("You clicked the map at " + e.latlng);
// }
//
// mymap.on('click', onMapClick);
