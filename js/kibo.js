var owsUrl = 'http://localhost:8080/geoserver/Geomatics/ows',
    ControlIcon = L.ExtraMarkers.icon({
        icon: 'fa-glyphicon',
        extraClasses: 'glyphicon glyphicon-upload',
        iconColor: 'white',
        markerColor: 'blue',
        shape: 'penta',
        prefix: 'fa'
    }),
    borderIcon = L.ExtraMarkers.icon({
        icon: 'fa-glyphicon',
        extraClasses: 'glyphicon glyphicon-certificate',
        iconColor: 'white',
        markerColor: 'orange',
        shape: 'penta',
        prefix: 'fa',
    }),
    bookmarkIcon = L.ExtraMarkers.icon({
        icon: 'fa-glyphicon',
        extraClasses: 'glyphicon glyphicon-bookmark',
        iconColor: 'white',
        markerColor: 'dark-orange',
        shape: 'circle',
        prefix: 'fa'
    }),
    customControl = L.ExtraMarkers.icon({
        icon: 'fa-glyphicon',
        extraClasses: 'glyphicon glyphicon-fire',
        iconColor: 'yellow',
        markerColor: 'blue',
        shape: 'circle',
        prefix: 'fa'
    }),
    buffer_icon = L.ExtraMarkers.icon({
        icon: 'ion-alert-circled',
        markerColor: 'blue',
        iconColor: 'cyan',
        shape: 'circle',
        prefix: 'fa'
    }), circle_centroid, poly_centroid,
    markerLayers = new L.FeatureGroup(),
    mapOptions = {
        center: [-0.30857, 36.615333],
        zoom: 7,
        maxZoom: 25,
        minZoom: 4,
        zoomsliderControl: true,
        zoomControl: false,
        keyboard: true,
        crs: L.CRS.EPSG4326,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        tap: true,
        trackResize: true,
        worldCopyJump: true,
        bounceAtZoomLimits: true,
        attributionControl: true,
        markerZoomAnimation: true,
        fadeAnimation: true
    },
    map = L.map('map', mapOptions), kiboCluster = new PruneClusterForLeaflet(70, 10);
L.easyPrint({
    title: 'Print Or Save map in PDF Format.',
    position: 'topleft',
    elementsToHide: 'p, h2, a, span, .leaflet-bar, .basemap'
}).addTo(map);
kiboCluster.BuildLeafletClusterIcon = function (cluster) {
    var e = new L.Icon.MarkerCluster();
    e.stats = cluster.stats;
    e.population = cluster.population;
    return e;
};

var colors = ['#ef34e6', '#0000FF', '#EC1813', '#55BCBE', '#FF0000', '#FFA500', '#3e647e'],
    pi2 = Math.PI * 2;
L.Icon.MarkerCluster = L.Icon.extend({
    options: {
        iconSize: new L.Point(44, 44),
        className: 'prunecluster leaflet-markercluster-icon'
    },
    createIcon: function () {
        var e = document.createElement('canvas');
        this._setIconStyles(e, 'icon');
        var s = this.options.iconSize;
        e.width = s.x;
        e.height = s.y;
        this.draw(e.getContext('2d'), s.x, s.y);
        return e;
    },
    createShadow: function () {
        return null;
    },
    draw: function (canvas, width, height) {
        var lol = 0;
        var start = 0;
        for (var i = 0, l = colors.length; i < l; ++i) {
            var size = this.stats[i] / this.population;
            if (size > 0) {
                canvas.beginPath();
                canvas.moveTo(22, 22);
                canvas.fillStyle = colors[i];
                var from = start + 0.14,
                    to = start + size * pi2;
                if (to < from) {
                    from = start;
                }
                canvas.arc(22, 22, 22, from, to);
                start = start + size * pi2;
                canvas.lineTo(22, 22);
                canvas.fill();
                canvas.closePath();
            }

        }

        canvas.beginPath();
        canvas.fillStyle = '#56f685';
        canvas.arc(22, 22, 18, 0, Math.PI * 2);
        canvas.fill();
        canvas.closePath();
        canvas.fillStyle = '#555';
        canvas.textAlign = 'center';
        canvas.textBaseline = 'middle';
        canvas.font = 'bold 14px taloma,monospace';
        canvas.fillText(this.population, 22, 22, 40);
    }
});

