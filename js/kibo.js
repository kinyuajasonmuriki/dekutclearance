
function initializeUtilityMap(mapLayers) {
    var mapOptions = {
        zoomDelta: 0.5,
        maxZoom: 20,
        minZoom: 14,
        keyboard: true,
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
    };

    var map = L.map('map', mapOptions).setView(poi, 15);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    $.each(fibreLayers, function (key, val) {
        $.getJSON("data/" + fibreLayers[key], function (data) {
            if (key >= 0 && key < 3) {
                loadVectorPoints(data, map, key);
            }
            else if (key == 3) {
                loadVectorPolyline(data, map);
            }

        });
    });

}

function loadVectorPoints(data, map, category) {
    $.each(data.features, function (key, point) {
        var marker = new PruneCluster.Marker(point.geometry.coordinates[1], point.geometry.coordinates[0],
            {
                icon: mapMarkers[category],
                keyboard: true,
                draggable: false
            }, category);
        var content = processMarkerSpecs(point, category);
        marker.category = category, marker.weight = category + 1, marker.data.label = content[0],
            marker.data.popup = content[1], utilityCluster.RegisterMarker(marker);
    });
    map.addLayer(utilityCluster);
}


function processMarkerSpecs(point, category) {
    var label = (point.properties.NAME == true ? point.properties.NAME : "Unspecified Object");
    var popup = '<span id="popup-head"><i>Category: </i>' + layersDict[category] +
        '</span><p id="popup-content"><i>Object Name: </i>' + label + '</br><i>KML Folder: </i>'
        + point.properties.KML_FOLDER + '</p>';
    return [label, popup];
}

function loadVectorPolyline(data, map) {
    var polylinePoints = [];
    $.each(data.features, function (key, val) {
        polylinePoints.push([val.geometry.coordinates[1], val.geometry.coordinates[0]]);
    });
    var fibreNet = L.polyline(polylinePoints, { color: 'purple' }).addTo(map);
    map.fitBounds(fibreNet.getBounds());
}


function initializeUtilityMap(mapLayers) {
    var mapOptions = {
        zoomDelta: 0.5,
        maxZoom: 20,
        minZoom: 14,
        keyboard: true,
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
    };

    var map = L.map('map', mapOptions).setView(poi, 15);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    $.each(fibreLayers, function (key, val) {
        $.getJSON("data/" + fibreLayers[key], function (data) {
            if (key >= 0 && key < 3) {
                loadVectorPoints(data, map, key);
            }
            else if (key == 3) {
                loadVectorPolyline(data, map);
            }

        });
    });

}

function loadVectorPoints(data, map, category) {
    $.each(data.features, function (key, point) {
        var marker = new PruneCluster.Marker(point.geometry.coordinates[1], point.geometry.coordinates[0],
            {
                icon: mapMarkers[category],
                keyboard: true,
                draggable: false
            }, category);
        var content = processMarkerSpecs(point, category);
        marker.category = category, marker.weight = category + 1, marker.data.label = content[0],
            marker.data.popup = content[1], utilityCluster.RegisterMarker(marker);
    });
    map.addLayer(utilityCluster);
}


function processMarkerSpecs(point, category) {
    var label = (point.properties.NAME == true ? point.properties.NAME : "Unspecified Object");
    var popup = '<span id="popup-head"><i>Category: </i>' + layersDict[category] +
        '</span><p id="popup-content"><i>Object Name: </i>' + label + '</br><i>KML Folder: </i>'
        + point.properties.KML_FOLDER + '</p>';
    return [label, popup];
}

function loadVectorPolyline(data, map) {
    var polylinePoints = [];
    $.each(data.features, function (key, val) {
        polylinePoints.push([val.geometry.coordinates[1], val.geometry.coordinates[0]]);
    });
    var fibreNet = L.polyline(polylinePoints, { color: 'purple' }).addTo(map);
    map.fitBounds(fibreNet.getBounds());
}

