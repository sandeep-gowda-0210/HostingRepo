const mongoose = require('mongoose')

const borrowSchema = new mongoose.Schema({
    username: String,
    bookid: { type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'Book' },
    duedate: { type: Date, default: () => new Date(+new Date() + 15 * 24 * 60 * 60 * 1000), required: "Must have due date" }
}, { timestamps: true })

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow;