var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Alert = parse.Object.extend("Alert", {
  // Instance methods
    initialize: function (attrs, options) {
  }
}, {
  // Class methods
    spawn: function(message, type, elder_username, caretaker_username) {
        var alert = new Alert();
        alert.set("recipient", caretaker_username);
        alert.set("message", message);
        alert.set("type", type);
        alert.set("elder", elder_username);
        alert.set("dismissed", false);
        alert.set("seen", false);
        return alert;
    }

//Types of alerts:
// "geofence-trespassed"
// "no-motion"

});

module.exports = Alert;