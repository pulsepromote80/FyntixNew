"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-lg z-50 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-8">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-xl">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></span>
          <span>KALKII</span>
        </Link>
        <div className={`flex gap-8 items-center md:flex ${isOpen ? "fixed top-16 left-0 right-0 bg-black/95 flex-col py-8 gap-4 md:static md:bg-transparent md:py-0" : "hidden md:flex"}`}>
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about-us" className="text-white/70 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/support" className="text-white/70 hover:text-white transition-colors">
            Support
          </Link>
          <Link href="/faq" className="text-white/70 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/contact-us" className="text-white/70 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <button
          className="md:hidden text-white text-2xl bg-none border-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
