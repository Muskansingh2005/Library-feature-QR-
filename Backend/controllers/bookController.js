/**
 * Book Controller
 * ---------------
 * Contains CRUD operations for Book model and integrates QR code generation.
 */

import Book from "../models/Book.js";
import { generateQRCode } from "../utils/qrGenerator.js";

/**
 * @desc Create a new book and generate its QR code.
 * @route POST /api/books
 * @access Public
 *
 * Example Request Body:
 * {
 *   "title": "Python Crash Course",
 *   "author": "Eric Matthes",
 *   "isbn": "9781593279288",
 *   "description": "Hands-on Python intro",
 *   "totalCopies": 5
 * }
 */
export const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, description, totalCopies } = req.body;

    if (!title || !totalCopies)
      return res
        .status(400)
        .json({ message: "Title and totalCopies are required" });

    const book = new Book({
      title,
      author,
      isbn,
      description,
      totalCopies,
      availableCopies: totalCopies,
    });

    await book.save();

    // Generate QR code based on the book ID
    const qrDataUrl = await generateQRCode(book._id.toString());
    book.qrData = qrDataUrl;
    await book.save();

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all books
 * @route GET /api/books
 * @access Public
 *
 * Example Response:
 * [
 *   {
 *     "_id": "abc123",
 *     "title": "Clean Code",
 *     "author": "Robert Martin",
 *     "qrData": "data:image/png;base64,..."
 *   }
 * ]
 */
export const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get a single book by ID
 * @route GET /api/books/:id
 * @access Public
 */
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update book details
 * @route PUT /api/books/:id
 * @access Public
 *
 * Example Request Body:
 * {
 *   "title": "Updated Book",
 *   "author": "New Author",
 *   "regenerateQR": true
 * }
 */
export const updateBook = async (req, res, next) => {
  try {
    const { regenerateQR, ...updates } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    Object.assign(book, updates);

    // Regenerate QR only if explicitly requested
    if (regenerateQR === true) {
      book.qrData = await generateQRCode(book._id.toString());
    }

    await book.save();
    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a book
 * @route DELETE /api/books/:id
 * @access Public
 */
export const deleteBook = async (req, res, next) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    next(error);
  }
};
