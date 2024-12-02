const Book = require('../../model/bookShema')
const Borrow = require('../../model/borrowSchema')
const Return = require('../../model/returnSchema')

async function getBooks(req, res) {
    let books = await Book.find();
    res.json(books);
}
async function addBooks(req, res) {
    try {
        const bookdata = req.body;
        const book = new Book(bookdata)
        const data = await book.save()
        res.status(200).send(`Book Added successfully:\n\n ${data}`)
    }
    catch (err) {
        res.send(`failed to add  ${err.message}`)
    }
}
async function borrowBook(req, res) {
    try {
        const borrowdata = req.body;

        console.log(borrowdata);
        let availability = await Book.findById(borrowdata.bookid);
        console.log(availability);

        if (availability) {
            const borrow = new Borrow(borrowdata)
            const data = await borrow.save();
            res.status(200).send(`Book Borrowed successfully\n\n ${JSON.stringify(data)}`)
        }
        else {
            res.send("Book is not available")
        }
    }
    catch (err) {
        res.send(`borrowing failed  ${err.message}`)
    }
}
async function returnBook(req, res) {
    try {
        const returndata = req.body;
        const return_d = new Return(returndata)
        const data = await return_d.save();
        res.status(200).send(`Book returned successfully\n\n ${JSON.stringify(data)}`)
    }
    catch (err) {
        res.send(`return failed  ${err.message}`)
    }
}
async function deleteBook(req, res) {
    try {
        const id = req.params.id;
        const data = await Book.findByIdAndDelete(id);
        res.status(200).send(`Book deleted successfully\n\n ${JSON.stringify(data)}`)
    }
    catch (err) {
        res.send(`deletion failed  ${err.message}`)
    }
}
async function updateBook(req, res) {
    try {
        const id = req.params.id;
        const updatedata = req.body;

        const data = await Book.findByIdAndUpdate(id, updatedata);
        res.status(200).send(`Book returned successfully\n \n${JSON.stringify(data)}`)
    }
    catch (err) {
        res.send(`updation failed  ${err.message}`)
    }
}

module.exports = { getBooks, addBooks, borrowBook, returnBook, deleteBook, updateBook }