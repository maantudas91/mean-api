var express = require('express');
var myRoutes = express.Router();


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

//myRoutes.get('/me', userCntr.profile);

module.exports = myRoutes;