var express = require('express');
var myRoutes = express.Router();
var authenticateRoute = express.Router();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens


authenticateRoute.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        jwt.verify(token, 'superSecret', function(err, decoded) {      
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;    
                next();
            }
        });
    }else {
        // if there is no token
        // return an error
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
    }
});


const userCntr = require("./controllers/user-controller");
//const aboutCntr = require("./controllers/about-controller");

// myRoutes.get('/',(req,res) =>{
//   res.render('home',{sucMsg : false, errors: req.session.errors});
//   //var user = new usermodel.User({name: 'Dipen Das',email: 'maantudas@gmail.com',password:123456});
//   //user.save();
// });

//myRoutes.get('/about', aboutCntr.getAbout);

//myRoutes.get('/register',userCntr.registerGet);
myRoutes.post('/register', userCntr.registerPost);
myRoutes.post('/login',  userCntr.loginPost);
myRoutes.get('/profile/:id', authenticateRoute, userCntr.profile);
myRoutes.post('/profile/upload', authenticateRoute, userCntr.profileImageUpload);

module.exports = myRoutes;