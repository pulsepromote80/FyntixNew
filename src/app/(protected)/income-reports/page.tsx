"use client";
import { useState } from "react";
// import { NftSection } from "@/app/components/NftSection";
import { usePathname } from 'next/navigation';
import { getPageName } from "@/lib/utils";
import TransactionData from "@/features/income-reports/components/TransactionData";
import {
  FaUserPlus,
  FaGift,
  FaMedal,
  FaSeedling,
  FaLayerGroup ,
  FaUsers,
  FaCrown,
  FaMoneyBillWave 
} from "react-icons/fa";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Dynamic Referral Yield");
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  const getTransactionType = (tabName: string) => {
    const map: Record<string, string> = {
      "Dynamic Referral Yield": "Dynamic Referral Yield",
      "Daily Revenue Sharing": "Daily Revenue Sharing",
      "Booster Profit": "Booster Profit",
      "Unity Revenue Yield": "Unity Revenue Yield",
      "Performance Revenue": "Performance Revenue",
      "Smart Bonds": "Smart Bonds",
      "Smart Growth": "Smart Growth",
      "Secure Bonds": "Secure Bonds",

    };
    return map[tabName] || "ALL";
  };

  const tabs = [
    { id: "Dynamic Referral Yield", label: "Dynamic Referral Yield", icon: FaUserPlus },
    { id: "Daily Revenue Sharing", label: "Daily Revenue Sharing", icon: FaMoneyBillWave },
    { id: "Booster Profit", label: "Booster Profit", icon: FaGift },
    { id: "Unity Revenue Yield", label: "Unity Revenue Yield", icon: FaSeedling },
    { id: "Performance Revenue", label: "Performance Revenue", icon: FaLayerGroup },
    { id: "Smart Bonds", label: "Smart Bonds", icon: FaUsers },
    { id: "Smart Growth", label: "Smart Growth", icon: FaCrown },
    { id: "Secure Bonds", label: "Secure Bonds", icon: FaMedal },
  ];

  return (
    <>
      {/* <NftSection pageName={pageName} /> */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#0b1021] dark:via-[#0b1021] dark:to-[#171a36] min-h-screen relative overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-400/10 dark:bg-violet-400/5 rounded-full blur-3xl"></div>
        </div>

        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
          .velvora-gradient { background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); }
          .velvora-gradient-text { background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .glass-effect { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
          .dark .glass-effect { background: rgba(11,16,33,0.82); }
          .gradient-border { position: relative; }
          .gradient-border::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
          .tab-active { position: relative; }
          .tab-active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; background: linear-gradient(135deg, #1680ff 0%, #25c6e8 50%, #7d75ff 100%); border-radius: 4px; animation: slideIn 0.3s ease-out; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="relative mx-auto">
          {/* Tabs Section - Premium Glass Card */}
          <div className="relative overflow-hidden transition-all duration-300 bg-white/80 dark:bg-[#0b1021]/90 border border-gray-200/50 dark:border-[#1E293B] shadow-xl rounded-2xl sm:rounded-3xl gradient-border glass-effect">
            {/* Animated shimmer line at top */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] animate-shimmer"></div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative p-2 sm:p-3 md:p-4">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 sm:gap-1 md:gap-1 whitespace-nowrap min-w-max">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 rounded-xl flex-shrink-0 ${isActive
                          ? "tab-active text-blue-700 dark:text-cyan-300 bg-blue-50/80 dark:bg-cyan-900/20 shadow-sm shadow-blue-500/10"
                          : "font-bold text-gray-800 dark:text-gray-200 text-xs hover:text-blue-700 dark:hover:text-cyan-300 hover:bg-blue-50/50 dark:hover:bg-cyan-900/10"
                          }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1680ff] dark:bg-[#25c6e8] animate-pulse"></span>
                        )}
                        <Icon className="text-base sm:text-lg flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative mt-4 sm:mt-5 md:mt-6 transition-all duration-300">
            <div className="animate-slideIn">
              <TransactionData transType={getTransactionType(activeTab)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
