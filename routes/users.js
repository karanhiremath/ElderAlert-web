var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

/* GET users listing. */
router.post('/signup', function(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;
  var username = req.body.username;
  var phone = req.body.phone;

  if (!email || !password || !username || !phone) {
    res.render('error',{error:"Please complete all required items"})
  }
  console.log("here")

  var user = new parse.User();
  user.set("email",email);
  user.set("password",password);
  user.set("username",username);
  user.set("phone",phone);

  user.signUp(null,{
    success: function(user){
        return user;
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
    console.log(req.body)

    var username = req.body.username;
    var password = req.body.password;

    if(!username || !password) {
        res.render('login',{"error":"No username or password provided!"})
    }

    parse.User.logIn(username, password, {
        success: function(user) {
            console.log(user)
            res.render('user',{user: user.attributes});
        },
        error: function(user,error){
            res.render('login',{"error":error})
        }
    })

})

router.get('/login', function(req,res,next){
    res.render('login',{"error":""});
})

module.exports = router;
