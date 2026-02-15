import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/anime" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Anime</h2>
          <p className="text-gray-600">Add, edit, or remove anime series.</p>
        </Link>
        <Link to="/admin/waifus" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Waifus</h2>
          <p className="text-gray-600">Add, edit, or remove waifus.</p>
        </Link>
      </div>
    </div>
  );
}