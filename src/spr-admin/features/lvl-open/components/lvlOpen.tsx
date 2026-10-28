"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";

export default function OpenLevel() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  // Instant Validation 
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);

    if (value.trim().toLowerCase() === "test@gmail.com") {
      setIsValid(true);
      setUserName("System Root");
    } else {
      setIsValid(false);
      setUserName("");
      setIsLevelOpen(false); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    alert(`Level Open submitted for ${userName}`);
  };

  return (
    <div className="w-full bg-[#FAF6EC] p-4 pt-4 pb-24 font-sans flex justify-center items-start">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
        
        {/* Card Header - */}
        <div className="bg-[#D4AF37] px-6 py-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 mb-2">
            <Users className="w-6 h-6 text-gray-900" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Open Level</h1>
          <p className="text-gray-800 text-xs mt-0.5">Enable level for user</p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            
            {/* Inputs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  User ID *
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={handleUserIdChange}
                  placeholder="Enter User ID"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all ${
                    userId && !isValid ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {userId && !isValid && (
                  <p className="text-red-500 text-xs mt-1.5">User not found</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  User Name
                </label>
                <input
                  type="text"
                  disabled
                  value={userName}
                  placeholder="User Name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Checkbox (Shows only when valid ID is entered) */}
            {isValid && (
              <div className="flex items-center gap-2 mb-6 animate-in fade-in duration-300 p-3 rounded-lg bg-[#FFF9E6] border border-[#D4AF37]/30">
                <input
                  type="checkbox"
                  id="levelOpen"
                  checked={isLevelOpen}
                  onChange={(e) => setIsLevelOpen(e.target.checked)}
                  className="w-4 h-4 text-[#D4AF37] bg-gray-100 border-gray-300 rounded focus:ring-[#D4AF37] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="levelOpen" className="text-sm text-gray-700 cursor-pointer select-none">
                  Level Open
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 bg-[#D4AF37] text-gray-900 rounded-lg font-bold text-sm hover:bg-[#B89328] transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}