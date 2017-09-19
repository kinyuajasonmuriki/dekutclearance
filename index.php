<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<title>Utility Monitor</title>
<meta name="description" content="GIS Based Utility Monitoring System For Optic Fibre Cables" >
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta nam="keywords" content="Network Utilities, Utility Monitor, GIS, Remote Sensing, Geography, Optical Fibre Cables, Benjamin Mbithi Kiio, Jason Muriki Kinyua" />
<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css">
<link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
<link href="css/animate.css" rel="stylesheet" />
<link href="css/style.css" rel="stylesheet">
<link href="color/default.css" rel="stylesheet">
<link href="css/conflicts.css" rel="stylesheet">
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
	<script src="js/bootstrap.min.js"></script>
    <script src="js/jquery.easing.min.js"></script>	
	<script src="js/jquery.scrollTo.js"></script>
	<script src="js/wow.min.js"></script>
    <script src="js/custom.js"></script>
	<script src="js/map.js"></script>
	<script type="text/javascript" src="http://maps.google.com/maps/api/js?key=AIzaSyC5oGUwT09nELrlGwrYOwJQj68yvSzUHGs&callback=connectMap"></script>
</body>

</html>
