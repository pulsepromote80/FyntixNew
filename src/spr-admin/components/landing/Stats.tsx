"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { count: 10000, suffix: "+", label: "Active Traders" },
  { count: 50, suffix: "+", label: "Countries Reached" },
  { count: 24, suffix: "/7", label: "Platform Availability" },
  { count: 100, suffix: "%", label: "Transparent Records" },
];

export function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(
        stats.map((stat) => Math.floor(eased * stat.count))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCounts(stats.map((stat) => stat.count));
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible]);

  return (
    <section className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={index === 0 ? ref : null}
            >
              <span className="block text-5xl font-extrabold text-white mb-2">
                {counts[index]?.toLocaleString()}
                {stat.suffix}
              </span>
              <span className="text-white/90 text-base">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
