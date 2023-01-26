const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TradeSchema = new Schema({
    category: { type: String, required: [true, 'category is required'] },
    brand: { type: String, required: [true, 'brand name is required'] },
    name: { type: String, required: [true, 'Product name is required'] },
    details: { type: String, required: [true, 'details are required'] },
    img: { type: String, required: [true, 'img url is required'] },
    author: {type: Schema.Types.ObjectId, ref : 'User'},
    status: {type: String, default: 'Available'},
    tradeitem: {type: Schema.Types.ObjectId, ref : 'Trade', default: null},   
    trade_initiated: {type: Boolean, default:false}
    },
{timestamps: true}
);

// collection name is trades
module.exports = mongoose.model('Trade', TradeSchema);

