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

function calcPerCapita(fyAttr, popAttr){

    var perCapita = fyAttr / popAttr;

    return perCapita;
};

function createChoropleth(zipData, map, attributes){
    var zipStyle = {
        "fillColor": getColor(feature.properties.perCapita),
    };

    L.geoJson(zipData, {
        style: zipStyle
    }).addTo(map);
};

function getColor(p) {
    return p >  ? '#F1EEF6' :
           p >  ? '#BDC9E1' :
           p >  ? '#74A9CF' :
           p >  ? '#2B8CBE' :
           p >  ? '#045A8D' :
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
        offset: new L.Point(0,-geojsonMarkerOptions.radius)
    });

    //event listeners to open popup on hover
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
    //function that creates the control
    getZipBoundaries(map);

};

function updatePropSymbols(map, attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties;


            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = "<p><b>Zip Code: </b> " + props.ZipCode + "</p>";

            var fiscalYear = attribute.substr(3).replace("_", "/");
            popupContent += "<p><b>Average water usage in " + fiscalYear + ":</b> " + props[attribute] + " hundred cubic feet</p>";

            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius)
            });
        };
    })
}

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

            createChoropleth(zipData);

        }
    });
};

$(document).ready(createMap);
