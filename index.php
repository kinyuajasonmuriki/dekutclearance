<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="utf-8">
<title>Utility Monitor</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
<meta name="description" content="GIS Based Utility Monitoring System For Optic Fibre Cables" >
<meta nam="keywords" content="Network Utilities, Utility Monitor, GIS, Remote Sensing, Geography, Optical Fibre Cables, Benjamin Mbithi Kiio, Jason Muriki Kinyua" />
<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css">
<link href="libs/leaflet/leaflet.css" rel="stylesheet" type="text/css" />
<link href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css' rel='stylesheet' />
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.css' rel='stylesheet' />
<link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
<link href="css/animate.css" rel="stylesheet" />
<link href="css/style.css" rel="stylesheet">
<link href="color/default.css" rel="stylesheet">
<link href="css/conflicts.css" rel="stylesheet">
<link href="libs/markers/markers.css" rel="stylesheet" type="text/css" />
<link href="libs/L.Control.Basemaps.css" rel="stylesheet" type="text/css" />
</head>

<body id="page-top" data-spy="scroll" data-target=".navbar-custom">
	
<?php
require_once('preloader.php');
require_once('navbar.php');
require_once('cover.php');
require_once('map.php');
require_once('services.php'); 
require_once('contact.php');

?>
    


	<footer>
		<div class="container">
			<div class="row">
				<div class="col-md-12 col-lg-12">
					<div class="wow shake" data-wow-delay="0.4s">
					<div class="page-scroll marginbot-30">
						<a href="#intro" id="totop" class="btn btn-circle">
							<i class="fa fa-angle-double-up animated"></i>
						</a>
					</div>
					</div>
					<p>&copy;<?php echo date('Y'); ?> Kiio Mbithi. </br> All rights reserved.</p>
				</div>
			</div>	
		</div>
	</footer>


    <script src="js/jquery.min.js"></script>
	<script src="js/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
    <script src="js/jquery.easing.min.js"></script>	
	<script src="js/jquery.scrollTo.js"></script>
	<script src="js/wow.min.js"></script>
	<script src="js/controller.js"></script>
	<script src="libs/leaflet/leaflet-src.js"></script>
	<script src='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js'></script>
	<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.js'></script>
	<script src="libs/markers/markers.js"></script>
	<script src="libs/markers/PruneCluster.js"></script>
	<script src="libs/L.Control.Basemaps-min.js"></script>
	<script src="libs/Leaflet.Control.Custom.js"></script>
	<script src="js/custom.js"></script>
	
</body>

</html>
