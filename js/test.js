function createMap(){
    //create the map
    var map = L.map('map', {
        center: [34.02, -118.375],
        zoom: 11
    });

    //tileset
    var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }).addTo(map);

    getData(map);
};

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols(response, map) {

    var attribute = "FY_11_12"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#005ce6",
        color: "#ffffff",
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.5
    };


    L.geoJson(response, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);

            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};


function getData(map){
    $.ajax("data/LA_H2O.geojson", {
        dataType: "json",
        success: function(response) {
            createPropSymbols(response, map);
        }
    });
};

$(document).ready(createMap);
