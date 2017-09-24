
function initializeUtilityMap(mapLayers) {
  var mapOptions = {
    zoomDelta: 0.5, 
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

  var map = L.map('map', mapOptions).setView(poi, 14);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


  $.each(fibreLayers, function (key, val) {
    $.getJSON("data/" + fibreLayers[key], function (data) {
      if (key >= 0 && key <= 2) {
        loadVectorPoints(data, map, key);
      }
      else if (key >  2 && key < 5) {
        loadVectorComplex(data, map, key);
      }
    });
  });

}

function loadVectorPoints(data, map, category) {
  $.each(data.features, function (key, point) {
    var content = processMarkerSpecs(point, category);
    var marker = new PruneCluster.Marker(point.geometry.coordinates[1], point.geometry.coordinates[0],
      {
        icon: mapMarkers[category],
        keyboard: true,
        draggable: false,
        popup: content[1],
        label: content[0],
        weight: category + 1
      }, category);
    utilityCluster.RegisterMarker(marker);
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

function loadVectorComplex(data, map, key) {
  var style, hoverStyle = {"fillOpacity": 0.5};
  if(key == 3){
    style = {
      "color": "purple",
      "weight": 5.0,
      "opacity": 0.9,
    };
  }else{
    style = {
      "clickable": true,
      "color": "violet",
      "fillColor": "#00D",
      "weight": 1.0,
      "opacity": 0.7,
      "fillOpacity": 0.1
    };
  }
  var vectorLayer = L.geoJson(data, {
    style: style,
    onEachFeature: function(feature, featureLayer){
    }
  }).addTo(map);
  if (key == 4) {
    map.fitBounds(vectorLayer.getBounds());
    map.setMaxBounds(vectorLayer.getBounds());
    map.options.minZoom = map.getZoom();
  }
}



