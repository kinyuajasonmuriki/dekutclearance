
function initializeUtilityMap(mapLayers) {
  var mapOptions = {
    zoomDelta: 0.5,
    maxZoom: 25, 
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
  var mapKey = 'pk.eyJ1IjoiamFzb25tdXJ5IiwiYSI6ImNqMThheW03ODAwNW0zMnBlb3JscTEzenUifQ.3wXebm5J1BrrVLPVgZ5U2g';
  L.mapbox.accessToken = mapKey;
  mapboxgl.accessToken = mapKey;
  var map = new mapboxgl.Map({
    container: 'map',
    zoom: 13,
    center: poi,
    style: 'mapbox://styles/mapbox/satellite-v9',
    hash: false
  });

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
 
 constructMapControls(map);
}

function constructMapControls(map){
  map.addControl(L.control.basemaps({
    basemaps: basemaps,
    tileX: 0,  // tile X coordinate
    tileY: 0,  // tile Y coordinate
    tileZ: 2   // tile zoom level
  }));

  L.control.custom({
    position: 'topright',
    content: '<button type="button" class="btn btn-default">' +
    '    <i class="fa fa-crosshairs"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-info">' +
    '    <i class="fa fa-compass"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-primary">' +
    '    <i class="fa fa-spinner fa-pulse fa-fw"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-danger">' +
    '    <i class="fa fa-times"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-success">' +
    '    <i class="fa fa-check"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-warning">' +
    '    <i class="fa fa-exclamation-triangle"></i>' +
    '</button>',
    classes: 'btn-group-vertical btn-group-sm',
    style:
    {
      margin: '10px',
      padding: '0px 0 0 0',
      cursor: 'pointer'
    },
    datas:
    {
      'foo': 'bar',
    },
    events:
    {
      click: function (data) {
        console.log('wrapper div element clicked');
        console.log(data);
      },
      dblclick: function (data) {
        console.log('wrapper div element dblclicked');
        console.log(data);
      },
      contextmenu: function (data) {
        console.log('wrapper div element contextmenu');
        console.log(data);
      },
    }
  }).addTo(map);

  

}


function loadVectorPoints(data, map, category) {
  if(category == 0){
    var pigmatter = [];
    $.each(data.features, function(pos, value){
      pigmatter.push({ "value": value.properties.NAME, "data": value});
    });
    L.control.custom({
      position: 'topleft',
      content: '<div class="input-group">' +
      '    <input type="text" class="form-control input-sm" placeholder="Search" id="custom-search">' +
      '    <span class="input-group-btn">' +
      '        <button class="btn btn-default btn-sm" type="button"><i class="fa fa-search"></i></i></button>' +
      '    </span>' +
      '</div>',
      classes: '',
      style:
      {
        position: 'absolute',
        left: '50px',
        top: '0px',
        width: '200px',
      },
      events:
      {
        click: function (data) {
          var searchField = data.target;
          $(searchField).autocomplete({
            lookup: pigmatter,
            showNoSuggestionNotice: false,
            noSuggestionNotice: "No Match Found",
            onSelect: function (suggestion) {
              var filtered = [suggestion.data.geometry.coordinates[1], suggestion.data.geometry.coordinates[0]];
              map.panTo(filtered,
                {animate: true,
                duration: 0.79,
                easeLinearity: 0.8 
              });
              map.panTo(filtered);
              map.setView(filtered, 19);
            }
          });
        }
      }
    }).addTo(map);

  }


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
  if (point.properties.NAME) var label = point.properties.NAME; else var label = "Unspecified Object";
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



