const mongoose = require('mongoose')

const returnSchema = new mongoose.Schema({
    username: String,
    bookid: { type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'Book' },
    duedate: { type: Date, ref: 'BorrowSchema' },
    fine: Number
}, { timestamps: true })

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;