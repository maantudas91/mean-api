var jwt    = require('jsonwebtoken');
var {User}  = require("./../models/user-model");


var autheticate = ((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  //console.log(token);
        if (token) {
            jwt.verify(token, 'superSecret', function(err, decoded) {
                //console.log(err);
                if (err) {
                    return res.status(503).json({ success: false, message: 'Failed to authenticate token.' });    
                } else {
                    // if everything is good, save to request for use in other routes
                    User.findByToken(token, decoded).then((user) => {
                        //console.log(user);
                        if (!user) {
                            return res.status(404).send({ success: false, message: 'user not found by this token.' });
                        }else{
                            req.user = user;
                            req.token = token;
                            req.decoded = decoded;    
                            next();
                        }
                    }).catch((e) => {
                        return res.status(403).send({ success: false, message: 'some issue is there.' });
                    });                   
                }
            })
        }else {
            // if there is no token
            // return an error
            return res.status(403).send({ success: false, message: 'No token provided.' });
        }
});


// var autheticate2 = ((req, res, next) => {
//     // check header or url parameters or post parameters for token
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
//     // decode token
//     if (token) {
//         jwt.verify(token, 'superSecret', function(err, decoded) {      
//             if (err) {
//                 return res.json({ success: false, message: 'Failed to authenticate token.' });    
//             } else {
//                 // if everything is good, save to request for use in other routes
//                 req.decoded = decoded;    
//                 next();
//             }
//         });
//     }else {
//         // if there is no token
//         // return an error
//         return res.status(403).send({ 
//             success: false, 
//             message: 'No token provided.' 
//         });
//     }
// });

module.exports = {
    autheticate,
    //autheticate2
}