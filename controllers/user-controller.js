var express = require('express');
var app = express();
const _ = require('lodash');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var multer = require('multer');
var path = require('path');


const usermodel  = require("./../models/user-model");


// refering the storage for images
var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./uploads");
     },
     filename: function(req, file, callback) {
         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
     }
});







// register url route
var registerPost =  (req, res) => {
    var userData = req.body;
    usermodel.User.findOne({ email: userData.email }, function(err, user) {
        if(err) res.status(500).jsonp({ error: true, message : 'internal server error' });
        if(user){
            res.status(404).jsonp({ error: true , message : 'email already exists' });
        }else{
            var newuser = new usermodel.User(userData);
            newuser.save().then((doc) =>{
            res.status(201).jsonp({ success: 'user created', data : doc });
            },(e)=>{
                res.status(500).jsonp({ error: 'message' });
            });
        } 
    });
};


// Login route
var loginPost = (req, res) =>{
    //var userBody = _.pick(req.body,['email','password']);
    var userBody = req.body;
    // fetch user and test password verification
    usermodel.User.findOne({ email: userBody.email }, function(err, user) {
        if (err) res.status(500).jsonp({ error: true, message : 'internal server error' });
        
        if(!user){
           res.status(404).jsonp({ error: true , message : 'email does\'t match' });
        }else{
          // test a matching password
          user.comparePassword(userBody.password, function(err, isMatch) {
              if (err) {
                res.status(500).jsonp({ error: 'there r some issue' });
              }else if(isMatch == false){
                res.status(404).jsonp({ error: 'password doesn\'t match' });
              }else{
                var token = jwt.sign(user, 'superSecret', { expiresIn: '1h' });
                // return the information including token as JSON
                res.status(200).json({ success: true,message: 'Enjoy your token!',token: token, user : user });
              }
          });
        }
    });
};

var profile = (req, res) =>{
    var id = req.params.id;
    usermodel.User.findOne({ _id: id }, function(err, user) {
      if (err) res.status(500).jsonp({ error: true, message: "internal server error" });
      
      if(!user){
            res.status(404).jsonp({ error: true, message: "user not found" });
      }else{
        res.status(200).json({ success: true, message: 'user_found',user: user });
      }
    });
};

var profileImageUpload = (req, res) =>{

    //var userid = _.pick(req.body,['id']);
    //console.log(userid);
    usermodel.User.findOne({ _id: '5988abe626910b2030a5f4da'}, function(err, user) {
        if(err) {
          res.status(500).jsonp({ error: true ,message : 'user_not_found' });
        }else{

        var limits = { fileSize: 1024 * 1024 *1024 }
    var upload = multer({ 
              storage: Storage,
              limits: limits,
              fileFilter: function(req, file, callback) { 
                  var ext = path.extname(file.originalname)
                  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    //return callback(res.end('Only images are allowed'), null)
                    return res.status(500).jsonp({ error: false , message: 'image_allowed' });
                  }
                  callback(null, true)
		          }
           }).single('image'); 
           
          upload(req, res, function(err) {
              if (err) {
                  //res.status(500).jsonp({ error: 'message' });
                  return res.status(500).jsonp({ error: 'message' });
              }

              if(req.file !==  undefined){
                    user.profileImage = req.file.filename;
                    user.save(function(err) {
                      if(err){
                        return res.status(500).jsonp({ error: true , message: 'problem in saving the image' });
                      }else{
                        res.json({'fileName':req.file.originalname,'destination':req.file.filename});
                      }
                    });
                    
              }else{
                res.status(200).json({ success: true, message: 'Unable to Upload file' });
              }

              //console.log(res);
          });
        }

    });
    
};


module.exports = {
    registerPost,
    profile,
    loginPost,
    profileImageUpload
};




