"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "STEP 01",
    title: "Create Your Account",
    description:
      "Sign up in minutes with a secure, verified registration process designed to protect every trader from day one.",
  },
  {
    num: "STEP 02",
    title: "Explore the Platform",
    description:
      "Get familiar with the markets, charts, and tools before you commit real capital. Every detail is documented and easy to find.",
  },
  {
    num: "STEP 03",
    title: "Fund & Explore Markets",
    description:
      "Add funds securely, browse available markets, and use the platform's tools to shape your own approach.",
  },
  {
    num: "STEP 04",
    title: "Trade & Track",
    description:
      "Place your trades, manage your positions, and review your full history in real time — transparent records at every step.",
  },
];

export function Process() {
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
    <section className="py-20 bg-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-8">
        <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase block text-center mb-4">
          Getting Started
        </span>
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          How Kalkii Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`opacity-0 translate-y-8 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : ""}`}
              ref={index === 0 ? ref : null}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <div className="text-indigo-500 text-xs font-semibold tracking-widest mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
