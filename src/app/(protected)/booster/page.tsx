"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';

interface BoosterFeature {
  text: string;
}

interface Booster {
  ProductId: string;
  ProductName: string;
  Rkprice: number;
  PackageName: string;
  CreatedDate: string;
  subtitle: string;
  BoosterPackage: number;
  features: BoosterFeature[];
  theme: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    button: string;
    buttonHover: string;
    iconBg: string;
  };
  isPopular?: boolean;
}

// ==========================================
// MODAL COMPONENT (Popup)
// ==========================================
interface ActivateBoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  booster: Booster | null;
  userId?: string;  
}


const ActivateBoosterModal: React.FC<ActivateBoosterModalProps> = ({
  isOpen,
  onClose,
  booster,
  userId = "",
}) => {
  const queryClient = useQueryClient();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [userIdInput, setUserIdInput] = useState(userId);
  const [userName, setUserName] = useState("");
  const [isLoadingUserName, setIsLoadingUserName] = useState(false);

  // Fetch wallet details when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserIdInput(userId);
      setUserName("");
      fetchWalletDetails();
    }
  }, [isOpen, userId]);

  const fetchUserName = useCallback(async () => {
    setIsLoadingUserName(true);
    try {
      const response = await fetch(`/api/FundManager?authLogin=${userIdInput}`);
      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setUserName(data.data.Name || "");
      } else {
        setUserName("");
      }
    } catch (error) {
      console.error('Failed to fetch user name:', error);
      setUserName("");
    } finally {
      setIsLoadingUserName(false);
    }
  }, [userIdInput]);

  // Fetch user name when userId changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userIdInput && userIdInput.length > 0) {
        fetchUserName();
      } else {
        setUserName("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userIdInput, fetchUserName]);

  const fetchWalletDetails = async () => {
    setIsLoadingWallet(true);
    try {
      const response = await fetch('/api/FundManager');
      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setWalletBalance(data.data.DepositWallet || 0);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Failed to fetch wallet details:', error);
      setWalletBalance(0);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleActivate = async () => {
    if (!booster) return;

    const boosterPrice = booster.Rkprice;
   

    if (boosterPrice > walletBalance) {
      setActivationError("Insufficient balance");
      toast.error("Insufficient balance");
      return;
    }

    setIsActivating(true);
    setActivationError("");

    try {
      const response = await fetch('/api/FundManager/addBoosterUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BoosterValue: boosterPrice,
          BoosterType: booster.BoosterPackage,
        }),
      });

      const data = await response.json();

      if (data.statusCode === 200) {
        toast.success(data.message || "Booster activated successfully!");
        // Invalidate dashboard summary query to refresh Navbar data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
        onClose();
      } else {
        setActivationError(data.message || "Failed to activate booster");
        toast.error(data.message || "Failed to activate booster");
      }
    } catch (error) {
      console.error('Failed to activate booster:', error);
      setActivationError("An error occurred while activating the booster");
      toast.error("An error occurred while activating the booster");
    } finally {
      setIsActivating(false);
    }
  };

  if (!isOpen || !booster) return null;

  const getModalTheme = () => {
    if (booster.PackageName?.includes("Withdrawal")) {
      return { btn: "bg-blue-500 hover:bg-blue-600 text-white", text: "text-blue-600", iconBg: "bg-blue-100" };
    }
    return { btn: "bg-purple-500 hover:bg-purple-600 text-white", text: "text-purple-600", iconBg: "bg-purple-100" };
  };

  const modalTheme = getModalTheme();
  const isSubmitDisabled = isActivating || booster.Rkprice > walletBalance;

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
      <div className="relative w-full max-w-[480px] bg-white dark:bg-[#11111a] rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/10">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-1">
              Activate Booster
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {booster.ProductName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{booster.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors border border-gray-100 dark:border-white/10"
          >
            <span className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-none">&times;</span>
          </button>
        </div>

        {/* Wallet Info Box */}
        <div className={`flex justify-between items-center rounded-2xl p-5 mb-6 ${
          booster.Rkprice > walletBalance
            ? "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/30"
            : "bg-[#f0fdf4] dark:bg-green-900/20 border border-green-100 dark:border-green-500/30"
        }`}>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">Wallet Balance</p>
            <p className={`${booster.Rkprice > walletBalance ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"} text-2xl font-bold`}>
              {isLoadingWallet ? <Loader2 className="h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" /> : `$${walletBalance}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 dark:text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">Booster Price</p>
            <p className="text-gray-900 dark:text-white text-lg font-semibold">${booster.Rkprice}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* <div>
            <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
              USER ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={userIdInput}
              placeholder="Enter UserID"
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-full bg-[#f4f6fc] dark:bg-white/5 text-gray-800 dark:text-white text-lg placeholder-gray-400 font-medium px-4 py-3.5 rounded-xl border border-transparent focus:border-blue-300 dark:focus:border-blue-500 outline-none transition-all"
            />
            {userName && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium mt-2 block">
                {userName}
              </span>
            )}
            {isLoadingUserName && (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-[#F5C451]" aria-label="Loading user name" />
            )}
          </div> */}

          <div>
            <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">SELECTED BOOSTER</label>
            <div className="w-full bg-[#f8f9fc] dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 text-lg font-medium px-4 py-3.5 rounded-xl flex items-center gap-3">
              <span className={`text-xl p-1.5 rounded-md ${modalTheme.iconBg}`}>⚡</span>
              <span className={modalTheme.text}>{booster.ProductName}</span>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleActivate}
          disabled={isSubmitDisabled || isActivating}
          className={`w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-extrabold tracking-widest uppercase transition-all duration-300 ${modalTheme.btn} ${
            isSubmitDisabled || isActivating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="text-xl">{isActivating ? "⏳" : "⚡"}</span>
          {isActivating ? "Activating..." : `Activate ${booster.ProductName}`}
        </button>

        {activationError && (
          <p className="text-red-500 text-xs font-medium mt-3 text-center">⚠️ {activationError}</p>
        )}

      </div>
    </div>
    </>
  );
};

// ==========================================
// MAIN BOOSTER PAGE COMPONENT
// ==========================================
export default function BoosterPage() {
  const [selectedBooster, setSelectedBooster] = useState<Booster | null>(null);
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoosters = async () => {
      try {
        const response = await fetch('/api/investment-plans?Type=2', {
          method: 'GET',
        });

        const data = await response.json();

        if (data.statusCode === 200 && data.data) {
          const hardcodedBoosters: Booster[] = [
            {
              ProductId: "", // Will be set from API
              ProductName: "", // Will be set from API
              Rkprice: 100,
              PackageName: "Daily Withdrawal Allowed",
              CreatedDate: "",
              subtitle: "Daily Withdrawal Allowed",
              BoosterPackage: 1,
              features: [
                { text: "Validity: 30 Days" },
                { text: "Daily Withdrawal Allowed" },
                { text: "Instant Withdrawal Access" },
                { text: "Boost Your Daily Earnings" },
              ],
              theme: {
                text: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-500/10",
                border: "border-blue-200 dark:border-blue-500/30",
                glow: "shadow-sm dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
                button: "bg-blue-500 text-white border-transparent dark:bg-transparent dark:border-2 dark:border-blue-500 dark:text-blue-400",
                buttonHover: "hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white",
                iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
              },
            },
            {
              ProductId: "", // Will be set from API
              ProductName: "", // Will be set from API
              Rkprice: 100,
              PackageName: "Double Your Level ROI",
              CreatedDate: "",
              subtitle: "Double Your Level ROI",
              BoosterPackage: 2,
              features: [
                { text: "30% Get from 15 Levels" },
                { text: "After Booster: 60% (Double Level ROI)" },
                { text: "Validity: Lifetime" },
                { text: "Just Double Level ROI" },
              ],
              theme: {
                text: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-500/10",
                border: "border-purple-200 dark:border-purple-500/30",
                glow: "shadow-sm dark:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
                button: "bg-purple-500 text-white border-transparent dark:bg-gradient-to-r dark:from-purple-500 dark:to-fuchsia-500 font-bold",
                buttonHover: "hover:bg-purple-600 dark:hover:from-purple-400 dark:hover:to-fuchsia-400",
                iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
              },
              isPopular: true,
            },
          ];

          const mappedBoosters = hardcodedBoosters.map((booster, index) => {
            const apiItem = data.data[index];
            if (apiItem) {
              return {
                ...booster,
                ProductId: apiItem.productId,
                ProductName: apiItem.name,
                BoosterPackage: apiItem.BoosterPackage,
              };
            }
            return booster;
          });

          setBoosters(mappedBoosters);
        }
      } catch (error) {
        console.error('Failed to fetch boosters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoosters();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] p-4 sm:p-8 font-sans relative transition-colors duration-300">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto ">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#F5C451]" aria-label="Loading" />
          </div>
        ) : boosters.map((booster) => (
          <div
            key={booster.ProductId}
            className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-[#11111a] border ${booster.theme.border} ${booster.theme.glow} transition-all duration-300 hover:-translate-y-2`}
          >
            {booster.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                ★ Best Value ★
              </div>
            )}

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl ${booster.theme.iconBg} shadow-lg`}>
              ⚡
            </div>

            <h2 className={`text-3xl font-bold mb-3 ${booster.theme.text}`}>
              {booster.ProductName}
            </h2>

            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-8 ${booster.theme.bg} ${booster.theme.text} border ${booster.theme.border}`}>
              {booster.subtitle}
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 dark:bg-[#1a1a24] border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
                Booster Price
              </p>
              <p className="text-gray-900 dark:text-white text-3xl font-bold">
                ${booster.Rkprice}
              </p>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {booster.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${booster.theme.border} ${booster.theme.bg}`}>
                    <span className={`text-[10px] font-bold ${booster.theme.text}`}>✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedBooster(booster)}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${booster.theme.button} ${booster.theme.buttonHover}`}
            >
              Activate Booster
              <span className="text-lg">→</span>
            </button>
          </div>
        ))}
      </div>

      {/* MODAL RENDER */}
      <ActivateBoosterModal
        isOpen={!!selectedBooster}
        onClose={() => setSelectedBooster(null)}
        booster={selectedBooster}
        userId=""
      />
    </div>
  );
}
