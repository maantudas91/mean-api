"use strict";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect('localhost:27017/mean-api');

module.exports = db;