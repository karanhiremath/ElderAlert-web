var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Elder = parse.Object.extend('Elder')



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
                            console.log(user)
                            res.render('elder',{
                                user:user,
                                elder:elder})
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
                        caretakerIdQuery.equalTo("user.username",elderUsername);
                        caretakerIdQuery.find({
                            success: function(caretakers){
                                if(caretakers.length > 0){
                                    var caretakerId = caretakers[0].id 

                                    var caretakerObjQuery = new parse.Query(Caretaker);
                                    caretakerObjQuery.get(caretakerId,{
                                        success: function(caretaker) {
                                            var caretaker_requests = elder.get("caretaker_requests");
                                            var elder_requests = caretaker.get("elder_requests");
                                            console.log(caretaker_requests)
                                            console.log(elder_requests)
                                            caretaker_requests.splice(caretaker_requests.indexOf(elderUsername),1)
                                            elder_requests.splice(elder_requests.indexOf(caretakerUsername),1)
                                            console.log(caretaker_requests)
                                            console.log(elder_requests)

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

module.exports = router;