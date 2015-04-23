var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Caretaker = parse.Object.extend('Caretaker')
var Elder = parse.Object.extend('Elder')

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
    var z = 0;
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
                            user = caretaker.user;
                            console.log(user)
                            elders = caretaker.elders;
                            console.log(elders)
                            var elder_requests = caretaker.elder_requests;
                            /*var geofenceData = {};
                            var elderMapData =[];
                            var geofence;
                            var geofenceAtt;
                            var gf_centerlat;
                            var gf_centerlon;
                            var gf_radius;
                            for (var i = 0; i < elders.length ; i++){
                                var elderIdQuery = new parse.Query(Elder);
                                var e = elders[i];
                                elderIdQuery.equalTo("user.username", e);
                                elderIdQuery.find({
                                    success: function(elders){
                                        if (elders.length > 0){
                                            var elderId = elders[0].id
                                            console.log("sucess found elderId: " + elderId)

                                            var elderObjQuery = new parse.Query(Elder);
                                            elderObjQuery.include("geofence");
                                            elderObjQuery.get(elderId, {
                                                success: function(elder){
                                                    var foundElder = elder.attributes;
                                                    console.log(foundElder)
                                                    console.log("queried elder username:" +elder.get("user").username);
                                                    geofence = foundElder.geofence;
                                                    geofenceAtt = geofence.attributes;
                                                    gf_centerlat = geofence.get("location").latitude;
                                                    gf_centerlon = geofence.get("location").longitude;
                                                    gf_radius = geofenceAtt.radius;
                                                    console.log("geofence center lat: "+gf_centerlat)
                                                    console.log("geofence center lon: "+gf_centerlon)
                                                    console.log("geofence radius: "+gf_radius)
                                                    geofenceData = {
                                                        gf_lat: gf_centerlat,
                                                        gf_lon: gf_centerlon,
                                                        gf_radius: gf_radius
                                                    };
                                                    //console.log(geofenceData)
                                                    elderMapData[i] = geofenceData;
                                                    console.log(elderMapData)
                                                    z++;
                                                    console.log(z)
                                                    if(z == elders.length){
                                                        res.render('caretaker',{
                                                            geofence_data: elderMapData
                                                        });
                                                    }
                                                },
                                                error:function(elder,error){}
                                            })
                                        } //if elders.length
                                    }//elderIdQuery
                                })//elderIdQuery.find
                            }//for elders.length*/
                            console.log(elder_requests)
                            res.render('caretaker',
                            {
                            user:user,
                            caretaker:caretaker,
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
                                caretaker = caretaker.attributes
                                console.log(caretaker)
                                elders = caretaker.elders
                                res.render('caretaker',
                                {
                                    user:user,
                                    caretaker:caretaker,
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
                        var geofenceAtt = geofence.attributes;
                        var gfLat = geofence.get("location").latitude;
                        var gfLon = geofence.get("location").longitude;
                        var gfRadius = geofenceAtt.radius;
                        var mostRecentLoc = foundElder.mostRecentLocation;
                        var locations = foundElder.locations;
                        var geoData = {
                            gfLat: gfLat,
                            gfLon: gfLon,
                            gfRadius: gfRadius,
                            locations: locations,
                            mostRecentLocation: mostRecentLoc
                        };
                        res.send(geoData);
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



module.exports = router