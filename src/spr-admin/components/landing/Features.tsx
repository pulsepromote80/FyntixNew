"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    num: "01 / TRANSPARENCY",
    title: "Clear by Design",
    description:
      "Every trade, every fee, every rule — visible, auditable, and explained in plain terms. No fine print, no hidden mechanics.",
  },
  {
    num: "02 / MARKETS",
    title: "Access That Feels Direct",
    description:
      "Clean access to the markets you care about, with tools that respect your time. No noise, no gimmicks — just a workspace built for people who actually trade.",
  },
  {
    num: "03 / DISCIPLINE",
    title: "Systems Over Speculation",
    description:
      "Structured tools, clear rules, and consistent execution. Kalkii is built for traders who treat the markets as a craft, not a lottery.",
  },
  {
    num: "04 / SECURITY",
    title: "Guarded at Every Layer",
    description:
      "From encrypted access to strict admin controls, security is not a feature — it is the foundation of everything we ship.",
  },
  {
    num: "05 / SUPPORT",
    title: "People, Not Bots",
    description:
      "Real humans answering real questions. Our support team is trained to guide, not deflect, so traders feel confident at every step.",
  },
  {
    num: "06 / VISION",
    title: "A Long-Term View",
    description:
      "Kalkii is not built for a season. Every product decision looks past the next quarter, toward a platform that lasts a generation.",
  },
];

export function Features() {
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
          Why Kalkii
        </span>
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Built on Principles, Not Promises
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white/5 p-8 rounded-xl border border-white/10 opacity-0 translate-y-8 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : ""}`}
              ref={index === 0 ? ref : null}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <div className="text-indigo-500 text-xs font-semibold tracking-widest mb-4">
                {feature.num}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-white/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
