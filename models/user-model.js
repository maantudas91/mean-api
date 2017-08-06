const db = require('../db');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

//  mongoose.Promise = global.Promise;
//  mongoose.connect('localhost:27017/mean-api');


var userSchema = new mongoose.Schema({
    name : { type: String, required: true, trim :true },
    email : { type: String, required: true, unique: true, trim: true },
    password : { type: String,  required: true },
    image : { data: Buffer, contentType: String },
    profileImage : { type : String},
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

var User = db.model('User', userSchema);

module.exports = { User };