var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;
var caretaker = require('./caretaker');
var elder = require('./elder');

var app = express()

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
            res.redirect(user.attributes.username+"/caretaker/setup");    
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


router.updateGeofence('/updateGeofence/:id', function(req, res){
    user_id = req.params.id;
    //todo: add query to get the elder associated with the id

    var currentUser = Parse.User.current();
    var geofence = new Geofence(req.body.latitude, req.body.longitude, req.body.radius);
    currentUser.set("geofence", geofence);
    currentUser.save(null, {
        success: function(user) {
        // The object was saved successfully.
        },
        error: function(user, error) {
        console.log(error);
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
            res.render('user',{user: user[0].attributes});
        }
    })
})

app.use('/:username/caretaker', caretaker)
app.use('/:username/elder', elder)

module.exports = router;
