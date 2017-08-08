const db = require('../db');
const mongoose = require('mongoose');


var productSchema = new mongoose.Schema({
    sku : { type: String, required: true, trim :true },
    name : { type: String, required: true, unique: true, trim: true },
    slug : { type: String, required: true, unique: true, trim: true },
    description : { type: String,  required: true },
    short_description : { type: String },
    stock_quantity : { type: number, required: true },
    stock_status : { type: String, enum : ['instock', 'outofstock'] , default: 'instock' },
    featured : { type : boolean, default: false },
    pricing: {
        price: { type : number },
        regular_price : { type : number },
        sale_price : { type : number }	 
    },
    product_details: {
        weight: number,
        width: number,
        height: number,
        depth: number
    },
    category_ids : { type : [Number], required : true},
    gallery_image_ids : { type : [String]},
    rating_counts : { type : [Number] },
    review_count : { type : number },
    createdAt : { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now }
});