kiboCluster.BuildLeafletCluster = function (cluster, position) {
    var m = new L.Marker(position, {
        icon: kiboCluster.BuildLeafletClusterIcon(cluster)
    });
    m.on('click', function () {
        var markersArea = kiboCluster.Cluster.FindMarkersInArea(cluster.bounds);
        var b = kiboCluster.Cluster.ComputeBounds(markersArea);
        if (b) {
            var bounds = new L.LatLngBounds(
                new L.LatLng(b.minLat, b.maxLng),
                new L.LatLng(b.maxLat, b.minLng));
            var zoomLevelBefore = kiboCluster._map.getZoom();
            var zoomLevelAfter = kiboCluster._map.getBoundsZoom(bounds, false, new L.Point(20, 20, null));
            if (zoomLevelAfter === zoomLevelBefore) {
                kiboCluster._map.fire('overlappingmarkers', {
                    cluster: kiboCluster,
                    markers: markersArea,
                    center: m.getLatLng(),
                    marker: m
                });
                kiboCluster._map.setView(position, zoomLevelAfter);
            }
            else {
                kiboCluster._map.fitBounds(bounds);
            }
        }
    });
    m.on('mouseover', function () {

    });
    m.on('mouseout', function () {

    });
    return m;
};

var countiesLayer = new L.geoJson(null, {
    onEachFeature: function (feature, layer) {
        layer.bindLabel(feature.properties.counties);
        modifyEachFeature(feature, layer);
    },
    style: defineStyle,
    fillColor: "green"
});

var firstControls = new L.geoJson(null, {
    onEachFeature: onEachFirstPoint
});

var KeTzBPs = new L.geoJson(null, {
    onEachFeature: onEachKeTzBP
});

function onEachFirstPoint(feature, layer) {
    layer.addTo(markerLayers);
    var catMarker1 = new PruneCluster.Marker(layer.getLatLng().lat, layer.getLatLng().lng, {
        icon: ControlIcon,
        keyboard: true,
        draggable: false
    }, 1);
    var markerContent = eachFirstControl(feature.properties);
    catMarker1.data.popupContent = markerContent[0];
    catMarker1.data.labelContent = markerContent[1];
    kiboCluster.RegisterMarker(catMarker1);
}

function onEachKeTzBP(feature, layer) {
    layer.addTo(markerLayers);
    var catMarker2 = new PruneCluster.Marker(layer.getLatLng().lat, layer.getLatLng().lng, {
        icon: borderIcon,
        keyboard: true,
        draggable: false
    }, 5);
    var markerContent = eachKeTzBP(feature.properties);
    catMarker2.data.popupContent = markerContent[0];
    catMarker2.data.labelContent = markerContent[1];
    kiboCluster.RegisterMarker(catMarker2);
}

