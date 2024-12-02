const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    name: String,
    author: String,
    genre: String,
    type: String,
    available: { type: Boolean, default: true },
}, { timestamps: true })

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;