var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Elder = parse.Object.extend('Elder')
var Caretaker = parse.Object.extend('Caretaker')
var Geofence = require('./geofence');
var Location = require('./location');
var Alert = require('./alert');
var Trip = require('./trip');
var TripQ = parse.Object.extend('Trip');


router.post('/confirm', function(req,res,next){
    
    var elderUsername = req.body.elder;
    var caretakerUsername = req.body.caretaker;

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
                                            
                                            var caretaker_requests = elder.get("caretaker_requests");
                                            var elder_requests = caretaker.get("elder_requests");
                                            
                                            caretaker_requests.splice(caretaker_requests.indexOf(elderUsername),1)
                                            elder_requests.splice(elder_requests.indexOf(caretakerUsername),1)

                                            elder.addUnique("caretakers",caretakerUsername);
                                            caretaker.addUnique("elders",elderUsername);
                                            elder.set("caretaker_requests",caretaker_requests);
                                            caretaker.set("elder_requests",elder_requests);

                                            elder.save();
                                            caretaker.save();

                                            return res.send(200)
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
})

router.post('/:username', function(req, res, next){
    var username = req.params.username;
    console.log(username)

    //returns list of caretaker objects

})


router.get('/:username', function(req,res,next){
    console.log("got to elders.js");
    var username = req.params.username
    var query = new parse.Query(parse.User);
    query.equalTo("username",username);
    query.find({
        success: function(user) {
            if(user.length > 0){
                user = user[0].attributes
                
                var elderQuery = new parse.Query(Elder);
                elderQuery.equalTo("user",user);
                elderQuery.find({
                    success: function(elder) {
                        if (elder[0]){

                            elder = elder[0].attributes
                            console.log(elder)
                            user = elder.user
                            console.log(user)
                            if(req.get('Content-type')=="application/json"){
                               return res.status(200).json({
                                    payload:elder,
                                })
                            }else{
                                res.render('elder',{
                                user:user,
                                elder:elder})    
                            }
                            
                        }else {
                            var Elder = parse.Object.extend('Elder')

                            var elder = new Elder();
                            elder.set("user",user);
                            elder.set("caretaker_requests",[]);
                            elder.set("caretakers",[]);
                            elder.set("geofences",[]);
                            elder.set("locations",[]);
                            elder.set("timeLastMoved", Date.now());
                            elder.set("mostRecentLocation", new parse.GeoPoint({latitude:0, longitude:0}));

                            elder.save(null, {
                                success: function(elder) {
                                    console.log("elder saved successfully");
                                    elder = elder.attributes;
                                    user = elder.user
                                    res.render('elder',{
                                        user:user,
                                        elder:elder, error:""});
                                }, 
                                error: function(error) {
                                    console.log(error);
                                }
                            }); 
                        }
                    }
                });
            }
        }
    });
});

router.post('/:username/update', function(req,res){
    var username = req.params.username;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;

    console.log(username);
    console.log(latitude);
    console.log(longitude);

    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder){

                        var currentLocation = new parse.GeoPoint({latitude: parseFloat(latitude), longitude: parseFloat(longitude)});
                        if(checkLastLocation(elder, currentLocation)) {
                            elder.set("timeLastMoved", Date.now());
                            elder.set("mostRecentLocation", currentLocation);
                        }
                        var locationToAdd = Location.spawn(parseFloat(latitude), parseFloat(longitude));
                        elder.addUnique("locations", locationToAdd);
                        elder.save({
                            success: function(elder) {
                                tripsActive(elder, currentLocation); 
                                res.sendStatus(200);
                            },
                            error: function(elder, error) {
                                console.log("Error: " + error.code + " " + error.message);
                                res.sendStatus(500);
                            }

                        });
                    }
                });
            }
        }
    });
});

var checkLastLocation = function(elder, currentLocation) {
    console.log(currentLocation);
    console.log(elder.get("mostRecentLocation"));
    if(elder.get("mostRecentLocation") === null){
        return true;
    } else {
        var distance = currentLocation.milesTo(elder.get("mostRecentLocation"));
        if (distance > .001){
            return true;
        }
    }
    return false;
};