var eachFirstControl = function (data) {
    var popupContent = "Station Name : " + data.stn_name + "</br>Station Number: " + data.stn_no +
        "</br>Booked Arc 1960 Grid Easting(m): " + data.easting_m + "m.</br>Booked Arc1960 Grid Northing(m): " +
        data.northing_m + "m.</br>Booked Latitude: " + data.longitude + " | " + data.dms_long + "</br>Booked Longitude: " +
        data.latitude + " | " + data.dms_lat + "</br>Booked Geoidal Height|Altitude(m): " + data.height_m +
        "m.</br>S.O.K. Map Index: " + data.map_no + "/" + data.map_ref + "</br>UTM Zone: " + data.zone + data.zone_lette +
        "</br>ECEF X(m): " + data.ecef_y_m + "m.</br>ECEF Y(m): " + data.ecef_z_m + "m.</br>ECEF Z(m): " + data.ecef_z_m_1 + "m.</br></span>";
    return [popupContent, data.search_e];
},
    eachKeTzBP = function (data) {
        var popupContent = "Border Pillar Identifier : " + data.point_id +
            "</br>Border Pillar Locality: " + data.locality + "</br>S.O.K. Map Index: " + data.sheetnoke + "</br>UTM Zone: " +
            data.zone + data.zone_lette + "</br>Booked Latitude: " + data.latitude + " | " + data.dms_lat +
            "</br>Booked Longitude: " + data.longitude + " | " + data.dms_long + "</br>Grid Arc1960 Northing(m): " +
            data.northing_m + "m.</br>Grid Arc1960 Easting(m): " + data.easting_m + "m.</br>Pillar Status: " + data.pillarstat +
            "</br>Pillar Intervisibility: " + data.intervisib + "</br>Pillar Densification: " + data.densificat +
            "</br>Pilar Comment: " + data.pillarcomm + "</span>";
        return [popupContent, data.search_e];
    };
kiboCluster.PrepareLeafletMarker = function (pruneMarker, data, category) {
    pruneMarker.bindLabel(data.labelContent);
    pruneMarker.setIcon(data.icon);
    if (category == 1) {
        category = "<span id='pop_content'><h4>First Order Control point. </h4>";
        if (pruneMarker.getPopup()) {
            pruneMarker.setPopupContent(category + data.popupContent);
        } else {
            pruneMarker.bindPopup(category + data.popupContent);
        }
    } else if (category == 5) {
        category = "<span id='pop_content'><h4>Kenya_Tanzania B_Pillar.</h4>";
        if (pruneMarker.getPopup()) {
            pruneMarker.setPopupContent(category + data.popupContent);
        } else {
            pruneMarker.bindPopup(category + data.popupContent);
        }
    } else {
        category = "<h3>Undefined!</h3>";
        if (pruneMarker.getPopup()) {
            pruneMarker.setPopupContent(category);
        } else {
            pruneMarker.bindPopup(category);
        }
    }
};


function modifyEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: controlsCounter
    });
}
function defineColors(area) {
    if (area > 50000) {
        color = "green";
    }
    else if (area > 35000 && area <= 50000) {
        color = "#4F8112";
    }

    else if (area > 23000 && area <= 35000) {
        color = "#8f20e9";
    }
    else if (area > 150000 && area <= 23000) {
        color = "blue";
    }
    else if (area > 10000 && area <= 15000) {
        color = "#4ee79b";
    }
    else if (area > 5000 && area <= 10000) {
        color = "violet";
    }
    else if (area > 1000 && area <= 5000) {
        color = "#6cf6ec";
    }
    else if (area > 1000) {
        color = "olive";
    }
    else {
        color = "red";
    }

    return color;
}
var label = "KIBO_Default";
function defineStyle(feature) {
    return {
        fillColor: defineColors(feature.properties.area_sqkm),
        color: "yellow",
        dashArray: '3',
        opacity: 0.2,
        fillOpacity: 0.3,
        weight: 2
    };
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: "blue",
        dashArray: 3,
        opacity: 0.3,
        fillOpacity: 0.4,
        fillColor: "#f9ef21"
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    countiesLayer.resetStyle(e.target);
}
function controlsCounter(event) {
    var layer = event.target;
    map.fitBounds(layer.getBounds());
    var popupContent = isPoly(layer);
    if (popupContent === "Undefined") {
        alert("This is Quite Embarassing. \bRequest No Successful!");
    }
    else if (popupContent.length > 1) {
        L.marker(popupContent[1], {
            draggable: false,
            icon: buffer_icon
        }).bindPopup(popupContent[0]).addTo(map);
    }
}

