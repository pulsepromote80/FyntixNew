import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy | Kalkii",
  description:
    "Learn how Kalkii collects, uses, and protects your personal information.",
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
          <ul className="ml-2 list-inside list-disc space-y-2 text-gray-400">
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
        <ul className="ml-2 list-inside list-disc space-y-2 text-gray-400">
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
        <ul className="ml-2 list-inside list-disc space-y-2 text-gray-400">
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
              Privacy Policy
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
              At Kalkii, your privacy is important to us. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
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
