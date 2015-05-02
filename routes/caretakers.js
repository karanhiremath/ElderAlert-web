var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Caretaker = parse.Object.extend('Caretaker')
var Elder = parse.Object.extend('Elder')
var Trip = parse.Object.extend('Trip');

var Alert = require('./alert');
var AlertQ = parse.Object.extend('Alert')
var User = parse.Object.extend('User')

var async = require("async");
var Location = require('./location');


router.post('/:username', function(req, res, next){
    
    var username = req.params.username;

    console.log("here")
    // if(!parse.User.current()) {
    //     res.redirect('/users/login');
    // }
    var caretaker = parse.User.current().attributes;

    if(caretaker.username != username) {
        res.render('caretaker',
            {
                user:caretaker,
                topError:"You do not have permission to view that caretaker!",
                addError:""
            });
    }
    caretaker = parse.User.current().attributes;
    
    var caretakerIdQuery = new parse.Query(Caretaker);
    caretakerIdQuery.equalTo("user.username",username);
    caretakerIdQuery.find({
        success: function(caretakers) {
            if(caretakers.length > 0) {
                var caretakerId = caretakers[0].id

                var caretakerObjQuery = new parse.Query(Caretaker);
                caretakerObjQuery.get(caretakerId,{
                    success: function(caretaker) {
                        var elderUsername = req.body.username;
                        var elderPhone = req.body.phone;

                        var elderIdQuery = new parse.Query(Elder);
                        elderIdQuery.equalTo("user.username",elderUsername);
                        elderIdQuery.equalTo("user.phone",elderPhone);
                        elderIdQuery.find({
                            success: function(elders) {
                                if(elders.length > 0) {
                                    var elderId = elders[0].id 

                                    var elderObjQuery = new parse.Query(Elder);
                                    elderObjQuery.get(elderId,{
                                        success: function(elder) {
                                            console.log(elder.get("user").username);
                                            console.log(caretaker.get("user").username);
                                            elder.addUnique("caretaker_requests",caretaker.get("user").username);
                                            caretaker.addUnique("elder_requests",elder.get("user").username);
                                            elder.save();
                                            caretaker.save();
                                        },
                                        error: function(elder, error){

                                        }
                                    })

                                }else {
                                    res.render('caretaker',
                                    {
                                        user:caretaker.get("user"),
                                        topError:"",
                                        addError:"Elder not found."
                                    });
                                }
                            }
                        });
                    },
                    error: function(caretaker,error) {

                    }
                });
            }
        }
    });
})

router.get('/:username', function(req,res,next){
    var username = req.params.username;
    var query = new parse.Query(parse.User);
    query.equalTo("username",username);
    query.find({
        success: function(user) {
            user = user[0].attributes
            var caretakerQuery = new parse.Query(Caretaker);
            caretakerQuery.equalTo("user",user);
            caretakerQuery.find({
                success: function(caretakers) {
                    if(caretakers[0]) {
                        
                        var caretaker = caretakers[0].attributes
                        if(req.get('Content-type')=="application/json"){
                                
                               return res.status(200).json({
                                    payload:caretaker,
                                })
                               
                        } else{
                            console.log(caretaker) 
                            var email = caretaker.email
                            var sms = caretaker.sms  
                            console.log(caretaker)
                            console.log(email)
                            console.log(sms) 
                            user = caretaker.user;
                            console.log(user)
                            elders = caretaker.elders;
                            console.log(elders)
                            var elder_requests = caretaker.elder_requests;
                            console.log(elder_requests)
                            res.render('caretaker',
                            {
                            user:user,
                            caretaker:caretaker,
                            email:email,
                            sms:sms,
                            elders:elders,
                            elder_requests: elder_requests,
                            topError:"",
                            addError:""
                            });
                        }
                    } else {
                        var caretaker = new Caretaker();
                        caretaker.set("user",user)
                        caretaker.set("elders",[])
                        caretaker.set("elder_requests",[])

                        caretaker.save(null, {
                            success: function(caretaker) {
                                var email = caretaker.email
                                var sms = caretaker.sms
                                console.log(caretaker)
                                console.log(email)
                                console.log(sms)
                                caretaker = caretaker.attributes
                                
                                elders = caretaker.elders
                                res.render('caretaker',
                                {
                                    user:user,
                                    caretaker:caretaker,
                                    email:email,
                                    sms:sms,
                                    elders:elders,
                                    topError:"",
                                    addError:""
                                });
                            } 
                        })
                    }
                }
            })
            // res.render('caretaker',{user:user, error:""});
        }
    })
})

