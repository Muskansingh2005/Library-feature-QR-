import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import LibrarianDashboard from "./pages/Librarian/Dashboard";
import AddBook from "./pages/Librarian/AddBook";
import ViewBooks from "./pages/Librarian/ViewBook";

import StudentDashboard from "./pages/Student/Dashboard";
import ScanQR from "./pages/Student/ScanQR";
import MyBooks from "./pages/Student/MyBooks";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-sky-50">
        <Routes>
          <Route path="/" element={<Navigate to="/librarian/dashboard" />} />

          <Route path="/librarian">
            <Route path="dashboard" element={<LibrarianDashboard />} />
            <Route path="add-book" element={<AddBook />} />
            <Route path="view-books" element={<ViewBooks />} />
          </Route>

          <Route path="/student">
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="scan-qr" element={<ScanQR />} />
            <Route path="my-books" element={<MyBooks />} />
          </Route>

        </Routes>
      </div>
    </div>
  );
}
