import Link from "next/link";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] pt-20">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
          <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase block mb-4">
            A New Era of Trading
          </span>
          <h1 className="text-6xl font-extrabold text-white mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            KALKII
          </h1>
          <p className="text-3xl text-white/90 mb-6">Powering the Future of Wealth</p>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            A next-generation trading platform built for a new generation of
            self-directed traders. Transparent systems. Real tools. Disciplined
            execution. Every rule is written in plain language, every trade and
            transfer is traceable, and every trader has a clear view of where
            their account stands.
          </p>
          <div className="flex gap-4 justify-center mb-12">
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
          <div className="flex gap-4 justify-center flex-wrap">
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <strong className="text-indigo-500">256-bit</strong> Encrypted Access
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <strong className="text-indigo-500">24/7</strong> Human Support
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <strong className="text-indigo-500">100%</strong> Transparent Ledger
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
