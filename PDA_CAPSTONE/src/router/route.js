
const express = require("express");
const { getUsers, addUser } = require('../controllers/user.js')
const { getBooks, addBooks, borrowBook, returnBook, updateBook, deleteBook } = require('../controllers/book.js')
const { login, logout, authenticate } = require('../authentication/auth.js')
let router = express.Router();

router.route("/login").post(login);
router.route("/users").get(authenticate, getUsers);
router.route("/users").post(addUser);
router.route("/books").get(authenticate, getBooks);
router.route("/books").post(authenticate, addBooks);
router.route("/books/:id").put(authenticate, updateBook);
router.route("/books/:id").delete(authenticate, deleteBook);
router.route("/books/borrow").post(borrowBook);
router.route("/books/return").post(returnBook);
router.route("/books/delete").post(getBooks);
router.route("/logout").post(authenticate, logout);


module.exports = router;
