const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Shared user list
let users = [];

// Export users for general.js registration reference
module.exports.users = users;

// Check if a user exists in the users array
const isValidUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  if (!isValidUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check credentials." });
  }

  // Create JWT payload and token
  let accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });

  // Save session authorization
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful!", accessToken });
});

// Add or Modify Book Review (logged-in user)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews if none exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update user’s review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// Delete a review by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required." });
  }

  if (!books[isbn] || !books[isbn].reviews) {
    return res.status(404).json({ message: "Book or reviews not found." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "User review deleted successfully." });
});

module.exports.authenticated = regd_users;
