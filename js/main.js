/* Created by Shelley Witte, 2016 */

$('#mydiv').html('Hello World!');

function initialize() {
    // initializes functions that are defined below

};


var map = L.map('map').setView([51.505, -0.09], 13);

//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'ohthatswitte.p4bg5d3l',
    accessToken: 'pk.eyJ1Ijoib2h0aGF0c3dpdHRlIiwiYSI6ImNpa2RkeThlNTAwMWp0cmx5dGE3aWw0YWcifQ.elzCgiaRk1Ao6RA2T6wy4g'
}).addTo(map);

var marker = L.marker([51.5, -0.09]).addTo(map);

var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

// //calls initialize function to excute the functions within that function
$(document).ready(initialize)
