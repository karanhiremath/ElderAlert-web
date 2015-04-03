var express = require('express');
var router = express.Router();
var parse = require('parse').Parse;

router.post('/:username/setupCaretaker', function(req, res, next){
    
    var elderUsername = req.body.username;
    var elderPhone = req.body.phone;

    var elderQuery = new parse.Query(parse.User);
    elderQuery.equalTo("username",elderUsername);
    elderQuery.equalTo("phone",elderPhone);
    elderQuery.find({
        success: function(elder) {
            console.log("here")
            
        },
        error: function(elder,err) {
            console.log("ERROR")
        }
    })
    
    
})

router.get('/:username/setupCaretaker', function(req,res,next){
    var username = req.params.username;
    var caretaker = parse.User.current();

    if (!caretaker) {
        res.redirect('/users/login');
    }

    console.log(req.params.username)
    var username = req.params.username
    var query = new parse.Query(parse.User);
    query.equalTo("username",username);
    query.find({
        success: function(user) {
            console.log(user)
            user = user[0].attributes

            res.render('setupCaretaker',{user:user, error:""});
        }
    })
})

module.exports = router