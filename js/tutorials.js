//creates a map on the page and sets the view of the map (lat/long coordinates)
//as well as zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

//adds tile layer from open street map with a max zoom of 18,
L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    maxZoom: 18,
    //where the tileset is coming from
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);//officially adds the tileset to the map/page

//creates a marker at a specific location (lat/long) to the map
var marker = L.marker([51.5, -0.09]).addTo(map);//adds marker to map

//creates a circle with radius 500 pixels
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map); //adds circle to the map

//creates a polygon with coordinates pairs as the vertices
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);//adds polygon to the map

//adding popups to the map when you click on the marker, circle, and polygon
//on the map; each popup contain text to display in the popup
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//creates a popup that isn't attached to an object on the map; specifies location,
//appears when the page loads
var popup = L.popup()
    .setLatLng([51.49, -0.09]) //I changed latitude coord. so that it wasn't
    //blocking the marker when the page initially loads
    .setContent("I am a standalone popup.") //text displayed in popup
    .openOn(map);//adds popup to map and closes previous popup

//creates a variable that will be a popup that appears when the user clicks on map
var alert = L.popup();
//creates listener function for an event which, in this case, is what happens when
//the user clicks on the map (other than on the objects already added)
function onMapClick(e) { //"e" argument in function is the map click event object
    alert
        .setLatLng(e.latlng)//event object takes up the click location as a property
        //text displayed in the alert/popup which include coordinates of where
        //user clicked on the map
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);//adds popup to map and closes previous popup
}

map.on('click', onMapClick);//turns the event listener on




var geojsonFeature = {
  "type": "Feature",
  "properties": {
    "name": "Coors Field",
    "amenity": "Baseball Stadium",
    "popupContent": "This is where the Rockies play!"
    "show_on_map": true
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.99404, 39.75621]
  }, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
};

L.geoJson(geojsonFeature).addTo(map);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJson(myLines, {
    style: myStyle
}).addTo(map);

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJson(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJson(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

L.geoJson(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

L.geoJson(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
