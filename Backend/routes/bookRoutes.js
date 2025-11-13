import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// ✅ Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Add new book
router.post("/", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: "Failed to add book", error: err.message });
  }
});

export default router;
