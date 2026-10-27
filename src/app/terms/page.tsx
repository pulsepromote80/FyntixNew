import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Terms & Conditions | Kalkii",
  description:
    "Read Kalkii's Terms & Conditions for using our forex trading education platform.",
};

export default function TermsPage() {
  const sections = [
    {
      number: "01",
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using the Kalkii platform, you agree to be bound by
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
            Kalkii provides forex trading{" "}
            <strong className="text-white">education only</strong>. Nothing on
            this website constitutes:
          </p>
          <ul className="ml-2 list-inside list-disc space-y-2 text-gray-400">
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
        <ul className="ml-2 list-inside list-disc space-y-2 text-gray-400">
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
          Kalkii platform are the intellectual property of Kalkii and are
          protected by copyright laws. Unauthorized use is strictly prohibited.
        </p>
      ),
    },
    {
      number: "06",
      title: "Limitation of Liability",
      content: (
        <p>
          Kalkii shall not be held liable for any direct, indirect, incidental,
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
            href="mailto:support@kalkii.com"
            className="text-[#3B82F6] underline transition-colors hover:text-white"
          >
            support@kalkii.com
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-[#050505] px-6 pb-24 pt-32 text-[#F5F3EE] lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
              Legal
            </p>
            <h1 className="mb-6 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              Terms & Conditions
            </h1>
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <p className="text-sm leading-relaxed text-gray-400 md:text-base">
              Welcome to Kalkii. These Terms & Conditions govern your use of our
              forex trading education platform, courses, live sessions, and
              related services.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.number}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-white/20 md:p-8"
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Section {section.number}
                </p>
                <h2 className="mb-4 font-serif text-2xl text-[#F5F3EE] md:text-3xl">
                  {section.title}
                </h2>
                <div className="text-sm leading-relaxed text-gray-400 md:text-base">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-white/10 pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] transition-colors hover:text-white"
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
