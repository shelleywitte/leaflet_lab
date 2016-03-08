function createMap(){
    //create the map
    var map = L.map('map', {
        center: [34.02, -118.43],
        zoom: 10
    });

    //tileset
    var Eskri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }).addTo(map);

    getData(map);

    // getZipBoundaries(map);
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

    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius)
    });

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
    return layer;


};

// passing attributes array from processData function
function createPropSymbols(response, map, attributes) {
    // passing circle markers through to the map.
    L.geoJson(response, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function updatePropSymbols(map, attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            // access feature properties
            var props = layer.feature.properties;

            // update each proportional symbol's radius based on new fiscal year values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = "<p><b>Zip Code: </b> " + properties.ZipCode + "</p>";

            var fiscalYear = attribute.substr(3).replace("_", "/");
            popupContent += "<p><b>Average water usage in " + fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";

            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius)
            });
        };
    })
}

// function Popup(properties, attribute, layer, radius){
//     this.properties = properties;
//     this.attribute = attribute;
//     this.layer = layer;
//     this.fiscalYear = attribute.substr(3).replace("_", "/")[1];
//     this.waterUsage = this.properties[attribute];
//     this.content = "<p><b>Average water usage in " + fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";
//
//     this.bindToLayer = function(){
//         this.layer.bindPopup(this.content, {
//             offset: new L.point(0, -radius)
//         });
//     };
// };

// function createPopup(properties, attribute, layer, radius){
//     var popupContent = "<p><b>Zip Code: </b> " + properties.ZipCode + "</p>";
//
//     var fiscalYear = attribute.substr(3).replace("_", "/");
//     popupContent += "<p><b>Average water usage in " + fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";
//
//     layer.bindPopup(popupContent, {
//         offset: new L.Point(0, -radius)
//     });
// };

function createSequenceControls(map, attributes) {
    // create slider for temporal sequencing
    $('#panel').append('<input class = "range-slider" type="range">');

    // slider attributes
    $('.range-slider').attr({
        max: 7, // 8 fiscal years to sequence through
        min: 0,
        value: 0,
        step:1
    });

    // adding skip buttons to slider bar to more forward and backward in time
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

    // arrow images for sequence buttons
    $('#reverse').html('<img src="img/arrow_left.png">');
    $('#forward').html('<img src="img/arrow_right.png">');

    // click listener for sequence buttons
    $('.skip').click(function(){
        var index = $('.range-slider').val();

        // increment or decrement depending on button user clicked
        if ($(this).attr('id') == 'forward'){
            index++;

            // if the 8th (last) year is passed, wrap around to first year
            index = index > 7 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;

            // if 1st year is passed, wrap around to last year (attribute)
            index = index < 0 ? 7 : index;
        };

        // update slider
        $('.range-slider').val(index);

        updatePropSymbols(map, attributes[index]);
    });

    $('.range-slider').on('input', function(){
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
    });
};

function processData(data){
    // empty array to hold water data
    var attributes = [];

    // properties of first feature in LA_H2O dataset
    var properties = data.features[0].properties;

    // push each attribute name into attributes array
    for (var attribute in properties) {
        // only take attributes with fiscal year values (FY_)
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
            //creating an attributes array
            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
        }
    });
};

function getZipBoundaries(map){
    $.ajax("data/LA_ZIP.geojson", {
        dataType: "json",
        success: function(zipData) {

            L.geoJson(zipData).addTo(map);
        }
    });
};


$(document).ready(createMap);
