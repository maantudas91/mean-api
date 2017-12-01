const db = require('../db');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

SALT_WORK_FACTOR = 10;


var userSchema = new mongoose.Schema({
    name : { type: String, required: true, trim :true },
    email : { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password : { type: String,  required: true },
    image : { data: Buffer, contentType: String },
    profileImage : { type : String},
    tokens: [{
                access: {
                    type: String,
                    required: true
                },
                token: {
                    type: String,
                    required: true
                }
    }],
    createdAt : { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now }
});


userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'superSecret',{ expiresIn: '1h' }).toString();
  //var token = jwt.sign(user, 'superSecret', { expiresIn: '1h' });

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

userSchema.statics.findByToken = function (token,decoded) {
    //console.log(decoded.$__.id);
  var User = this;
  //var decoded;

    //   try {
    //     decoded = jwt.verify(token, 'superSecret');
    //   } catch (e) {
    //     return Promise.reject();
    //   }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

userSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

var User = mongoose.model('User', userSchema);

module.exports = { User };