var express = require('express');
var app = express();
const _ = require('lodash');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var multer = require('multer');
var path = require('path');
const fs      = require('fs');
const fse     = require('fs-extra');
const mime    = require('mime');


const usermodel  = require("./../models/user-model");


// refering the storage for images
var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./uploads/");
     },
     filename: function(req, file, callback) {
         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
     }
});


// register url route
var registerPost =  (req, res) => {
    console.log(req);
    var userData = req.body.data;
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
    var userBody = req.body.data;
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
                    user.generateAuthToken().then((token) => {
                         res.status(200).json({ success: true,message: 'Enjoy your token!',token: token, user : user });
                    }).catch((e) => {
                        res.status(400).json({ success: false,message: 'some issue happened in database level'});
                    });
               
              }
          });
        }
    });
};

var profile = (req, res) =>{
    var user = _.pick(req.user,['email','name','profileImage','_id']);
    res.status(200).json({ success: true, message: 'user_found',user: user });
    // var id = req.params.id;
    // req.user.findOne({ _id: id }, function(err, user) {
    //   if (err) res.status(500).jsonp({ error: true, message: "internal server error" });
      
    //   if(!user){
    //         res.status(404).jsonp({ error: true, message: "user not found" });
    //   }else{
    //     res.status(200).json({ success: true, message: 'user_found',user: user });
    //   }
    // });
};

var profileImageUpload = (req, res) =>{
    //console.log(req.user);
    //var userid = _.pick(req.body,['id']);
    //console.log(userid);
    // usermodel.User.findOne({ _id: '5988abe626910b2030a5f4da'}, function(err, user) {
    //     if(err) {
    //       res.status(500).jsonp({ error: true ,message : 'user_not_found' });
    //     }else{

    //     var limits = { fileSize: 1024 * 1024 *1024 }
    // var upload = multer({ 
    //           storage: Storage,
    //           limits: limits,
    //           fileFilter: function(req, file, callback) { 
    //               var ext = path.extname(file.originalname)
    //               if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    //                 //return callback(res.end('Only images are allowed'), null)
    //                 return res.status(500).jsonp({ error: false , message: 'image_allowed' });
    //               }
    //               callback(null, true)
	// 	          }
    //        }).single('image'); 
           
    //       upload(req, res, function(err) {
    //           if (err) {
    //               //res.status(500).jsonp({ error: 'message' });
    //               return res.status(500).jsonp({ error: 'message' });
    //           }

    //           if(req.file !==  undefined){
    //                 user.profileImage = req.file.filename;
    //                 user.save(function(err) {
    //                   if(err){
    //                     return res.status(500).jsonp({ error: true , message: 'problem in saving the image' });
    //                   }else{
    //                     res.json({'fileName':req.file.originalname,'destination':req.file.filename});
    //                   }
    //                 });
                    
    //           }else{
    //             res.status(200).json({ success: true, message: 'Unable to Upload file' });
    //           }

    //           //console.log(res);
    //       });
    //     }

    //});

        var limits = { fileSize: 1024 * 1024 *1024 }
    var upload = multer({ 
              storage: Storage,
              limits: limits,
              fileFilter: function(req, file, callback) { 
                    let filetypes = /jpe?g|png/;
                    let mimetype = filetypes.test(file.mimetype);
                    let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
                  if (mimetype && extname) {
                    //return callback(res.end('Only images are allowed'), null)
                    //return res.status(500).jsonp({ error: false , message: 'image_allowed' });
                    return callback(null, true);
                  }
                    //callback(null, true);
                    return res.status(500).jsonp({ error: false , message: 'Only images are allowed' });
		          }
           }).single('image'); 

           upload(req, res, function(err) {
                if (err) {
                  res.status(500).jsonp({ error: 'message' });
                  return res.status(500).jsonp({ error: 'message' });
                  console.log(err);
                }
                if (req.file !== undefined) {
                    req.user.profileImage = req.file.filename;
                    req.user.save(function(err) {
                      if(err){
                        return res.status(500).jsonp({ error: true , message: 'problem in saving the image' });
                      }else{
                        res.status(201).json({'fileName':req.file.originalname,'destination':req.file.filename});
                      }
                    });
                }else{
                    res.status(200).json({ success: true, message: 'Unable to Upload file' });
                }

           });




    
};


var logout = (req, res) =>{
    req.user.removeToken(req.token).then(() => {
        return res.status(200).jsonp({ error: true , message: 'logout successfully' });
    }, () => {
        return res.status(500).jsonp({ error: true , message: 'logout failed' });
    });
}

var emailCheck = (req, res) =>{
    var email = req.query.email;
    usermodel.User.findOne({'email': email}).then((user) => {
        
        if(!user){
            return res.status(200).jsonp({ response : true, message : 'user not found'});
        }else{
            return res.status(200).jsonp({ response : false, message : 'user found'});
        }

    }).catch((err)=> { 
            return res.status(503).jsonp({ massage : 'Some internal error occured'});
    });
    
}

module.exports = {
    registerPost,
    profile,
    loginPost,
    profileImageUpload,
    emailCheck,
    logout
};




