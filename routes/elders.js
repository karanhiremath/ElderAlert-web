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
    })
})

module.exports = router;