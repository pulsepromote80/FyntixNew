"use client";

import { useEffect, useRef, useState } from "react";

const securityItems = [
  {
    title: "Encrypted Access",
    description:
      "Every session and every credential is protected with modern encryption standards, so your account stays yours.",
  },
  {
    title: "Strict Admin Controls",
    description:
      "Administrative actions are logged, permissioned, and reviewed, keeping the platform accountable at every layer.",
  },
  {
    title: "Continuous Monitoring",
    description:
      "Systems are watched around the clock, so irregular activity is caught early and handled quickly.",
  },
];

export function Security() {
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
          Guarded at Every Layer
        </span>
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Security You Can Verify
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityItems.map((item, index) => (
            <div
              key={index}
              className={`opacity-0 translate-y-8 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : ""}`}
              ref={index === 0 ? ref : null}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {item.title}
              </h3>
              <p className="text-white/70 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
