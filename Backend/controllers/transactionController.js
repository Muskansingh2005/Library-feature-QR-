// [file name]: transactionController.js - UPDATED
/**
 * Transaction Controller
 * ----------------------
 * Handles book issue and return operations with improved validation.
 */

import Transaction from "../models/Transaction.js";
import Book from "../models/Book.js";
import Student from "../models/Student.js";

/**
 * @desc Issue a book to a student
 * @route POST /api/transactions/issue
 * @access Public
 */
export const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    // ✅ Enhanced validation
    if (!studentId || !bookId) {
      return res.status(400).json({
        message: "studentId and bookId are required",
      });
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        message: "Invalid studentId or bookId format",
      });
    }

    const [student, book] = await Promise.all([
      Student.findById(studentId),
      Book.findById(bookId),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if book is already issued to this student
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      type: "issue",
    });

    if (activeIssue) {
      return res.status(400).json({
        message: "Book is already issued to this student",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available to issue",
      });
    }

    // Create transaction and update book in parallel
    const [transaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "issue",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: -1 },
        },
        { new: true }
      ),
    ]);

    const updatedBook = await Book.findById(bookId);

    res.status(201).json({
      message: "Book issued successfully",
      transaction,
      updatedBook,
    });
  } catch (error) {
    console.error("Issue book error:", error);
    next(error);
  }
};

/**
 * @desc Return a book
 * @route POST /api/transactions/return
 * @access Public
 */
export const returnBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
      return res.status(400).json({
        message: "studentId and bookId are required",
      });
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        message: "Invalid studentId or bookId format",
      });
    }

    const [student, book] = await Promise.all([
      Student.findById(studentId),
      Book.findById(bookId),
    ]);

    if (!student || !book) {
      return res.status(404).json({
        message: "Student or Book not found",
      });
    }

    // Check if book is actually issued to this student
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      type: "issue",
    });

    if (!activeIssue) {
      return res.status(400).json({
        message: "This book is not issued to the student",
      });
    }

    // Create return transaction and update book
    const [transaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "return",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: 1 },
        },
        { new: true }
      ),
    ]);

    const updatedBook = await Book.findById(bookId);

    res.status(201).json({
      message: "Book returned successfully",
      transaction,
      updatedBook,
    });
  } catch (error) {
    console.error("Return book error:", error);
    next(error);
  }
};

/**
 * @desc Get all transactions with pagination
 * @route GET /api/transactions
 * @access Public
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, studentId, bookId } = req.query;

    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (bookId) filter.bookId = bookId;

    const transactions = await Transaction.find(filter)
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    next(error);
  }
};
