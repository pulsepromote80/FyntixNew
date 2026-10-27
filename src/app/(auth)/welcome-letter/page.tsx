"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";
import { FaExclamationTriangle } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import { Loader2, Sparkles } from "lucide-react";

export default function WelcomeLetter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Get data from query params (passed from registration)
  const queryEmail = searchParams.get("email");
  const queryFirstName = searchParams.get("firstName");
  const queryLastName = searchParams.get("lastName");

  // Use query params if available, otherwise fallback to auth store
  const userName = queryFirstName
    ? `${queryFirstName} ${queryLastName || ""}`.trim()
    : user?.name?.split(" ")[0] || "User";
  const userEmail = queryEmail || user?.email || "Your registered email";

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      <div
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at top, #1a1038 0%, #0a0a1a 45%, #050510 100%)",
        }}
      >
        {/* Purple/blue glow from logo (top center) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Gold ambient glow (bottom corners) */}
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle gold grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
          <div className="w-full max-w-[530px]">
            {/* ═══ Main Card ═══ */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d4a017]/20 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl bg-[#0a0a1a]/70">

              {/* Gold gradient top bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a017]/40 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4a017]/40 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#d4a017]/40 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4a017]/40 rounded-br-2xl pointer-events-none" />

              <div className="p-6 sm:p-8 md:p-10">
                {/* ═══ Header ═══ */}
                <div className="flex flex-col items-center text-center mb-8">
                  <Link href="/" className="mb-5">
                    <Image
                      src="/logos/kalki-horizontal-logo.png"
                      alt="KALKII"
                      width={150}
                      height={64}
                      className="h-auto w-36 sm:w-44"
                    />
                  </Link>

                  {/* "WELCOME" badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 mb-4">
                    <Sparkles className="w-3 h-3 text-[#f5c451]" />
                    <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-[#f5c451] uppercase">
                      Welcome aboard
                    </span>
                  </div>

                  {/* Display heading */}
                  <h1
                    className="text-3xl sm:text-4xl font-bold tracking-wide uppercase"
                    style={{
                      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                      background: "linear-gradient(180deg, #f5c451 0%, #d4a017 60%, #b8860b 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Smart Earning Journey
                  </h1>

                  <p className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-slate-400">
                    The future is here
                  </p>
                </div>

                <div className="mb-8 space-y-4 text-start">
                  <p className="text-base leading-relaxed text-slate-300">
                    Welcome to Kalkii, {userName}!
                    <br />
                    We're thrilled to have you on board.
                  </p>
                  <p className="text-slate-400">
                    The future isn't coming — it's already here, and it's Agentic.
                    With Kalkii, you now have access to a powerful ecosystem
                    where AI agents work for you, generate consistent rewards, and
                    free up your time for what truly matters — your personal growth,
                    strategic planning, family moments, and much more.
                  </p>

                  <p className="text-base leading-relaxed text-slate-300">
                    🤖 Put Your Agents to Work.
                    <br></br>
                    Let them earn while you live smarter.
                  </p>
                  <p className="text-slate-400">
                    Kalkii isn't just a platform — it's your gateway into the
                    Agent Era, where wealth creation meets automation and innovation.
                  </p>

                  <p className="text-slate-400">
                    🛠️ Your Capital. Our Platform. Limitless Potential.
                    <br></br>
                    Together, we build a future where your money works smarter, and
                    you stay ahead.
                  </p>

                  <p className="text-slate-400">
                    Welcome aboard, {userName}. Let's create recurring income, passive yield, and real freedom — the Rentelligent way
                  </p>
                </div>

                <div className="p-5 mb-8 text-left border border-[#d4a017]/20 rounded-lg bg-[#0d0d20]/60">
                  <h3 className="mb-4 text-lg font-bold text-[#f5c451]">
                    Sign Into Your Account
                  </h3>
                  <div className="grid grid-cols-1 text-sm sm:grid-cols-3 gap-y-3 gap-x-16">
                    <div className="font-semibold text-slate-300">Email</div>
                    <div className="text-slate-400 sm:col-span-2">
                      {userEmail}
                    </div>
                  </div>
                </div>

                <p className="mb-8 text-sm leading-relaxed text-slate-400 sm:text-base text-start">
                  Congratulations! Your account has been successfully created. Check
                  your inbox for an email that includes your login details. Make sure
                  to store this email in a secure place. We appreciate your
                  registration!
                </p>

                <div className="flex flex-col space-y-1">
                  <Link href="/login">
                    <button
                      className="relative w-full py-3.5 rounded-lg font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-300 overflow-hidden group text-black"
                      style={{
                        background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                        boxShadow: "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      <span className="relative flex items-center justify-center gap-2">
                        <FiArrowLeft className="text-xl" />
                        Back to SignIn
                      </span>
                    </button>
                  </Link>

                  <div className="flex items-start gap-3 p-4 border-l-4 rounded-md bg-amber-500/10 border-amber-500/40">
                    <FaExclamationTriangle className="text-amber-500 text-xl mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-snug text-slate-400">
                      Please change your password after logging in for the first time
                      to ensure account security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
