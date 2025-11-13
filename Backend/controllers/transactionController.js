/**
 * Transaction Controller
 * ----------------------
 * Handles book issue and return operations with simple business logic.
 */

import Transaction from "../models/Transaction.js";
import Book from "../models/Book.js";
import Student from "../models/Student.js";

/**
 * @desc Issue a book to a student
 * @route POST /api/transactions/issue
 * @access Public
 *
 * Example Request:
 * {
 *   "studentId": "6733d0abc...",
 *   "bookId": "6733d0def..."
 * }
 *
 * Behavior:
 * - If book.availableCopies > 0 → issue the book
 * - Else → return 400 error
 */
export const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId)
      return res
        .status(400)
        .json({ message: "studentId and bookId are required" });

    const student = await Student.findById(studentId);
    const book = await Book.findById(bookId);

    if (!student || !book)
      return res.status(404).json({ message: "Student or Book not found" });

    if (book.availableCopies <= 0)
      return res.status(400).json({ message: "No copies available to issue" });

    // Create transaction
    const transaction = new Transaction({
      studentId,
      bookId,
      type: "issue",
    });

    // Decrement available copies
    book.availableCopies -= 1;

    // Save both
    await transaction.save();
    await book.save();

    res.status(201).json({
      message: "Book issued successfully",
      transaction,
      updatedBook: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Return a book
 * @route POST /api/transactions/return
 * @access Public
 *
 * Example Request:
 * {
 *   "studentId": "6733d0abc...",
 *   "bookId": "6733d0def..."
 * }
 *
 * Behavior:
 * - Create transaction type "return"
 * - Increment availableCopies
 */
export const returnBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId)
      return res
        .status(400)
        .json({ message: "studentId and bookId are required" });

    const student = await Student.findById(studentId);
    const book = await Book.findById(bookId);

    if (!student || !book)
      return res.status(404).json({ message: "Student or Book not found" });

    // Create transaction
    const transaction = new Transaction({
      studentId,
      bookId,
      type: "return",
    });

    // Increment available copies (but not above total)
    if (book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
    }

    await transaction.save();
    await book.save();

    res.status(201).json({
      message: "Book returned successfully",
      transaction,
      updatedBook: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all transactions
 * @route GET /api/transactions
 * @access Public
 *
 * Example Response:
 * [
 *   {
 *     "_id": "tx123",
 *     "studentId": { "name": "Aarav Patel", "rollNo": "BTECH001" },
 *     "bookId": { "title": "Clean Code" },
 *     "type": "issue",
 *     "date": "2025-11-12T10:00:00Z"
 *   }
 * ]
 */
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};
