const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// -------------------- Task 6: Register a new user --------------------
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Add new user
  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User registered successfully" });
});


// -------------------- Task 1: Get the book list --------------------
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});


// -------------------- Task 2: Get book details based on ISBN --------------------
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// -------------------- Task 3: Get book details based on author --------------------
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(book => book.author === author);
  
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});


// -------------------- Task 4: Get books based on title --------------------
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
  
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});


// -------------------- Task 5: Get book reviews --------------------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});


// -------------------- Task 10: Get all books (Async/Await with Axios) --------------------
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


// -------------------- Task 11: Get book by ISBN (Promise style) --------------------
public_users.get('/async/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      res.status(200).send(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    });
});


// -------------------- Task 12: Get books by Author (Async/Await with Axios) --------------------
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});


// -------------------- Task 13: Get books by Title (Promise style) --------------------
public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      res.status(200).send(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});


module.exports.general = public_users;
