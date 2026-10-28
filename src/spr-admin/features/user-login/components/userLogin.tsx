"use client";

import React, { useState } from "react";

export default function UserLoginSearch() {
  const [userId, setUserId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  // Search Logic 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (userId.trim().toLowerCase() === "test@gmail.com") {
      setIsVerified(true);
      setError("");
    } else {
      setIsVerified(false);
      setError("User not found");
    }
  };

  // Reset to Search state if user changes the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setIsVerified(false); 
    setError("");
  };

  return (
    <div className="w-full bg-[#FAF6EC] p-4 pt-4 pb-24 font-sans flex justify-center items-start">
      
      {/* Main Card  */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
        
        {/* Title Section */}
        <div className="bg-[#D4AF37] px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">User Login Search</h1>
          <p className="text-gray-800 text-xs mt-0.5">Search user to login</p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <form onSubmit={handleSearch}>
            {/* Input Section */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Enter User ID *
              </label>
              <input
                type="text"
                value={userId}
                onChange={handleInputChange}
                placeholder="Enter user ID to search..."
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1.5">{error}</p>
              )}
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className={`w-full font-bold py-3 rounded-lg transition-colors text-gray-900 ${
                isVerified
                  ? "bg-[#B89328] hover:bg-[#A68020]"   // Darker Gold on Verified (Login)
                  : "bg-[#D4AF37] hover:bg-[#B89328]"   // KALKII Gold on Search
              }`}
            >
              {isVerified ? "Login" : "Search"}
            </button>
          </form>

          {/* Success Box */}
          {isVerified && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 animate-in fade-in slide-in-from-top-3 duration-300">
              <h2 className="text-base font-bold text-green-800 mb-3 flex items-center gap-2">
                {/* Optional Check Icon for better look */}
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                User Verified Successfully!
              </h2>
              <div className="space-y-1.5 text-sm text-green-900">
                <p>
                  <span className="font-bold">Username:</span> Test@gmail.com
                </p>
                <p>
                  <span className="font-bold">Password:</span> Test@123
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}