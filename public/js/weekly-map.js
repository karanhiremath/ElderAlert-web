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

    var map = new google.maps.Map(document.getElementById("weekly_map"),
            myOptions);

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

    var weeklyPathCoords = [
      new google.maps.LatLng(0.0, 39.00),
      new google.maps.LatLng(0.13, 39.05),
      new google.maps.LatLng(0.138, 39.15),
      new google.maps.LatLng(0.14, 39.35),
      new google.maps.LatLng(0.2, 39.5),
      new google.maps.LatLng(0.186, 39.63),
      new google.maps.LatLng(0.143, 39.42),
      new google.maps.LatLng(0.14, 39.35),
      new google.maps.LatLng(0.138, 39.32)
    ];

    var weeklyPath = new google.maps.Polyline({
      path: weeklyPathCoords,
      geodesic: true,
      strokeColor: '#009ED9',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

  weeklyPath.setMap(map);

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    google.maps.event.trigger(map, 'resize');
    map.setCenter(latlng);
  });
  
}
google.maps.event.addDomListener(window, "load", initialize);



