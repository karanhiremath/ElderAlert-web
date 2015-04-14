var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Alert = parse.Object.extend("Alert", {
  // Instance methods
    initialize: function (attrs, options) {
        this.seen = false;
        this.dismissed = false;
  }
}, {
  // Class methods
    spawn: function(message, type, elder_username, caretaker_username) {
        var alert = new Alert();
        alert.set("recipient", caretaker_username);
        alert.set("message", message);
        alert.set("type", type);
        alert.set("elder", elder_username);
        return alert;
    }
});

module.exports = Alert;