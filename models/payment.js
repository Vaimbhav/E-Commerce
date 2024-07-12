const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
    },
    razorpay_payment_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    }
}, {
    timestamps: true,
});


const virtual = paymentSchema.virtual('id');
virtual.get(function () {
    return this._id;
});
paymentSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

module.exports = mongoose.model('Payment', paymentSchema);