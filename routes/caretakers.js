var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Caretaker = parse.Object.extend('Caretaker')
var Elder = parse.Object.extend('Elder')

router.post('/:username', function(req, res, next){
    
    var username = req.params.username;

    if(!parse.User.current()) {
        res.redirect('/users/login');
    }

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
                                        elder: function(elder, error){

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
    

    if (!parse.User.current()) {
        res.redirect('/users/login');
    }

    var caretaker = parse.User.current().attributes;
    if(caretaker.username != username) {
        res.render('caretaker',
            {
                user:caretaker,
                topError:"You do not have permission to view that caretaker!",
                addError:""
            });
    }
    var username = req.params.username
    var query = new parse.Query(parse.User);
    query.equalTo("username",username);
    query.find({
        success: function(user) {
            user = user[0].attributes


            var caretakerQuery = new parse.Query(Caretaker);
            caretakerQuery.equalTo("user",user);
            caretakerQuery.find({
                success: function(caretakers) {
                    if(caretakers[0]){
                        var caretaker = caretakers[0].attributes
                        if(req.get('Content-type')=="application/json"){
                                if(parse.User.current()) {
                                   return res.status(200).json({
                                        payload:user,
                                        session:parse.User.current()._sessionToken
                                    })
                               }
                        }else{
                            res.render('caretaker',
                            {
                                user:user,
                                caretaker:caretaker,
                                topError:"",
                                addError:""
                            });
                        }
                    }else {
                        var caretaker = new Caretaker();
                        caretaker.set("user",user)
                        caretaker.set("elders",[])
                        caretaker.set("elder_requests",[])

                        caretaker.save(null, {
                            success: function(caretaker) {
                                caretaker = caretaker.attributes
                                console.log(caretaker)
                                res.render('caretaker',
                                {
                                    user:user,
                                    caretaker:caretaker,
                                    topError:"",
                                    addError:""
                                });
                            } 
                        })
                    }
                }
            })


            res.render('caretaker',{user:user, error:""});
        }
    })
})

module.exports = router