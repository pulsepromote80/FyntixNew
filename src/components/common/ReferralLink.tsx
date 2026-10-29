"use client";

import { FiCopy, FiHelpCircle } from "react-icons/fi";
import { Link as LinkIcon } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";

const ReferralLink = () => {
  const { user } = useAuthStore();
  const { data: dashboardData } = useDashboardSummary();
  const authLogin = dashboardData?.data?.[0]?.AuthLogin || user?.email || "user123";
  const referralLink = `https://fyntix.club/register?RefID=${authLogin}`;

  const handleCopyClick = () => {
    const fullMessage = `🚀 𝐉𝐨𝐢𝐧 Kalikii – 𝐄𝐦𝐩𝐨𝐰𝐞𝐫𝐢𝐧𝐠 𝐭𝐡𝐞 𝐅𝐮𝐭𝐮𝐫𝐞 𝐨𝐟 𝐓𝐫𝐚𝐝𝐢𝐧𝐠.
     Start your trading journey today and explore exciting market opportunities. Sign up using my referral link and unlock exclusive rewards:
👉 ${referralLink}`;
    navigator.clipboard
      .writeText(fullMessage)
      .then(() => {
        toast.success("Referral message copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("copied to clipboard!");
  };

  return (
    <div className="relative z-10">
      <div className="w-full max-w-xl mx-auto space-y-8 text-white rounded-2xl">
        {/* Referral Box */}
        <div className="rounded-lg border border-blue-300/70 bg-gradient-to-br from-[#1680ff] via-[#25c6e8] to-[#7d75ff] p-4 shadow-inner dark:border-blue-500/30">
          <div className="flex items-center gap-2">
            <p className="relative z-10 text-sm font-semibold text-white">
              Your Referral Link
            </p>
            <button
              onClick={handleCopy}
              className="relative rounded-md p-1 text-white transition-colors hover:bg-white/15"
            >
              <FiCopy className="" />
            </button>
          </div>
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              readOnly
              value={referralLink}
              onClick={() => {
                window.open(referralLink, "_blank");
              }}
              className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg cursor-pointer sm:flex-1 focus:outline-none"
            />
            <button
              onClick={handleCopyClick}
              className="flex items-center justify-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              <LinkIcon size={16} />
              Copy
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 p-5 text-sm text-gray-800 shadow-inner dark:border-blue-800/60 dark:from-slate-900 dark:via-blue-950/40 dark:to-violet-950/30 dark:text-gray-100 sm:text-base">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1680ff] via-[#25c6e8] to-[#7d75ff] font-bold text-white">
              <FiHelpCircle className="text-lg" />
            </div>
            <p className="font-semibold text-blue-800 dark:text-cyan-200">How Referrals Work</p>
          </div>
          <ul className="mt-1 list-disc list-inside lg:ml-5">
            <li className="text-sm text-slate-700 dark:text-slate-300">
              Share your unique referral link
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300">
              Friends sign up and activate their accounts
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300">
              You both earn commissions and bonuses
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300">
              Grow your network for more rewards
            </li>
          </ul>
        </div>
        <div className="mt-2">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `*AI is the future – and you can profit from it today!*
Join Kalikii using my referral link: ${referralLink} Earn rewards by leasing AI agents. Don't miss out!`
            )}&media=${encodeURIComponent(
              "https://imagedelivery.net/nq9qT5FHZv9Sg48UUnD1-A/6db933b4-d8e8-4cb4-f94d-5ff7533aba00/public"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#25D366] hover:bg-[#25D366]/90 focus:ring-4 focus:outline-none focus:ring-[#25D366]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#25D366]/55 me-2 mb-2"
          >
            <FaWhatsapp className="w-4 h-4 me-2" />
            WhatsApp
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              referralLink
            )}&quote=${encodeURIComponent(
              "✨ *Imagine earning by leasing AI Agents!* Kalikii makes it possible. Join today using my referral link: Start your AI-powered income journey now! #AILeasing #AIRevolution #Kalikii #TechFuture"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2"
          >
            <FaFacebookF className="w-4 h-4 me-2" />
            Facebook
          </a>

          {/* Twitter/X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              "💡 *Own, Rent & Profit from AI Agents!* Join the world's first AI leasing marketplace – Kalikii. Sign up now using my link and enjoy rewards:"
            )}&url=${encodeURIComponent(
              referralLink
            )} 💡 *Own, Rent & Profit from AI Agents!* Join the world's first AI leasing marketplace – Kalikii. Sign up now using my link and enjoy rewards:`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#000000] hover:bg-[#1DA1F2]/90 focus:ring-4 focus:outline-none focus:ring-[#1DA1F2]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#1DA1F2]/55 me-2 mb-2"
          >
            <FaTwitter className="w-4 h-4 me-2" />
            Twitter
          </a>
          <a
            href="https://fyncbapi.fyntix.club/Fyntix_Business_Plan.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#0088cc] hover:bg-[#0088cc]/90 focus:ring-4 focus:outline-none focus:ring-[#0088cc]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#0088cc]/55 me-2 mb-2"
          >
            <FaFilePdf className="w-4 h-4 me-2" />
            PDF
          </a>
          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              referralLink
            )} 💡 *Own, Rent & Profit from AI Agents!*
Join the world's first AI leasing marketplace – Kalikii.
Sign up now using my link and enjoy rewards:`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#0077B5] hover:bg-[#0077B5]/90 focus:ring-4 focus:outline-none focus:ring-[#0077B5]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#0077B5]/55 me-2 mb-2"
          >
            <svg
              className="w-4 h-4 me-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(
              referralLink
            )}&text=${encodeURIComponent(
              "💡 *Own, Rent & Profit from AI Agents!* Join the world's first AI leasing marketplace – Kalikii.Sign up now using my link and enjoy rewards"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-[#0088cc] hover:bg-[#0088cc]/90 focus:ring-4 focus:outline-none focus:ring-[#0088cc]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center dark:focus:ring-[#0088cc]/55 me-2 mb-2"
          >
            <FaTelegramPlane className="w-4 h-4 me-2" />
            Telegram
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodeURIComponent(
              "🚀 *Work smarter with AI!* Join me on Kalikii and start earning."
            )}&body=${encodeURIComponent(
              `Hi! I wanted to share this great opportunity with you. Join Kalikii using my referral link and start earning rewards: ${referralLink}`
            )}`}
            className="text-white bg-[#34495e] hover:bg-[#34495e]/90 focus:ring-4 focus:outline-none focus:ring-[#34495e]/50 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center inline-flex items-center me-2 mb-2"
          >
            <svg
              className="w-4 h-4 me-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            Email
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReferralLink;
