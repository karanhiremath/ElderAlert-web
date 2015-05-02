var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Location = parse.Object.extend("Location", {
  // Instance methods
  initialize: function (attrs, options) {
    this.location = new parse.GeoPoint();
  }
}, {
  // Class methods
  spawn: function(lat, lon) {
        var location = new Location();
        location.set("geopoint", new parse.GeoPoint({latitude: lat, longitude: lon}));
        location.set("date", Date.now());
        return location;
    }
});

module.exports = Location;