function getWFS(layer) {
    var defaultParameters = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layer,
        outputFormat: 'text/javascript',
        format_options: 'callback:loadGeoJson',
        SrsName: 'EPSG:4326'
    };

    var parameters = L.Util.extend(defaultParameters);
    var URL = owsUrl + L.Util.getParamString(parameters);
    $.ajax({
        url: URL,
        dataType: 'jsonp'
    });
}

function loadGeoJson(data) {
    console.log(data);
    if (data.totalFeatures == 47) {
        countiesLayer.addData(data);
    }
    else if (data.totalFeatures == 138) {
        firstControls.addData(data);
    }
    else if (data.totalFeatures == 478) {
        KeTzBPs.addData(data);
    }
}
getWFS('Geomatics:first-order-cp');
getWFS('Geomatics:kenya-tanzania-boundary');
getWFS('Geomatics:kenya-wards');
map.addLayer(countiesLayer);
map.addLayer(kiboCluster);

L.control.coordinates({
    position: "bottomleft",
    decimals: 5,
    useDMS: false,
    decimalSeperator: ".",
    labelTemplateLat: "Latitude: {y}",
    labelTemplateLng: "Longitude: {x}"
}).addTo(map);
L.control.coordinates({
    position: "bottomright",
    useDMS: true,
    labelTemplateLng: "E {x}",
    labelTemplateLat: "N {y}",
    useLatLngOrder: false
}).addTo(map);

var mapboxAccessToken = "pk.eyJ1IjoiamFzb25tdXJ5IiwiYSI6ImNqMThheW03ODAwNW0zMnBlb3JscTEzenUifQ.3wXebm5J1BrrVLPVgZ5U2g";
var basemaps = [
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 23,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        label: "OSM Tile"
    }),
    L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        label: "OSM TOPO"
    }),
    L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        label: "OSM Pioneer"
    }),
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
        label: "ESRI WorldsStreet",
        maxZoom: 25
    }),
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        label: "ESRI WorldTopo",
        maxZoom: 25
    }),
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        label: "ESRI WorldImage",
        maxZoom: 25
    }),
    L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/hybrid.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
        attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        mapID: 'newest',
        app_id: '4Ze5cKFlMjHHrl1r4Rab',
        app_code: 'iQvW6whpbX0YiuWfnRLwoQ',
        base: 'aerial',
        maxZoom: 20,
        type: 'maptile',
        language: 'eng',
        format: 'png8',
        size: '256',
        label: "HERE Hybrid"
    }),
    L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/normal.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
        attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        mapID: 'newest',
        app_id: '4Ze5cKFlMjHHrl1r4Rab',
        app_code: 'iQvW6whpbX0YiuWfnRLwoQ',
        base: 'base',
        maxZoom: 20,
        type: 'basetile',
        language: 'eng',
        format: 'png8',
        size: '256',
        label: "HERE Basic"
    }),
    L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/normal.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
        attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        mapID: 'newest',
        app_id: '4Ze5cKFlMjHHrl1r4Rab',
        app_code: 'iQvW6whpbX0YiuWfnRLwoQ',
        base: 'base',
        maxZoom: 20,
        type: 'maptile',
        language: 'eng',
        format: 'png8',
        size: '256',
        label: "HERE Normal"
    }),
    L.tileLayer('//{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        maxZoom: 16,
        minZoom: 1,
        label: 'Watercolor'
    })
];

map.addControl(L.control.basemaps({
    basemaps: basemaps,
    tileX: 0,  // tile X coordinate
    tileY: 0,  // tile Y coordinate
    tileZ: 2   // tile zoom level
}));

