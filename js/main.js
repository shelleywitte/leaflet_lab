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

    // var popup = newPopup(features.properties, attribute, layer, geojsonMarkerOptions.radius);

    createPopup(props, attribute, layer, radius);

    popup.bindToLayer();

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


function createPropSymbols(response, map, attributes) {
    L.geoJson(response, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function updatePropSymbols(map, attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties;


            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // var popup = new Popup(props, attribute, layer, radius);
            //
            // popup.bindToLayer();
            createPopup(props, attribute, layer, radius);
        };
    })
}

function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.fiscalYear = attribute.substr(3).replace("_", "/")[1];
    this.waterUsage = this.properties[attribute];
    this.content = "<p><b>Average water usage in " + fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";

    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.point(0, -radius)
        });
    };
};

function createPopup(properties, attribute, layer, radius){
    var popupContent = "<p><b>Zip Code: </b> " + properties.ZipCode + "</p>";

    var fiscalYear = attribute.substr(3).replace("_", "/");
    popupContent += "<p><b>Average water usage in " + fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";

    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius)
    });
};

function createSequenceControls(map, attributes) {
    $('#panel').append('<input class = "range-slider" type="range">');

    $('.range-slider').attr({
        max: 7,
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
            index = index > 7 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            index = index < 0 ? 7 : index;
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

function getZipBoundaries(map){
    $.ajax("data/LA_ZIP.geojson", {
        dataType: "json",
        success: function(zipData) {

            L.geoJson(zipData).addTo(map);
        }
    });
};


$(document).ready(createMap);