router.get('/:username/getGeoData', function(req, res, next){
    var username = req.params.username;
    console.log(username);
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.include("geofence");
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var foundElder = elder.attributes;
                        console.log(foundElder)
                        var geofence = foundElder.geofence;
                        if(geofence !== undefined) {
                            var geofenceAtt = geofence.attributes;
                            var gfLat = geofence.get("location").latitude;
                            var gfLon = geofence.get("location").longitude;
                            var gfRadius = geofenceAtt.radius;
                        } else {
                            var gfLat = null;
                            var gfLon = null;
                            var gfRadius = null;
                        }
                        var mostRecentLoc = foundElder.mostRecentLocation;
                        var location_pointers = foundElder.locations;
                        var locations = [];
                        async.each(location_pointers,
                            function(location_pointer, callback){
                                // Call an asynchronous function, often a save() to DB
                                var locationQuery = new parse.Query(Location);
                                console.log("looking for location_pointers");
                                console.log(location_pointer.id);
                                locationQuery.equalTo("objectId", location_pointer.id);
                                locationQuery.find({
                                    success: function(location) {
                                        console.log("found a location");
                                        console.log(location);
                                        locations.push(location[0].attributes);
                                        callback();
                                    },
                                    error: function(error) {
                                        console.log("Error: " + error.code + " " + error.message);
                                        callback();
                                    }
                                });
                            },
                            function(err){
                                console.log(locations);
                                var geoData = {
                                    gfLat: gfLat,
                                    gfLon: gfLon,
                                    gfRadius: gfRadius,
                                    locations: locations,
                                    mostRecentLocation: mostRecentLoc
                                };
                                res.send(geoData);
                            }
                        );
                    },
                      error: function(user, error) {
                        console.log(error);
                        res.send(500);
                        // The object was not retrieved successfully.
                        // error is a Parse.Error with an error code and message.
                    }
                });
            }
        }
    });
})

router.post('/',function(req,res,next){
    console.log("HERE")
    var caretakers = req.body.caretakers;

    console.log(caretakers);

    console.log(caretakers[0])

    var query = new parse.Query(Caretaker);
    query.containedIn("user.username",caretakers);
    query.find({
        success: function(caretakers){
            console.log(caretakers)
            return res.status(200).json({
                payload:caretakers
            })
        }
    })
})

router.post('/:username/removeElder/', function(req, res, next){
    var elderUsername = req.body.elderUsername;
    var caretakerUsername = req.params.username;
    
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",elderUsername);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){

                var elderId = elders[0].id 

                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {

                        var caretakerIdQuery = new parse.Query(Caretaker)
                        caretakerIdQuery.equalTo("user.username",caretakerUsername);
                        caretakerIdQuery.find({
                            success: function(caretakers){
                                
                                if(caretakers.length > 0){
                                    var caretakerId = caretakers[0].id 

                                    var caretakerObjQuery = new parse.Query(Caretaker);
                                    caretakerObjQuery.get(caretakerId,{
                                        success: function(caretaker) {
                                            
                                            var elders= caretaker.get("elders");
                                            var caretakers = elder.get("caretakers");
                                            
                                            var elderIndex = elders.indexOf(elderUsername);

                                            if (elderIndex > -1){

                                                elders.splice(elderIndex,1);
                                                caretakers.splice(caretakers.indexOf(caretakerUsername),1);
                                                elder.set("caretaker",caretakers);
                                                caretaker.set("elders",elders);

                                                elder.save();
                                                caretaker.save();
                                                res.status(200).redirect('/caretakers/'+caretakerUsername);
                                            }
                                            else{ //TODO: redirect/show message that elder was not found
                                                res.render('caretaker',
                                                {
                                                    user:caretaker.get("user"),
                                                    topError:"",
                                                    addError:"Elder not found."
                                                });
                                               
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        }
    })
});

router.post('/:username/approveTripRequest/:tripId', function(req, res){
    var username = req.params.username;
    var tripId = req.params.tripId;
    console.log(username);
    var tripQuery = new parse.Query(Trip);
    tripQuery.get(tripId, {
        success: function(trip) {
            trip.set("approved", true);
            trip.save();
            res.status(200).redirect('back');
        },
        error: function(user, error){
            res.send(500);
            //trip not found
        }
    });
});

router.post('/:username/dismissAlert/:alertId', function(req,res) {
    var username = req.params.username;
    var alertId = req.params.alertId;

    var alertQuery = new parse.Query(AlertQ);
    alertQuery.get(alertId, {
        success: function(alert) {
            var elderUsername = alert.get("elder");
            var alertsQuery = new parse.Query(AlertQ);
            alertsQuery.find({
                success: function(alerts){
                    for(var i in alerts) {
                        var alertId2 = alerts[i].id 
                        var alertQueryAgain = new parse.Query(AlertQ);
                        alertQueryAgain.get(alertId2, {
                            success: function(alert2) {
                                alert2.set("dismissed", true);
                                alert2.save();
                            }
                        })
                    }
                    res.sendStatus(200)        
                }
            })
            
        }
    })
})

router.post('/:username/alertSettings', function(req, res){
    var sms = req.body.sms;
    var email = req.body.email;
    if(sms == "on"){
        sms = true;
    }
    else{
        sms = false;
    }
    if(email == "on"){
        email = true;
    }
    else{
        email = false;
    }
    var caretakerUsername = req.params.username;
    var caretakerIdQuery = new parse.Query(Caretaker)
    caretakerIdQuery.equalTo("user.username",caretakerUsername);
    caretakerIdQuery.find({
        success: function(caretakers){
            
            if(caretakers.length > 0){
                var caretakerId = caretakers[0].id 

                var caretakerObjQuery = new parse.Query(Caretaker);
                caretakerObjQuery.get(caretakerId,{
                    success: function(caretaker) {
                        caretaker.set("sms",sms);
                        caretaker.set("email",email);
                        caretaker.save();
                    }
                })
            }
        }
    });
                        
});


module.exports = router