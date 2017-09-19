function connectMap(){
    var kicc = {lat: -1.28851, lng: 36.82302};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 9,
      center: kicc
    });
    var marker = new google.maps.Marker({
      position: kicc,
      map: map
    });

}