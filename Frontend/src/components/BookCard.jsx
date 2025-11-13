import React from "react";

export default function BookCard({ book, onViewQR }) {
    return (
        <div className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
                <div className="text-lg font-semibold">{book.title}</div>
                <div className="text-sm text-slate-500">{book.author} • ISBN: {book.isbn}</div>
                <div className="text-sm text-slate-500">Available: {book.availableCopies} / {book.totalCopies}</div>
            </div>
            <button
                onClick={() => onViewQR(book)}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
                View QR
            </button>
        </div>
    );
}
