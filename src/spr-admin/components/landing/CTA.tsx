"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-center">
      <div className="max-w-7xl mx-auto px-8">
        <div
          className={`max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : ""}`}
          ref={ref}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Trade With Us?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join a growing platform built on transparency, discipline, and
            long-term vision.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/about-us"
              className="px-8 py-3.5 rounded-lg font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
