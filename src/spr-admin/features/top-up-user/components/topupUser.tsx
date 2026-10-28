"use client";

import React, { useState } from "react";

export default function TopupUser() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [packageType, setPackageType] = useState("");
  const [isUserVerified, setIsUserVerified] = useState(false);

  // Instant User ID Validation 
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);

    if (value.trim().toLowerCase() === "test@gmail.com") {
      setIsUserVerified(true);
      setUserName("System Root");
    } else {
      setIsUserVerified(false);
      setUserName("");
    }
  };

  // Form validity check for Submit button
  const isFormValid = isUserVerified && amount.trim() !== "" && packageType !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    alert(`Topup Successful!\nUser: ${userName}\nAmount: $${amount}\nPackage: ${packageType}`);
  };

  return (
    // Full width + Cream Background + Full width
    <div className="w-full bg-[#FAF6EC] p-4 pt-4 pb-24 font-sans flex justify-center items-start">
      
      {/* Outer White Card - Full Width, Removed max-w-5xl */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
        
        {/* Title Section - KALKII Gold */}
        <div className="bg-[#D4AF37] px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">Topup User</h1>
          <p className="text-gray-800 text-xs mt-0.5">Enter user and topup details below</p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Inner Light Cream Box */}
          <div className="bg-[#FAF6EC]/60 border border-[#D4AF37]/20 rounded-xl p-6">
            <form onSubmit={handleSubmit}>
              
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Enter Userid */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Enter Userid
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder="Enter User ID"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                  />
                  {/* System Root appears in green if valid */}
                  {isUserVerified && (
                    <p className="text-xs text-green-600 font-medium mt-1 animate-in fade-in duration-300">
                      {userName}
                    </p>
                  )}
                </div>

                {/* 2. Enter Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Enter Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                  />
                </div>

                {/* 3. Package Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Package Type
                  </label>
                  <div className="relative">
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-gray-700"
                    >
                      <option value="" disabled>Select Package</option>
                      <option value="Zero pin Package">Zero pin Package</option>
                      <option value="Binary Power Package Upline">Binary Power Package Upline</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {/* Info text shows only when user is NOT verified */}
                  {!isUserVerified && (
                    <p className="text-xs text-[#D4AF37] mt-1 animate-in fade-in duration-300">
                      Please verify User ID first to Package Available
                    </p>
                  )}
                </div>

              </div>

              {/* Submit Button Section - Right Aligned */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-10 py-2.5 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}