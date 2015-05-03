var parse = require('parse').Parse;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('RzKFmwsc9CV7RgrQ-Gjrag');
var accountSid = 'AC63fffea0e8f061fd85c7ed34ef0f9ace'; 
var authToken = 'be674a7a36980655925266e71b991809';
var async = require('async'); 
 
//require the Twilio module and create a REST client 
var twilio_client = require('twilio')(accountSid, authToken); 
var User = parse.Object.extend('User');
var Caretaker = parse.Object.extend('Caretaker');
// A complex subclass of Parse.Object
var Alert = parse.Object.extend("Alert", {
  // Instance methods
    initialize: function (attrs, options) {
  }
}, {
  // Class methods
    spawn: function(message, type, elder_username, caretaker_usernames) {
      async.each(caretaker_usernames,
                    function(caretaker_username, callback){
                        // Call an asynchronous function, often a save() to DB
                        var alert = new Alert();
                        alert.set("recipient", caretaker_username);
                        alert.set("message", message);
                        alert.set("type", type);
                        alert.set("elder", elder_username);
                        alert.set("dismissed", false);
                        alert.set("seen", false);
                        alert.save();
                        var caretakerUsername = caretaker_username;
                        var caretakerIdQuery = new parse.Query(Caretaker)
                        caretakerIdQuery.equalTo("user.username",caretakerUsername);
                        caretakerIdQuery.find({
                            success: function(caretakers){
                                console.log("email sending to:");
                                if(caretakers.length > 0){
                                    var caretakerId = caretakers[0].id 
                                    var caretakerObjQuery = new parse.Query(Caretaker);
                                    caretakerObjQuery.get(caretakerId,{
                                        success: function(caretaker) {
                                            console.log("email sending to:" + caretaker_username);
                                            if(caretaker.get("email") == true){
                                              Alert.sendEmail(message, type, elder_username, caretaker_username);
                                            }
                                            if(caretaker.get("sms") == true){
                                              Alert.sendText(message, type, elder_username, caretaker_username);
                                            }
                                        }
                                    })
                                }
                            }
                        });
                        callback();
                    }, 


                    function(err) {

                    }
                );
    },
    sendText: function(message, type, elder_username, caretaker_username){
        var caretakerUsername = caretaker_username;
        var userIdQuery = new parse.Query(User)
        var caretakerEmail = "";
        userIdQuery.equalTo("username",caretakerUsername);
        userIdQuery.find({
            success: function(caretakers){
                
                if(caretakers.length > 0){
                    var caretakerId = caretakers[0].id 

                    var userObjQuery = new parse.Query(User);
                    userObjQuery.get(caretakerId,{
                        success: function(caretaker) {
                            caretakerEmail = caretaker.get("email");
                            caretakerPhone = caretaker.get("phone");
                            console.log(caretakerEmail);
                            twilio_client.messages.create({  
                              from: "+12407768175",
                              to: caretakerPhone,
                              body: "Alert from ElderAlert for "+elder_username+": "+message,    
                            }, function(err, message) { 
                              console.log(err); 
                            });
                        }
                    })
                }
            }
        });
    },
    sendEmail: function(message, type, elder_username, caretaker_username){
        var caretakerUsername = caretaker_username;
        var userIdQuery = new parse.Query(User)
        var caretakerEmail = "";
        userIdQuery.equalTo("username",caretakerUsername);
        userIdQuery.find({
            success: function(caretakers){
                if(caretakers.length > 0){
                    var caretakerId = caretakers[0].id 
                    var userObjQuery = new parse.Query(User);
                    userObjQuery.get(caretakerId,{
                        success: function(caretaker) {
                            caretakerEmail = caretaker.get("email");
                            console.log(caretakerEmail);
                            var message = {
                                "html":"<p>"+message+"</p>",
                                "text": message,
                                "subject": "Alert from ElderAlert for "+elder_username,
                                "from_email": "noreply@elderalert.com",
                                "from_name": "ElderAlert",
                                "to": [{
                                        "email": caretakerEmail,
                                        "name": caretaker_username,
                                        "type": "to"
                                    }],
                                "headers": {
                                    "Reply-To": "noreply@elderalert.com"
                                },
                                "important": false,
                                "track_opens": null,
                                "track_clicks": null,
                                "auto_text": null,
                                "auto_html": null,
                                "inline_css": null,
                                "url_strip_qs": null,
                                "preserve_recipients": null,
                                "view_content_link": null,
                                "tracking_domain": null,
                                "signing_domain": null,
                                "return_path_domain": null
                                
                            };
                            var async = false;
                            var ip_pool = "Main Pool";
                            mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
                                console.log(result);
                                /*
                                [{
                                        "email": "recipient.email@example.com",
                                        "status": "sent",
                                        "reject_reason": "hard-bounce",
                                        "_id": "abc123abc123abc123abc123abc123"
                                    }]
                                */
                            }, function(e) {
                                // Mandrill returns the error as an object with name and message keys
                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                            });
                            
                        }
                    });
                }
            }
        });
    },
});


module.exports = Alert;



                 