var bingArial = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {
    type: "Aerial",
    maxZoom: 20
});
var bingHybrid = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {
    type: "AerialWithLabels",
    maxZoom: 20
});
var bingRoad = new L.BingLayer("AtTygoY-I8UwPTk3GJfkWh1Vxjw1MBRNKUW0VBHOwGLV9NstPwD1SReYaGycOvvA", {
    type: "Road",
    maxZoom: 35
});
var baseMaps = {
    "Bing Hybrid": bingHybrid,
    "Bing Aerial": bingArial,
    "Bing Road": bingRoad
};
var kiboGraticule = L.latlngGraticule({
    showLabel: true,
    zoomInterval: [
        { start: 1, end: 2, interval: 5 },
        { start: 3, end: 4, interval: 3 },
        { start: 5, end: 6, interval: 2 },
        { start: 7, end: 9, interval: 1 }
    ],
    opacity: 0.8,
    weight: 1,
    color: "red",
    fontColor: "blue",
    font: "bell mt"
}).addTo(map);
var overlayMaps = {
    "Counties Layers": countiesLayer,
    "Graticule Layer": kiboGraticule,
    "Control Points": kiboCluster
};
L.control.layers(baseMaps, overlayMaps).addTo(map);
var controlSearch = L.control.search({
    position: 'topright',
    layer: countiesLayer,
    initial: false,
    propertyName: 'search_e',
    circleLocation: true,
    moveToLocation: function (latlng, title, map) {
        map.fitBounds(latlng.layer.getBounds());
        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
        map.setView(latlng, zoom); // access the zoom
    }
});


controlSearch.on('search:locationfound', function (e) {
    map.removeLayer(this._markerSearch)
    e.layer.setStyle({ fillColor: '#3f0', color: '#0f0' });
    if (e.layer._popup) {
        e.layer.openPopup();
    } else {
        e.layer.bindPopup(e.layer.feature.properties.search_e).openPopup();
    }

}).on('search:collapsed', function (e) {
    countiesLayer.eachLayer(function (layer) {
        countiesLayer.resetStyle(layer);
    });
});

map.addControl(controlSearch);

L.TransformControl = L.Control.extend({
    options: {
        position: 'topright'
    },
    onAdd: function (map) {
        var controlIcon = L.DomUtil.create('div');
        controlIcon.className = "transform_coords convert_coords";
        controlIcon.innerHTML = "<img id='transform' src='assets/img/transform.png' width='40px' height='40px' alt='Transform' />";
        return controlIcon;
    },
    onRemove: function (map) {

    }
});
L.transformIcon = function (options) {
    return new L.TransformControl(options);
}
L.transformIcon().addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    draw: {
        toolbar: {
            buttons: {
                polygon: 'Select Irregular Region.',
                polyline: 'Trace Travel|Survey Line.',
                rectangle: "Select Rectangular region.",
                circle: "Buffer a Circular Patch.",
                marker: "Add Local Control Point."
            }
        }
    },

    edit: {
        featureGroup: drawnItems,
        remove: true
    },
    position: 'topright'
});
map.addControl(drawControl);
drawControl.setDrawingOptions({
    rectangle: {
        shapeOptions: {
            color: '#5555efe6'
        }
    },
    polyline: {
        shapeOptions: {
            stroke: true,
            color: '#e41548',
            weight: 3,
            smoothFactor: 1.0,
            clickable: true,
            className: "user_polyline"
        }
    },
    circle: {
        shapeOptions: {
            color: 'steelblue'
        }
    },
    marker: {
        icon: bookmarkIcon
    },
    polygon: {
        shapeOptions: {
            stroke: true,
            color: 'purple',
            weight: 3,
            smoothFactor: 1.0,
            fill: true,
            fillColor: "red",
            opacity: 0.7,
            fillOpacity: 0.5,
            clickable: true,
            className: "user_polyline"
        },
        allowIntersection: false,
        drawError: {
            color: 'orange',
            timeout: 3000,
            message: '<strong>Error! Polygon cannot intersect itself.</strong>'
        },
        showArea: true,
        metric: true,
        repeatMode: false
    }
});

