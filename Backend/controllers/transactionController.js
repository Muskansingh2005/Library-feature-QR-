// [file name]: transactionController.js - ENHANCED
/**
 * Transaction Controller
 * ----------------------
 * Handles book issue and return operations with due dates and status tracking.
 */

import Transaction from "../models/Transaction.js";
import Book from "../models/Book.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

/**
 * @desc Issue a book to a student with due date
 * @route POST /api/transactions/issue
 * @access Public
 */
export const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    // Enhanced validation
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

    // Check if book is already issued to this student and not returned
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: "active",
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

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction and update book in parallel
    const [transaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "issue",
        dueDate,
        status: "active",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: -1 },
        },
        { new: true }
      ),
    ]);

    // Populate the response with student and book details
    await transaction.populate("studentId", "name rollNo email");
    await transaction.populate("bookId", "title author isbn");

    res.status(201).json({
      message: "Book issued successfully",
      transaction,
      dueDate: dueDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Issue book error:", error);
    next(error);
  }
};

/**
 * @desc Return a book and update status
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

    // Check if book is actually issued to this student and not returned
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: "active",
    });

    if (!activeIssue) {
      return res.status(400).json({
        message: "No active issue found for this book and student",
      });
    }

    // Create return transaction and update book
    const [returnTransaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "return",
        returnDate: new Date(),
        status: "returned",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: 1 },
        },
        { new: true }
      ),
      // Update the original issue transaction status
      Transaction.findByIdAndUpdate(activeIssue._id, {
        status: "returned",
        returnDate: new Date(),
      }),
    ]);

    await returnTransaction.populate("studentId", "name rollNo email");
    await returnTransaction.populate("bookId", "title author isbn");

    res.status(201).json({
      message: "Book returned successfully",
      transaction: returnTransaction,
    });
  } catch (error) {
    console.error("Return book error:", error);
    next(error);
  }
};

/**
 * @desc Get all transactions with enhanced filtering
 * @route GET /api/transactions
 * @access Public
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, studentId, bookId, type, status } = req.query;

    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (bookId) filter.bookId = bookId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 })
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

/**
 * @desc Get active issues for a student
 * @route GET /api/transactions/student/:studentId/active
 * @access Public
 */
export const getActiveStudentIssues = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const activeIssues = await Transaction.find({
      studentId,
      status: "active",
      type: "issue",
    })
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 });

    res.json({
      activeIssues,
      count: activeIssues.length,
    });
  } catch (error) {
    console.error("Get active issues error:", error);
    next(error);
  }
};
