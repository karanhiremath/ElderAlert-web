var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Trip = parse.Object.extend("Trip", {
  // Instance methods
    initialize: function (attrs, options) {
  }
}, {
  // Class methods
    spawn: function(elder_username, trip_name, approved, start_date, end_date) {
        var trip = new Trip();
        trip.set("elderUsername", elder_username);
        trip.set("tripName", trip_name);
        trip.set("approved", approved);
        trip.set("startDate", start_date);
        trip.set("endDate", end_date);
        return trip;
    }
});

module.exports = Trip;