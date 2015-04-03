var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

var Caretaker = parse.Object.extend('Caretaker')

router.post('/:username', function(req, res, next){
    
    var username = req.params.username;
    var caretaker = parse.User.current();

    var elderUsername = req.body.username;
    var elderPhone = req.body.phone;

    var elderQuery = new parse.Query(parse.User);
    elderQuery.equalTo("username",elderUsername);
    elderQuery.equalTo("phone",elderPhone);
    elderQuery.find({
        success: function(elder) {
            
            
        },
        error: function(elder,err) {
            console.log("ERROR")
        }
    })
    
    
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
            console.log(user)
            user = user[0].attributes



            res.render('caretaker',{user:user, error:""});
        }
    })
})

module.exports = router