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
            res.redirect("/caretakers/"+user.attributes.username+"/setup");    
        }else if(user.attributes.role == 'elders') {
            res.redirect("/elders/"+user.attributes.username+"/setup");    
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
                res.redirect(user.attributes.username);
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
            console.log(user[0].attributes)
            if(user.role == "elder") {
                res.redirect("/elders/"+user[0].attributes.username);    
            } else {
                res.redirect("/caretakers/"+user[0].attributes.username);    
            }
        }
    })
})


module.exports = router;
