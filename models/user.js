const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_account_number: {
        type: String,
        required: true
    },
    user_bank_code: {
        type: String,
        required: true
    },
    user_account_name: {
        type: String,
        required: true
    },
    is_verified: {
        type: Boolean,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('user', userSchema);