"use client";

import React, { useState } from "react";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Info,
} from "lucide-react";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "RvrntrAdmin",
    userType: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "password123",
  });

  // Track which fields have been touched (to show errors only after user interacts)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // Required fields check
  const requiredFields = ["username", "userType", "firstName", "email", "mobile", "password"];
  const isFormValid = requiredFields.every(
    (field) => formData[field as keyof typeof formData].trim() !== ""
  );

  // Individual field validity (for showing red borders)
  const isFieldInvalid = (field: string) => {
    return touched[field] && formData[field as keyof typeof formData].trim() === "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched on submit attempt
    const allTouched: { [key: string]: boolean } = {};
    requiredFields.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);

    if (!isFormValid) {
      alert("Please fill all required fields!");
      return;
    }

    alert("Account created successfully!");
  };

  return (
    <div className="w-full bg-[#FAF6EC] px-4 pt-1 pb-4 font-sans flex justify-center items-start">
      <div className="w-full flex flex-col gap-5">

        {/* 1. Page Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37] text-gray-900 mb-3 shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
            Register new admin user for the platform
          </p>
        </div>

        {/* 2. Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">

          {/* Card Header */}
          <div className="bg-[#D4AF37] px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Registration Form
            </h2>
            <p className="text-gray-800 text-xs mt-1">
              Fill in the details to create a new admin account
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>

              {/* Row 1: Username & User Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter username"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                        isFieldInvalid("username") ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {isFieldInvalid("username") && (
                    <p className="text-red-500 text-xs mt-1">Username is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" /> User Type *
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full appearance-none pl-9 pr-9 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-gray-600 ${
                        isFieldInvalid("userType") ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="user">User</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {isFieldInvalid("userType") && (
                    <p className="text-red-500 text-xs mt-1">Please select a user type</p>
                  )}
                </div>
              </div>

              {/* Row 2: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter first name"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                        isFieldInvalid("firstName") ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {isFieldInvalid("firstName") && (
                    <p className="text-red-500 text-xs mt-1">First name is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Email & Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter email address"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                        isFieldInvalid("email") ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {isFieldInvalid("email") && (
                    <p className="text-red-500 text-xs mt-1">Email is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter mobile number"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                        isFieldInvalid("mobile") ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {isFieldInvalid("mobile") && (
                    <p className="text-red-500 text-xs mt-1">Mobile number is required</p>
                  )}
                </div>
              </div>

              {/* Row 4: Password */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password"
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white ${
                      isFieldInvalid("password") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isFieldInvalid("password") && (
                  <p className="text-red-500 text-xs mt-1">Password is required</p>
                )}
              </div>

              {/* Password Requirements Box */}
              <div className="mb-5 rounded-lg border border-gray-200 bg-[#FAF6EC]/60 p-4">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Password Requirements:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /> Minimum 8 characters
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /> At least one uppercase letter
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /> At least one lowercase letter
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /> At least one number
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /> At least one special character
                  </div>
                </div>
              </div>

              {/* Submit Button - Disabled when form is invalid */}
              <div>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. Important Information Box */}
        <div className="bg-[#FFF9E6] border border-[#D4AF37]/30 rounded-xl p-5 flex gap-4 w-full">
          <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-1.5">Important Information</h4>
            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
              <li>All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory</li>
              <li>Super Admin has full system access</li>
              <li>Admin has limited access to specific modules</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}