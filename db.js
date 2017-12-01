"use strict";

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/mean-api');

module.exports = {mongoose};