var formAlerts = function(elder, currentLocation) {
    var query = new parse.Query(Alert);
    query.equalTo("elder", elder.get("user").username);
    query.equalTo("dismissed", false);
    var geofenceAlertPresent = false;
    var noMotionAlertPresent = false;

    query.find({
        success: function(alerts) {
            for (var i = 0; i < alerts.length; i++) {
                if(alerts[i].attributes.type === "geofence-trespassed") {
                    geofenceAlertPresent = true;
                }
                if(alerts[i].attributes.type === "no-motion") {
                    noMotionAlertPresent = true;
                }
            }
            console.log("after iterating through results:");
            console.log(geofenceAlertPresent);
            console.log(noMotionAlertPresent);

            if(!geofenceAlertPresent) {
                checkForGeofenceAlert(elder, currentLocation);
            }

            if(!noMotionAlertPresent) {
                checkForNoMotionAlert(elder);
            }
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
};

var tripsActive = function(elder, currentLocation) {
    console.log("trips active function, checking now");
    var tripQuery = new parse.Query(Trip);
    tripQuery.equalTo("elderUsername", elder.get("user").username);
    tripQuery.equalTo("approved", true);
    tripQuery.find({
        success: function(trips) {
            console.log("found trips");
            for(var i in trips) {
                var trip = trips[i].attributes;
                console.log(trip.startDate);
                console.log(trip.endDate);
                if(Date.now() > trip.startDate && Date.now() < trip.endDate) {
                    console.log("found active trip");
                    console.log(true);
                    return true;
                }
            }
            formAlerts(elder, currentLocation);
        },
        error: function(error) {
        }
    });
};

var checkForNoMotionAlert = function(elder) {
    console.log(elder.get("timeLastMoved"));
    console.log(Date.now());
    if(Date.now() - elder.get("timeLastMoved") > 86,400,000) {
        console.log("alert - no motion");
        var alert = Alert.spawn("Elder has not moved in a day!", "no-motion", elder.get("user").username, elder.get("caretakers")[0]);
        alert.save();
    }
};

var checkForGeofenceAlert = function(elder, currentLocation){
    var geofence = elder.get("geofence");
    if(geofence !== undefined) {
        geofence.fetch({
            success: function(geofence) {
                var distance = currentLocation.milesTo(geofence.get("location"));
                console.log("distance" + distance);
                if(distance >= geofence.get("radius")) {
                    console.log("alert - Geofence!");
                    var alert = Alert.spawn("Elder out of geofence", "geofence-trespassed", elder.get("user").username, elder.get("caretakers")[0]);
                    alert.save();
                }
            }
        });
    }
};


router.post('/:username/updateGeofence', function(req, res){
    var username = req.params.username;
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var geofence = Geofence.spawn(parseFloat(req.body.latitude), parseFloat(req.body.longitude), parseFloat(req.body.radius));
                        elder.set("geofence", geofence);
                        elder.save();
                        res.send(200);
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
});

router.post('/:username/addTrip', function(req, res){
    var username = req.params.username;
    var tripName = req.body.tripName;
    var startDateStr = req.body.startDate;
    var endDateStr = req.body.endDate;
    var approved = Boolean(req.body.approved);
    var startDate = new Date(startDateStr);
    var endDate = new Date(endDateStr);
    console.log(username);
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var trip = Trip.spawn(elder.get("user").username, tripName, approved, startDate, endDate);
                        trip.save();
                        res.status(200).redirect('back');
                    },
                      error: function(user, error) {
                        console.log(error);
                        res.send(500);
                        // The object was not retrieved successfully.
                    }
                });
            }
        }
    });
});

router.get('/:username/getApprovedTrips', function(req,res){
    var username = req.params.username;
    console.log(username);
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var tripQuery = new parse.Query(TripQ);
                        tripQuery.equalTo("elderUsername", username);
                        tripQuery.equalTo("approved", true);
                        tripQuery.ascending("startDate");
                        tripQuery.find({
                            success:function(trips){
                                res.send(trips);
                            }
                        });
                    },
                      error: function(user, error) {
                        console.log(error);
                        res.send(500);//elder not found
                    }
                });
            }
        }
    }); 
});

router.get('/:username/getUpcomingTrips', function(req,res){
    var username = req.params.username;
    console.log(username);
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var tripQuery = new parse.Query(TripQ);
                        tripQuery.equalTo("elderUsername", username);
                        tripQuery.equalTo("approved", true);
                        var currentDate = new Date();
                        tripQuery.greaterThan("startDate", currentDate);
                        tripQuery.find({
                            success:function(trips){
                                res.send(trips);
                            }
                        });
                    },
                      error: function(user, error) {
                        console.log(error);
                        res.send(500);//elder not found
                    }
                });
            }
        }
    }); 
});

router.get('/:username/getTripRequests', function(req,res){
    var username = req.params.username;
    console.log(username);
    var elderIdQuery = new parse.Query(Elder);
    elderIdQuery.equalTo("user.username",username);
    elderIdQuery.find({
        success: function(elders) {
            if(elders.length > 0){
                var elderId = elders[0].id;
                var elderObjQuery = new parse.Query(Elder);
                elderObjQuery.get(elderId,{
                    success: function(elder) {
                        var tripQuery = new parse.Query(TripQ);
                        tripQuery.equalTo("elderUsername", username);
                        tripQuery.equalTo("approved", false);
                        tripQuery.ascending("startDate");
                        tripQuery.find({
                            success:function(trips){
                                res.send(trips);
                            }
                        });
                    },
                      error: function(user, error) {
                        console.log(error);
                        res.send(500);//elder not found
                    }
                });
            }
        }
    }); 
});

router.post('/:username/deleteTrip', function(req,res){
    var username = req.params.username;
    var tripName = req.body.tripName;

    var tripQuery = new parse.Query(TripQ);
    tripQuery.equalTo("elderUsername", username);
    tripQuery.find({
        success: function(trips){
            
            if(trips.length > 0){
                for(var i in trips){
                    var trip = trips[i].attributes

                    if(trip.tripName === tripName){
                        var tripQuery = new parse.Query(Trip);
                        console.log(trips[i].id)
                        tripQuery.get(trips[i].id,{
                            success: function(trip){
                                trip.destroy({
                                    success: function(trip){
                                        res.send(200).redirect('back');
                                    },
                                    error: function(trip, error){
                                        console.log(error);
                                        res.send(500);
                                    }
                                })
                            }
                        })
                    }
                }
            }
        },
        error: function(user, error) {
            console.log(error)
            res.send(500);
        }
    });
})


module.exports = router;