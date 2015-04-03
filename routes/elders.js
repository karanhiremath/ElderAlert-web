var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Elder = parse.Object.extend('Elder')
var Caretaker = parse.Object.extend('Caretaker')
var Geofence = require('./geofence');



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
                                            console.log("here")
                                            var caretaker_requests = elder.get("caretaker_requests");
                                            var elder_requests = caretaker.get("elder_requests");
                                            console.log(caretaker_requests)
                                            console.log(elder_requests)
                                            caretaker_requests.splice(caretaker_requests.indexOf(elderUsername),1)
                                            elder_requests.splice(elder_requests.indexOf(caretakerUsername),1)
                                            console.log(caretaker_requests)
                                            console.log(elder_requests)

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
                            user = elder.user
                            
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
                            elder.set("user",user)
                            elder.set("caretaker_requests",[])
                            elder.set("caretakers",[])
                            elder.set("geofences",[])
                            elder.set("locations",[])

                            elder.save(null, {
                                success: function(elder) {
                                    elder = elder.attributes
                                    user = elder.user
                                    res.render('elder',{
                                        user:user,
                                        elder:elder, error:""});
                                }
                            })    
                        }
                    }
                })
            }
        }
    })
})

router.post('/:username/updateGeofence', function(req, res){
    var username = req.params.username;
    console.log(username);
    var query = new parse.Query(parse.User);
    query.equalTo("username", username);
    query.first({
      success: function(user) {
        //use
        console.log(user);
        var geofence = Geofence.spawn(parseFloat(req.body.latitude), parseFloat(req.body.longitude), parseFloat(req.body.radius));
        user.set("geofence", geofence);
        user.set("name", "test2");
        user.save(null, {
            success: function(user) {
            // The object was saved successfully.
                console.log(user);
            },
            error: function(user, error) {
            console.log(error);
            }
        });
      },
      error: function(user, error) {

        console.log(error);
        res.send(500);
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
      }
    });
});

module.exports = router;