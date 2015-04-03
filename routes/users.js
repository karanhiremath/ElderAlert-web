var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Geofence = require('./geofence');

router.post('/signup', function(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;
  var username = req.body.username;
  var phone = req.body.phone;
  var role = req.body.role

  if (!email || !password || !username || !phone) {
    res.render('error',{error:"Please complete all required items"})
  }

  var user = new parse.User();
  user.set("email",email);
  user.set("password",password);
  user.set("username",username);
  user.set("phone",phone);
  user.set("role", role);

  user.signUp(null,{
    success: function(user){
        if (user.attributes.role == 'caretaker') {
            res.redirect("/caretakers/"+user.attributes.username+"/setupCaretaker");    
        }else if(user.attributes.role == 'elders') {
            res.redirect("/elders/"+user.attributes.username);    
        }
        
    },
    error: function(user,error){
        return res.render('error',{error:error})
    }
  })
  
});

router.get('/signup',function(req,res,next){
    res.render('signup')
})


router.post('/updateGeofence/:username', function(req, res){
    var username = req.params.username;
    console.log(username);
    var query = new parse.Query(parse.User);
    query.equalTo("username", username);
    query.first({
      success: function(user) {
        //use
        console.log(user);
        var geofence = Geofence.spawn(req.body.latitude, req.body.longitude, req.body.radius);
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
        })
      },
      error: function(user, error) {

        console.log(error);
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
      }
    })

});


router.post('/login', function(req,res,next){

    var username = req.body.username;
    var password = req.body.password;

    if(!username || !password) {
        res.render('login',{"error":"No username or password provided!"})
    }

    parse.User.logIn(username, password, {
        success: function(user) {
            if (req.is('json')) {
                
                return res.status(200).json({
                    payload:parse.User.current(),
                    session:parse.User.current()._sessionToken

                })
            }else {
                if(user.role=='caretaker'){
                    res.redirect(user.attributes.username);    
                }
                
            }
        },
        error: function(user,error){
            res.render('login',{"error":error})
        }
    })

})

router.get('/login', function(req,res,next){
    res.render('login',{"error":""});
})

router.get('/:username', function(req,res,next){
    var username = req.params.username
    var query = new parse.Query(parse.User);
    query.equalTo("username",username);
    query.find({
        success: function(user) {
            res.render('user',{user: user[0].attributes});
        }
    })
})


module.exports = router;
