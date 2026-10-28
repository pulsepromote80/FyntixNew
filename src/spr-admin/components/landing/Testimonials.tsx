"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "The transparency is what kept me here. I always know exactly where my account stands, down to the last detail.",
    author: "Trader Since 2023",
  },
  {
    quote:
      "Support actually helps. I never feel like I'm talking to a wall — real people, real answers, every time.",
    author: "Active Trader",
  },
  {
    quote:
      "Clean tools, disciplined execution, and no gimmicks. Exactly the kind of platform I was looking for.",
    author: "Early Adopter",
  },
];

export function Testimonials() {
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
    <section className="py-20 bg-[#0f0f23]">
      <div className="max-w-7xl mx-auto px-8">
        <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase block text-center mb-4">
          What Traders Say
        </span>
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Real Voices, Real Experiences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white/5 p-8 rounded-xl border border-white/10 opacity-0 translate-y-8 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : ""}`}
              ref={index === 0 ? ref : null}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <p className="text-white/90 italic leading-relaxed mb-6">
                {testimonial.quote}
              </p>
              <div className="text-indigo-500 font-semibold">
                {testimonial.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
