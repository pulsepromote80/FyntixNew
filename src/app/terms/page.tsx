import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions | Fyntix",
  description:
    "Read Fyntix's Terms & Conditions for using our forex trading education platform.",
};

export default function TermsPage() {
  const sections = [
    {
      number: "01",
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using the Fyntix platform, you agree to be bound by
          these Terms & Conditions. If you do not agree with any part of these
          terms, you must not use our services.
        </p>
      ),
    },
    {
      number: "02",
      title: "Educational Services Only",
      content: (
        <>
          <p className="mb-4">
            Fyntix provides forex trading{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              education only
            </strong>
            . Nothing on
            this website constitutes:
          </p>
          <ul className="ml-2 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
            <li>Investment advice or recommendations</li>
            <li>A promise or guarantee of returns</li>
            <li>A solicitation to buy or sell any financial instrument</li>
            <li>Personalized financial planning</li>
          </ul>
        </>
      ),
    },
    {
      number: "03",
      title: "Risk Disclosure",
      content: (
        <p>
          Trading forex involves substantial risk of loss. You should carefully
          consider your investment objectives, level of experience, and risk
          appetite. Never trade with capital you cannot afford to lose.
        </p>
      ),
    },
    {
      number: "04",
      title: "User Responsibilities",
      content: (
        <ul className="ml-2 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
          <li>Provide accurate registration information</li>
          <li>Maintain the confidentiality of your account credentials</li>
          <li>Use the platform in compliance with applicable laws</li>
          <li>Not share, resell, or redistribute course materials</li>
        </ul>
      ),
    },
    {
      number: "05",
      title: "Intellectual Property",
      content: (
        <p>
          All content, materials, videos, and educational resources on the
          Fyntix platform are the intellectual property of Fyntix and are
          protected by copyright laws. Unauthorized use is strictly prohibited.
        </p>
      ),
    },
    {
      number: "06",
      title: "Limitation of Liability",
      content: (
        <p>
          Fyntix shall not be held liable for any direct, indirect, incidental,
          or consequential damages arising from your use of our educational
          services or any trading decisions you make.
        </p>
      ),
    },
    {
      number: "07",
      title: "Modifications to Terms",
      content: (
        <p>
          We reserve the right to modify these Terms & Conditions at any time.
          Continued use of the platform after changes constitutes your
          acceptance of the revised terms.
        </p>
      ),
    },
    {
      number: "08",
      title: "Contact Information",
      content: (
        <p>
          For any questions regarding these Terms, please contact us at{" "}
          <a
            href="mailto:support@fyntix.com"
            className="text-blue-700 underline transition-colors hover:text-[#7d75ff] dark:text-[#25c6e8] dark:hover:text-[#7d75ff]"
          >
            support@fyntix.com
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <PublicNavbar />
      <main className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-4 pb-20 pt-24 text-slate-900 dark:from-[#0b1021] dark:via-[#0b1021] dark:to-[#171a36] sm:px-6 sm:pb-24 sm:pt-28 lg:px-16">
        <div className="pointer-events-none absolute -right-36 -top-32 z-0 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 z-0 h-[28rem] w-[28rem] rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-[#25c6e8]">
              Legal
            </p>
            <h1 className="text-gradient mb-6 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              Terms & Conditions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="relative mb-12 overflow-hidden rounded-2xl border border-blue-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65 md:p-8">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff]" />
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              Welcome to Fyntix. These Terms & Conditions govern your use of our
              forex trading education platform, courses, live sessions, and
              related services.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.number}
                className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-700/70 dark:bg-slate-900/65 dark:hover:border-blue-700 md:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] opacity-70" />
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-300">
                  Section {section.number}
                </p>
                <h2 className="mb-4 font-serif text-2xl text-slate-900 dark:text-white md:text-3xl">
                  {section.title}
                </h2>
                <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-blue-200 pt-8 dark:border-slate-700">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-[#7d75ff] dark:text-[#25c6e8] dark:hover:text-[#7d75ff]"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