var _round = function (num, len) {
    return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
};
var strLatLng = function (latlng) {
    return "(" + _round(latlng.lat, 6) + ", " + _round(latlng.lng, 6) + ")";
};
function getCircleSpecs(center, radius) {
    var counter_points = 0;
    var marker_spec = [];
    markerLayers.eachLayer(function (layer) {
        var control_lat_long = layer.getLatLng();
        var dist_from_center = control_lat_long.distanceTo(center);
        if (dist_from_center <= radius) {
            counter_points += 1;
            marker_spec.push(layer.feature.properties.search_e);
        }
    });
    marker_spec.push(counter_points);
    return marker_spec;
}

function circle_pop_content(dataArray, center, radius) {
    var marker_spec_string = "<h7>";
    var array_length = dataArray.length;
    var title_singular = ' Control point';
    var title_plural = ' Control points';
    var counter_points = dataArray[array_length - 1];
    for (var counter = 0; counter < array_length - 1; counter++) {
        marker_spec_string += (counter + 1) + ". &rarr; " + dataArray[counter] + "</br>";
    }
    marker_spec_string += "</h7>";
    if (counter_points == 1 || counter_points == 0) {
        var title_filter = title_singular;
    }
    else if (counter_points > 1) {
        var title_filter = title_plural;
    }
    var content = "Center: " + strLatLng(center) + "<br />"
        + "Radius: " + _round(radius, 2) +
        " m</br><h4>Circular Buffer Control Points.</h4>" + + counter_points + title_filter +
        " are contained in the Buffer</br>" + marker_spec_string;
    return content;
}

var getPopupContent = function (layer, action) {
    if (layer instanceof L.Marker) {
        layer.setIcon(customControl);
        var pop_content = strLatLng(layer.getLatLng());
        layer.bindPopup(pop_content);
        map.panTo(layer.getLatLng());
    }
    else if (layer instanceof L.Circle) {
        var center = layer.getLatLng(),
            radius = layer.getRadius();
        map.setView(center);
        var circle_specs = getCircleSpecs(center, radius);
        var content = circle_pop_content(circle_specs, center, radius);
        if (action == "add") {
            circle_centroid = L.marker(center, {
                draggable: true,
                icon: buffer_icon
            }).bindPopup(content).addTo(map);
        } else if (action == "edit") {
            circle_centroid.setLatLng(center)._popup.setContent(content);
        }

        circle_centroid.on('dragend', function (event) {
            center = event.target.getLatLng();
            map.setView(center);
            layer.setLatLng(center);
            circle_specs = getCircleSpecs(center, radius);
            content = circle_pop_content(circle_specs, center, radius);
            circle_centroid._popup.setContent(content);
            layer.redraw();
        });

    }
    else if (layer instanceof L.Polygon) {
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            area = L.GeometryUtil.geodesicArea(latlngs),
            content = "Polygon Area: " + L.GeometryUtil.readableArea(area, true) +
                "</br><h4>Buffer Control Points Detail.</h4>",
            popupContent = isPoly(layer);
        if (popupContent.length > 1) {
            if (action == "add") {
                poly_centroid = L.marker(popupContent[1], {
                    draggable: false,
                    icon: buffer_icon
                }).bindPopup(popupContent[0]).addTo(map);
            } else if (action == "edit") {
                poly_centroid.setLatLng(popupContent[1])._popup.setContent(popupContent[0]);
            }
        }
    }
    else if (layer instanceof L.Polyline) {
        var content;
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            distance = 0;
        if (latlngs.length < 2) {
            content = "Distance: N/A";
        } else {
            for (var i = 0; i < latlngs.length - 1; i++) {
                distance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            content = "Distance: " + _round(distance, 2) + " m";
        }
        map.fitBounds(layer.getBounds());
        layer.bindPopup(content);
    }
};

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    var content = getPopupContent(layer, "add");
    drawnItems.addLayer(layer);
});

map.on(L.Draw.Event.EDITED, function (event) {
    var layers = event.layers,
        content = null;
    layers.eachLayer(function (layer) {
        content = getPopupContent(layer, "edit");
    });
});

window.$_crs = map.options.crs.code;