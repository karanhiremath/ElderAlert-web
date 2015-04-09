var geofences = {};
geofences['test'] = {
	center: new google.maps.LatLng(0.00,39.00)
};

var geofenceCircle;

function initialize() {
    var latlng = new google.maps.LatLng(0.00,39.00);
    var myOptions = {
        zoom: 9,
        center: latlng
    };

    var marker = new google.maps.Marker({
   		position: new google.maps.LatLng(0.00,39.00)
	});

    var map = new google.maps.Map(document.getElementById("current_map"),
            myOptions);

    marker.setMap(map);

    for ( var gf in geofences ){
    	var geofenceOptions = {
    		strokeColor: '#FF0000',
      		strokeOpacity: 0.8,
      		strokeWeight: 2,
      		fillColor: '#FF0000',
      		fillOpacity: 0.35,
      		map: map,
      		center: geofences[gf].center,
      		radius: 39.00 *1000
    	};
    	geofenceCircle = new google.maps.Circle(geofenceOptions);
    }

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		google.maps.event.trigger(map, 'resize');
		map.setCenter(latlng);
	});
  
}
google.maps.event.addDomListener(window, "load", initialize);

