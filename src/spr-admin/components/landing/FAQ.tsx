"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Is Kalkii secure?",
    a: "Yes. We use encrypted access, strict admin controls, and continuous monitoring to protect every trader's account.",
  },
  {
    q: "How do I get started on Kalkii?",
    a: "Create an account, complete verification, add funds, and you're ready to explore the markets and place your first trade.",
  },
  {
    q: "What support is available?",
    a: "Our support team is available around the clock to help with account, verification, deposits, withdrawals, or general platform questions.",
  },
  {
    q: "Can I track my trades and account activity?",
    a: "Yes. Your dashboard gives you full, real-time visibility into your account, open positions, and complete trade history.",
  },
  {
    q: "Does Kalkii give trading advice?",
    a: "No. Kalkii is a self-directed trading platform. We provide the tools, data, and execution — every trade decision is yours to make.",
  },
];

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDetailsElement>(null);

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
          Questions
        </span>
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className={`bg-white/5 border border-white/10 rounded-lg mb-4 opacity-0 transition-all duration-600 ${isVisible ? "opacity-100" : ""}`}
              ref={index === 0 ? ref : null}
            >
              <summary className="px-6 py-4 cursor-pointer text-white font-semibold list-none flex justify-between items-center">
                {faq.q}
                <span className="text-2xl text-indigo-500 transition-transform duration-300 open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-4 text-white/70 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
