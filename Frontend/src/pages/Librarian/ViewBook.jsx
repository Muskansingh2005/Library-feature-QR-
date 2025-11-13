import React, { useEffect, useState } from "react";
import API from "../../api/api";
import BookCard from "../../components/BookCard";
import toast from "react-hot-toast";

export default function ViewBooks() {
    const [books, setBooks] = useState([]);
    const [modalBook, setModalBook] = useState(null);

    useEffect(() => {
        API.get("/books")
            .then((res) => setBooks(res.data))
            .catch((err) => toast.error(err.message));
    }, []);

    const copyQrData = async (dataUrl) => {
        try {
            await navigator.clipboard.writeText(dataUrl);
            toast.success("QR data URL copied!");
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">View Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                    <BookCard key={book._id} book={book} onViewQR={setModalBook} />
                ))}
            </div>

            {modalBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
                        <h3 className="font-semibold mb-2">{modalBook.title} – QR Code</h3>
                        <img src={modalBook.qrData} alt="QR Code" className="w-64 h-64 mx-auto mb-4" />
                        <div className="space-x-2">
                            <button
                                onClick={() => copyQrData(modalBook.qrData)}
                                className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                            >
                                Copy QR Data URL
                            </button>
                            <a
                                href={modalBook.qrData}
                                download={`${modalBook.title}_QR.png`}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Download PNG
                            </a>
                        </div>
                        <button
                            onClick={() => setModalBook(null)}
                            className="mt-4 block mx-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
