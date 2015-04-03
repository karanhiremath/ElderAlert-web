var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Geofence = parse.Object.extend("Geofence", {
  // Instance methods
  initialize: function (attrs, options) {
    this.location = new GeoPoint(0, 0);
    this.radius = 0;
  }
}, {
  // Class methods
 	create: function(latitude, longitude, radius) {
	    var geofence = new Geofence();
        geofence.set("location", new GeoPoint(latitude, longitude));
        geofence.set("radius", radius);
	    return geofence;
    }
});
