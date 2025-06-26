const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type: {
        type: String, // 'credit' or 'debit'
        required: true,
        enum: ['credit', 'debit'],
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Includes createdAt timestamp
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;