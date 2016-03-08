function createMap(){
    //create the map
    var map = L.map('map', {
        center: [33.96, -118.33],
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

    var popup = new Popup(feature.properties, attribute, layer, geojsonMarkerOptions.radius);

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

            var popup = new Popup(props, attribute, layer, radius);

            popup.bindToLayer();
        };
    })
}

function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.fiscalYear = attribute.substr(3).replace("_", "/");
    this.waterUsage = this.properties[attribute];
    this.content = "<p><b>Zip Code: </b> " + this.properties.ZipCode + "</p><p><b>Average water usage in " + this.fiscalYear + ":</b> " + properties[attribute] + " hundred cubic feet</p>";

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

    var SequenceControl = L.Control.extend({
        options: {
            position: "bottomleft"
        },

        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // create slider for temporal sequencing
            $(container).append('<input class = "range-slider" type="range">');

            // adding skip buttons to slider bar to more forward and backward in time
            $(container).append('<button class="skip" id="reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward">Skip</button>');

            $(container).on('mousedown dblclick', function (e) {
                L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());

    // slider attributes
    $('.range-slider').attr({
        max: 7, // 8 fiscal years to sequence through
        min: 0,
        value: 0,
        step:1
    });

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

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function(map){
            var container = L.DomUtil.create('div', 'legend-control-container');

            $(container).append(features.properties.attribute)

            return container;
        }
    });

    map.addControl(new LegendControl());
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
