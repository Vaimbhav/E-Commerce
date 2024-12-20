const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        min: [1, 'wrong min price'],
        max: [10000, 'wrong max price'],
    },
    discountPercentage: {
        type: Number,
        min: [1, 'wrong min discount'],
        max: [99, 'wrong max discount']
    },
    rating: {
        type: Number,
        min: [0, 'wrong min rating'],
        max: [5, 'wrong max price'],
        default: 0,
    },
    stock: {
        type: Number,
        min: [0, 'wrong min stock'],
        default: 0,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    colors: {
        type: [mongoose.Schema.Types.Mixed]
    },
    sizes: {
        type: [mongoose.Schema.Types.Mixed]
    },
    highlights: {
        type: [String],
    },
    discountedPrice: {
        type: Number,
    },
    deleted: {
        type: Boolean,
        default: false
    },
})


const virtualId = productSchema.virtual('id');
const virtualDiscountPrice = productSchema.virtual('discountPrice');


virtualId.get(function () {
    return this._id;
})

virtualDiscountPrice.get(function () {
    return Math.round(this.price * (1 - this.discountPercentage / 100));
})


productSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
})


module.exports = mongoose.model('Product', productSchema)