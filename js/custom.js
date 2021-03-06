var poi = [-1.26808, 36.81204],
fibreLayers = ["buildings-connected.geojson", "slack-manhole.geojson", "closure-manhole.geojson", "optical-fibre.geojson",  "westlands.geojson"],
layersDict = ["Connected Buildings", "Slack Manhole", "Closure Manhole",  "Fibre Optics network", "Westlands Boundary"],
homeIcon = L.ExtraMarkers.icon({
	icon: 'fa-home',
	iconColor: 'white',
	markerColor: 'cyan',
	shape: 'circle',
	prefix: 'fa'
}),
slackIcon = L.ExtraMarkers.icon({
	icon: 'fa-gear',
	extraClasses: 'fa-spin',
	iconColor: 'black',
	markerColor: 'orange-dark',
	shape: 'circle',
	prefix: 'fa'
}),
closureIcon = L.ExtraMarkers.icon({
	icon: 'fa-crosshairs',
	iconColor: 'white',
	markerColor: 'green',
	shape: 'circle',
	prefix: 'fa'
}),
geolocateIcon = L.ExtraMarkers.icon({
	icon: 'fa-user',
	iconColor: 'cyan',
	markerColor: 'orange',
	shape: 'penta',
	prefix: 'fa'
}),
utilityCluster = new PruneClusterForLeaflet(70, 10),
mapMarkers = [homeIcon, slackIcon, closureIcon];

utilityCluster .BuildLeafletClusterIcon = function (cluster) {
	var e = new L.Icon.MarkerCluster();

	e.stats = cluster.stats;
	e.population = cluster.population;
	return e;
};

var colors = ['#1e97d6', '#d12619', '#007c2c', '#55BCBE', '#D2204C', '#FF0000', '#ada59a', '#3e647e'],
	pi2 = Math.PI * 2;

L.Icon.MarkerCluster = L.Icon.extend({
	options: {
		iconSize: new L.Point(44, 44),
		className: 'prunecluster leaflet-markercluster-icon'
	},

	createIcon: function () {
		// based on L.Icon.Canvas from shramov/leaflet-plugins (BSD licence)
		var e = document.createElement('canvas');
		this._setIconStyles(e, 'icon');
		var s = this.options.iconSize;

		if (L.Browser.retina) {
			e.width = s.x + s.x;
			e.height = s.y + s.y;
		} else {
			e.width = s.x;
			e.height = s.y;
		}

		// this.draw(e.getContext('2d'), s.x, s.y);
		this.draw(e.getContext('2d'), e.width, e.height);
		return e;
	},

	createShadow: function () {
		return null;
	},

	draw: function (canvas, width, height) {

		var xa = 2, xb = 50, ya = 18, yb = 21;

		var r = ya + (this.population - xa) * ((yb - ya) / (xb - xa));

		var radiusMarker = Math.min(r, 21),
			radiusCenter = 11,
			center = width / 2;

		if (L.Browser.retina) {
			canvas.scale(2, 2);
			center /= 2;
			canvas.lineWidth = 0.5;
		}

		canvas.strokeStyle = 'rgba(0,0,0,0.25)';

		var start = 0, stroke = true;
		for (var i = 0, l = colors.length; i < l; ++i) {

			var size = this.stats[i] / this.population;

			if (size > 0) {

				stroke = size != 1;

				canvas.beginPath();
				canvas.moveTo(center, center);
				canvas.fillStyle = colors[i];
				var from = start + 0.14,
					to = start + size * pi2;

				if (to < from || size == 1) {
					from = start;
				}
				canvas.arc(center, center, radiusMarker, from, to);

				start = start + size * pi2;
				canvas.lineTo(center, center);
				canvas.fill();
				if (stroke) {
					canvas.stroke();
				}
				canvas.closePath();
			}

		}

		if (!stroke) {
			canvas.beginPath();
			canvas.arc(center, center, radiusMarker, 0, Math.PI * 2);
			canvas.stroke();
			canvas.closePath();
		}

		canvas.beginPath();
		canvas.fillStyle = 'white';
		canvas.moveTo(center, center);
		canvas.arc(center, center, radiusCenter, 0, Math.PI * 2);
		canvas.fill();
		canvas.closePath();
		canvas.fillStyle = '#454545';
		canvas.textAlign = 'center';
		canvas.textBaseline = 'middle';
		canvas.font = 'bold ' + (this.population < 100 ? '12' : (this.population < 1000 ? '11' : '9')) + 'px sans-serif';
		canvas.fillText(this.population, center, center, radiusCenter * 2);
	}
});

utilityCluster.PrepareLeafletMarker = function (marker, data, category) {
	marker.setIcon(data.icon);
	if (marker.getPopup()) {
		marker.setPopupContent(data.popup);
	} else {
		marker.bindPopup(data.popup);
	}
};

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
	 L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
		label: "ESRI WorldTopo",
		maxZoom: 25
	}),
	L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		label: "ESRI WorldImage",
		maxZoom: 25
	})
];



(function ($) {

	
	new WOW().init();
	jQuery(window).load(function() { 
		jQuery("#preloader").delay(100).fadeOut("slow");
		jQuery("#load").delay(100).fadeOut("slow");
	});

	//jQuery to collapse the navbar on scroll
	$(window).scroll(function() {
		if ($(".navbar").offset().top > 50) {
			$(".navbar-fixed-top").addClass("top-nav-collapse");
		} else {
			$(".navbar-fixed-top").removeClass("top-nav-collapse");
		}
	});

	//jQuery for page scrolling feature - requires jQuery Easing plugin
	$(function() {
		$('.navbar-nav li a').bind('click', function(event) {
			var $anchor = $(this);
			$('html, body').stop().animate({
				scrollTop: $($anchor.attr('href')).offset().top
			}, 1500, 'easeInOutExpo');
			event.preventDefault();
		});
		$('.page-scroll a').bind('click', function(event) {
			var $anchor = $(this);
			$('html, body').stop().animate({
				scrollTop: $($anchor.attr('href')).offset().top
			}, 1500, 'easeInOutExpo');
			event.preventDefault();
		});
	});

initializeUtilityMap(window.layers);
})(jQuery);