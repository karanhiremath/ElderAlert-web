var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Geofence = parse.Object.extend("Geofence", {
  // Instance methods
  initialize: function (attrs, options) {
    this.location = new parse.GeoPoint();
    this.radius = 0;
  }
}, {
  // Class methods
  spawn: function(lat, lon, radius) {
        var geofence = new Geofence();
        geofence.set("location", new parse.GeoPoint({latitude: lat, longitude: lon}));
        geofence.set("radius", radius);
        return geofence;
    }
});

module.exports = Geofence;