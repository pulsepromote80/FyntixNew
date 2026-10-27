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
  const [activeTab, setActiveTab] = useState("Direct Income");
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  const getTransactionType = (tabName: string) => {
    const map: Record<string, string> = {
      "Direct Income": "Direct Income",
      "Binary Income": "Binary Income",
      "Reward Income": "Reward Income",
      "ROI Income": "ROI Income",
      "Level Income": "Level Income",

    };
    return map[tabName] || "ALL";
  };

  const tabs = [
    { id: "Direct Income", label: "Direct Income", icon: FaUserPlus },
    { id: "Binary Income", label: "Binary Income", icon: FaMoneyBillWave },
    { id: "Reward Income", label: "Rank & Reward", icon: FaGift },
    { id: "ROI Income", label: "ROI Income", icon: FaSeedling },
    { id: "Level Income", label: "Level Income", icon: FaLayerGroup },
  ];

  return (
    <>
      {/* <NftSection pageName={pageName} /> */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen relative overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-400/10 dark:bg-violet-400/5 rounded-full blur-3xl"></div>
        </div>

        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
          .velvora-gradient { background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); }
          .velvora-gradient-text { background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .glass-effect { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
          .dark .glass-effect { background: rgba(17,24,39,0.7); }
          .gradient-border { position: relative; }
          .gradient-border::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
          .tab-active { position: relative; }
          .tab-active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; background: linear-gradient(135deg, #2196F3, #3F51B5, #3F51B5); border-radius: 4px; animation: slideIn 0.3s ease-out; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="relative mx-auto">
          {/* Tabs Section - Premium Glass Card */}
          <div className="relative overflow-hidden transition-all duration-300 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl sm:rounded-3xl gradient-border glass-effect">
            {/* Animated shimmer line at top */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-blue-500 to-violet-500 animate-shimmer"></div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
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
                          ? "tab-active text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 shadow-sm shadow-blue-500/10"
                          : "font-bold text-gray-800 dark:text-gray-200 text-xs hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                          }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-white-400 animate-pulse"></span>
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
