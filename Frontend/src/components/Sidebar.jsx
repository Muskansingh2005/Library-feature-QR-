import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="w-64 bg-white border-r">
            <div className="p-4 font-bold text-xl text-sky-800">Library App</div>
            <nav className="p-4 space-y-2">
                <div className="text-slate-600">Librarian</div>
                <NavLink to="/librarian/dashboard" className="block p-2 hover:bg-sky-100 rounded">Dashboard</NavLink>
                <NavLink to="/librarian/add-book" className="block p-2 hover:bg-sky-100 rounded">Add Book</NavLink>
                <NavLink to="/librarian/view-books" className="block p-2 hover:bg-sky-100 rounded">View Books</NavLink>

                <div className="mt-4 text-slate-600">Student</div>
                <NavLink to="/student/dashboard" className="block p-2 hover:bg-sky-100 rounded">Dashboard</NavLink>
                <NavLink to="/student/scan-qr" className="block p-2 hover:bg-sky-100 rounded">Scan QR</NavLink>
                <NavLink to="/student/my-books" className="block p-2 hover:bg-sky-100 rounded">My Books</NavLink>
            </nav>
        </div>
    );
}
