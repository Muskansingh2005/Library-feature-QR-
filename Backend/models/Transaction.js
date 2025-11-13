/**
 * Transaction Model
 * -----------------
 * Stores book issue/return history.
 */

import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  type: {
    type: String,
    enum: ["issue", "return"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", TransactionSchema);
