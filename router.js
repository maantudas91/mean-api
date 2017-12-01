var express = require('express');
var myRoutes = express.Router();
var authenticateRoute = express.Router();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const middleware = require('./middleware/middleware');

authenticateRoute.use(middleware.autheticate);

const userCntr = require("./controllers/user-controller");

// routings
myRoutes.post('/register', userCntr.registerPost);
myRoutes.post('/login',  userCntr.loginPost);
myRoutes.get('/logout',  authenticateRoute, userCntr.logout);
myRoutes.get('/profile/:id', authenticateRoute, userCntr.profile);
myRoutes.post('/profile/upload', authenticateRoute, userCntr.profileImageUpload);
myRoutes.delete('/me/logout', authenticateRoute, userCntr.logout);
myRoutes.get('/email/check', userCntr.emailCheck);


module.exports = myRoutes;