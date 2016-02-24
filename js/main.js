function createMap(){
    //creates the map
    var map = L.map('map', {
        center: [34.02, -118.375],
        zoom: 11 //zoom level when page loads - 10 made it look too crowded even though all the points were visible without scrolling, 12 was less crowded but too zoomed in, 11 seemed like a good compromise even though scrolling is necessary to see all of the points
    });

    //tileset with attribution information
    var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }).addTo(map);

// call getData function which contains the data from the geojson
    getData(map);
};

// function to scale the markers to make them proportional symbols
// takes the attribute value from the chosen attribute (FY_11_12) as an argument
function calcPropRadius(attValue) {
    // scale factor which adjusts the symbol size evenly
    var scaleFactor = 50;
    // area is based on attribute value (for Fiscal Year 11/12) and above scale factor
    var area = attValue * scaleFactor;
    // the radius is then calculated based on the above area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};
// function which creates the markers for the point data
function createPropSymbols(response, map) {
    // attribute chosen to visualize with proportional symbols
    var attribute = "FY_11_12"
    // styling the markers for the point data
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#005ce6", //blue to represent water
        color: "#ffffff", //white outline looks better than black!
        weight: 1,
        opacity: 0.7,
        // for the concentrated downtown area it seemed necessary to have lower opacity to see the label for "Los Angeles" to allow the user to confirm they had reached the map they were looking for plus it stylistcally seems to match the tileset
        fillOpacity: 0.35
    };

// creates Leaflet geojson layer for the map, creating
    L.geoJson(response, {
        // iterates through each feature in the geojson to access each set of attribute values
        pointToLayer: function (feature, latlng) {
            // for each feature, it grabs the value for the chosen attribute (FY_11_12)
            // javascript Number() method converts a string to a number (not necessary for my data, though, since they are already numbers)
            var attValue = Number(feature.properties[attribute]);
            // FY_11_12 is located in the properties object

            // pass the attribute value for each feature through the calcPropRadius fuction and gives each feature a circle marker with a radius that is based on the attribute that was passed through the function
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            // actually creates the circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map); //adds proportional symbols to the map
};

// retrieves geojson data to put it on the map
function getData(map){
    // loads the data
    $.ajax("data/LA_H2O.geojson", {
        dataType: "json",
        success: function(response) {
            // passes data to an outside function to use outside of anonymous callback function
            createPropSymbols(response, map);
        }
    });
};

$(document).ready(createMap);
