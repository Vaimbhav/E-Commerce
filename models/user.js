const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    addresses: {
        type: [mongoose.Schema.Types.Mixed]
    },
    name: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

const virtual = userSchema.virtual('id');
virtual.get(function () {
    return this._id;
});
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

module.exports = mongoose.model('User', userSchema);