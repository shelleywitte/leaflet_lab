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

function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0];

    console.log(attribute);

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#005ce6",
        color: "#ffffff",
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.5
    };

    var attValue = Number(feature.properties[attribute]);

    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    var popupContent = "<p><b>Zip Code: </b> " + feature.properties.ZipCode + "</p>";

    var fiscalYear = attribute.substr(3).replace("_", "/");
    popupContent += "<p><b>Average water usage in " + fiscalYear + ":</b> " + feature.properties[attribute] + " hundred cubic feet</p>";

    layer.bindPopup(popupContent);

    return layer;
};

function createPropSymbols(response, map, attributes) {
    L.geoJson(response, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function createSequenceControls(map) {
    $('#panel').append('<input class = "range-slider" type="range">');

    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step:1
    });

    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

    $('#reverse').html('<img src="img/arrow_left.png">');
    $('#forward').html('<img src="img/arrow_right.png">');

    $('.skip').click(function(){
        var index = $('.range-slider').val();

        if ($(this).attr('id') == 'forward'){
            index++;
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            index = index < 0 ? 8 : index;
        };

        $('.range-slider').val(index);

        updatePropSymbols(map, attributes[index]);
    });

    $('.range-slider').on('input', function(){
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
    });
};

function processData(data){
    var attributes = [];

    var properties = data.features[0].properties;

    for (var attribute in properties) {
        if (attribute.indexOf("FY") > -1) {
            attributes.push(attribute);
        };
    };

    return attributes;
};

function getData(map){
    $.ajax("data/LA_H2O.geojson", {
        dataType: "json",
        success: function(response) {

            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
        }
    });
};

$(document).ready(createMap);
