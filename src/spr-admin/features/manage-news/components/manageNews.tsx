"use client";

import React, { useState } from "react";
import { Newspaper, Search, ChevronLeft, ChevronRight, Pencil, X, Save } from "lucide-react";

export default function ManageNews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Static news data
  const newsList = [
    {
      sr: 1,
      news: "Introducing Roventar Trade & Roventar PMS\n\nWe are excited to introduce Roventar Trade and Roventar PMS — a next-generation trading ecosystem designed to combine technology, intelligent automation, and professional portfolio management.\n\nRoventar Trade delivers a modern trading experience with advanced tools, real-time market access, and technology-driven execution. Roventar PMS is designed to provide structured portfolio management supported by data-driven strategies, risk management, performance monitoring, and transparent reporting.\n\nTrade Smarter. Manage Better. Grow with Technology. Roventar — Building the Future of Intelligent Trading.",
      dateTime: "03/06/2026, 17:34",
    },
  ];

  const handleEdit = (news: string) => {
    setEditContent(news);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    alert("News updated successfully!");
    setIsModalOpen(false);
  };

  return (
    <div className="w-full bg-[#FAF6EC] px-4 pt-1 pb-4 font-sans flex justify-center items-start">
      <div className="w-full flex flex-col gap-5">

        {/* 1. Top Page Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm shrink-0">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit and manage news articles
            </p>
          </div>
        </div>

        {/* 2. Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">

          {/* Card Header */}
          <div className="bg-[#D4AF37] px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              News List
            </h2>
            <p className="text-gray-800 text-xs mt-1">
              View and edit news articles
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6">

            {/* Section Header with Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <h3 className="text-xl font-bold text-gray-900">News Articles</h3>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF6EC] border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    <th className="px-4 py-3 w-16 text-center">S.No</th>
                    <th className="px-4 py-3 text-center">News</th>
                    <th className="px-4 py-3 w-40 text-center">Date &amp; Time</th>
                    <th className="px-4 py-3 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700">
                  {newsList.map((item) => (
                    <tr
                      key={item.sr}
                      className="border-b border-gray-100 hover:bg-[#FFF9E6]/40 transition-colors"
                    >
                      <td className="px-4 py-5 text-center font-medium align-top">
                        {item.sr}
                      </td>
                      <td className="px-4 py-5 text-justify leading-relaxed whitespace-pre-line">
                        {item.news}
                      </td>
                      <td className="px-4 py-5 text-center align-top text-gray-600 whitespace-pre-line">
                        {item.dateTime.replace(", ", ",\n")}
                      </td>
                      <td className="px-4 py-5 text-center align-top">
                        <button
                          onClick={() => handleEdit(item.news)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-gray-900 rounded-full text-[11px] font-bold hover:bg-[#B89328] transition"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-end gap-4 mt-5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
              <div className="text-sm">1 - 1 of 1</div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50 disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ============ EDIT NEWS MODAL ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* Modal Box */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header - KALKII Gold */}
            <div className="bg-[#D4AF37] px-5 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit News
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-900 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-[#D4AF37]" /> News Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none bg-white leading-relaxed"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#D4AF37] text-gray-900 rounded-lg text-sm font-bold hover:bg-[#B89328] transition"
              >
                <Save className="w-4 h-4" />
                Update News
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}