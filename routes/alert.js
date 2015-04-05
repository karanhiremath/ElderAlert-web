var parse = require('parse').Parse;

// A complex subclass of Parse.Object
var Alert = parse.Object.extend("Alert", {
  // Instance methods
    initialize: function (attrs, options) {
        this.seen = false;
        this.dismissed = false;
        this.message = "";
  }
}, {
  // Class methods
    spawn: function(message, type, elder_username, caretaker_username) {
        this.recipient = caretaker_username;
        this.message = message;
        this.type = type;
        this.elder = elder_username;
        this.seen = false;
        this.dismissed = false;
    }
});

module.exports = Alert;