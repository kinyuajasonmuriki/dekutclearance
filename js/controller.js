
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
    fadeAnimation: true,
    zoomControl: false
  };
  L.mapbox.accessToken = 'pk.eyJ1IjoiamFzb25tdXJ5IiwiYSI6ImNqMThheW03ODAwNW0zMnBlb3JscTEzenUifQ.3wXebm5J1BrrVLPVgZ5U2g';

  var map = L.mapbox.map('map', 'mapbox.satellite', { zoomControl: false}).setView(poi, 14);
 
  L.control.zoomslider().addTo(map);
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
    content: '<button type="button" class="btn btn-default" title="Geolocate" value="geolocate">' +
    '    <i class="fa fa-crosshairs"></i>' +
    '</button>' +
    '<button type="button" class="btn btn-info" title="Connect New Building" value="connect">' +
    '<i class="fa fa-road" aria-hidden="true"></i>' +
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
        if (data.target.value == "connect"){
          navigateToLocation(map);
        }
         else if (data.target.value == "geolocate"){
          getCurrentUserLocation(map);
        }
      },
      /*
      dblclick: function (data) {
        console.log('wrapper div element dblclicked');
        console.log(data);
      },
      contextmenu: function (data) {
        console.log('wrapper div element contextmenu');
        console.log(data);
      }, */
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

function getCurrentUserLocation(map){
  /*map.on('accuratepositionprogress', function(e){
    console.log("Progress", e.accuracy);
    console.log("Progress", e.latlng);
  }); */
  map.on('accuratepositionfound', function(e){
    //console.log("Accurate", e.accuracy);
    var userLocation = L.marker(e.latlng, { icon: geolocateIcon, }).addTo(map);
    map.setView(e.latlng, 25);
    userLocation.bindPopup("<i>latlng:"+e.latlng+" </i>").openOn(map);
  });
  map.on('accuratepositionerror', function(e){
    bootbox.alert(e.message);
  });
  map.findAccuratePosition({
    maxWait: 15000, 
    desiredAccuracy: 30 
  });
}

function navigateToLocation(map){
  L.control.custom({
    position: 'topright',
    content: 
    "<div id='directions'>" +
    "<div id='routes'></div>" +
    "<div id='instructions'></div></div>",
    classes: 'navigation-control'
  }).addTo(map);

  var drivingLayer = L.mapbox.tileLayer('mapbox.emerald').addTo(map);
  var walkingLayer = L.mapbox.tileLayer('mapbox.outdoors');

  var directions = L.mapbox.directions();

  var directionsLayer = L.mapbox.directions.layer(directions)
    .addTo(map);

  var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions)
    .addTo(map);

  var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions)
    .addTo(map);

  var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
    .addTo(map);

  var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions)
    .addTo(map);

  directions.on('profile', function (e) {
    if (e.profile === 'mapbox.driving') {
      map.addLayer(drivingLayer).removeLayer(walkingLayer);
    } else {
      map.addLayer(walkingLayer).removeLayer(drivingLayer);
    }
  }).on('load', function () {
    document.querySelector('#directions').className = 'active';

    var precision = Math.max(0, Math.ceil(Math.log(map.getZoom()) / Math.LN2)),
      points = [directions.getOrigin()]
        .concat(directions.getWaypoints())
        .concat([directions.getDestination()])
        .map(function (f) {
          var c = f.geometry.coordinates;
          return [c[0].toFixed(precision), c[1].toFixed(precision)];
        });

    history.replaceState({}, null,
      '?route=' + points.join(';')
      + '&profile=' + directions.getProfile()
      + location.hash);

  }).on('unload', function () {
    document.querySelector('#directions').className = '';

    history.replaceState({}, null, location.pathname + location.hash);
  });

  var search = window.location.search.substring(1).split('&');

  var profile = (search[1] || '').split('profile=').pop();
  if (profile) {
    directions.setProfile(profile);
  }

  var waypoints = decodeURIComponent(search[0].split('route=').pop()).split(';');
  if (waypoints.length >= 2) {
    function toLatLng(waypoint) {
      return L.latLng(waypoint.split(',').reverse());
    }

    directions
      .setOrigin(toLatLng(waypoints[0]))
      .setDestination(toLatLng(waypoints[waypoints.length - 1]))
      .setWaypoints(waypoints.slice(1, waypoints.length - 1).map(toLatLng))
      .query();
  }


}
