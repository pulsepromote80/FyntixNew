import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | Fyntix",
  description:
    "Learn how Fyntix collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const sections = [
    {
      number: "01",
      title: "Information We Collect",
      content: (
        <>
          <p className="mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="ml-2 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
            <li>Name, email address, and phone number</li>
            <li>Account credentials and profile information</li>
            <li>Payment information for course enrollment</li>
            <li>Communication history with our support team</li>
            <li>Device and usage data (IP address, browser type)</li>
          </ul>
        </>
      ),
    },
    {
      number: "02",
      title: "How We Use Your Information",
      content: (
        <ul className="ml-2 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
          <li>To provide and maintain our educational services</li>
          <li>To process enrollments, payments, and refunds</li>
          <li>To communicate course updates and important notices</li>
          <li>To improve our platform, content, and user experience</li>
          <li>To comply with legal and regulatory obligations</li>
        </ul>
      ),
    },
    {
      number: "03",
      title: "Information Sharing",
      content: (
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share data with trusted service providers who assist
          us in operating our platform, subject to strict confidentiality
          agreements.
        </p>
      ),
    },
    {
      number: "04",
      title: "Data Security",
      content: (
        <p>
          We implement industry-standard security measures including
          encryption, secure servers, and access controls to protect your
          personal information from unauthorized access, alteration, or
          disclosure.
        </p>
      ),
    },
    {
      number: "05",
      title: "Cookies & Tracking",
      content: (
        <p>
          We use cookies and similar technologies to enhance your browsing
          experience, analyze site traffic, and personalize content. You can
          disable cookies through your browser settings.
        </p>
      ),
    },
    {
      number: "06",
      title: "Your Rights",
      content: (
        <ul className="ml-2 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
          <li>Access, update, or delete your personal information</li>
          <li>Opt-out of marketing communications</li>
          <li>Request a copy of your data</li>
          <li>Object to data processing in certain circumstances</li>
        </ul>
      ),
    },
    {
      number: "07",
      title: "Third-Party Links",
      content: (
        <p>
          Our platform may contain links to third-party websites. We are not
          responsible for the privacy practices of these external sites and
          encourage you to review their policies.
        </p>
      ),
    },
    {
      number: "08",
      title: "Contact Us",
      content: (
        <p>
          For privacy-related questions, contact us at{" "}
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
              Privacy Policy
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
              At Fyntix, your privacy is important to us. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
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
