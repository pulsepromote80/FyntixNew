"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';

interface PlanFeature {
  text: string;
}

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  investmentRange: string;
  features: PlanFeature[];
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
  BoosterPackage: number;
}

interface ActivatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  userId?: string;
}

const ActivatePlanModal: React.FC<ActivatePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  userId = "",
}) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amountError, setAmountError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [userIdInput, setUserIdInput] = useState(userId);
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [isLoadingUserName, setIsLoadingUserName] = useState(false);

  // Fetch wallet details when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserIdInput(userId);
      setUserName("");
      setUserNameError("");
      fetchWalletDetails();
    }
  }, [isOpen, userId]);

  const fetchUserName = useCallback(async () => {
    setIsLoadingUserName(true);
    setUserName("");
    setUserNameError("");
    try {
      const response = await fetch(`/api/FundManager?authLogin=${userIdInput}`);
      const data = await response.json();

      if (response.ok && data.statusCode === 200 && data.data?.Name) {
        setUserName(data.data.Name);
      } else {
        setUserNameError(
          typeof data.message === "string" ? data.message : "User ID not found.",
        );
      }
    } catch (error) {
      console.error('Failed to fetch user name:', error);
      setUserNameError("Could not verify this User ID. Please try again.");
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
    if (!plan) return;

    setIsActivating(true);
    setActivationError("");

    try {
      const response = await fetch('/api/FundManager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: plan.id,
          rkprice: Number(amount) || 0,
          byAuthlogin: userIdInput,
          RechargeType: plan.BoosterPackage,
        }),
      });


      const data = await response.json();

      if (data.statusCode === 200) {
        // Success - close modal and refresh wallet
        toast.success(data.message || "Plan activated successfully!");
        // Invalidate dashboard summary query to refresh Navbar data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
        onClose();
        // Optionally show success message or redirect
      } else {
        setActivationError(data.message || "Failed to activate plan");
        toast.error(data.message || "Failed to activate plan");
      }
    } catch (error) {
      console.error('Failed to activate plan:', error);
      setActivationError("An error occurred while activating the plan");
      toast.error("An error occurred while activating the plan");
    } finally {
      setIsActivating(false);
    }
  };

  if (!isOpen || !plan) return null;

  const isQuantityPlan = plan.title === "Legacy Reborn 2.0";

  // ✅ Quantity change — hamesha update karo, error bhi handle karo
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = e.target.value;
    setQuantity(qty);

    const numQty = Number(qty);
    if (qty === "" || numQty <= 0) {
      setQuantityError("Please enter a valid quantity");
      setAmount("");
    } else {
      const calculatedAmount = numQty * 660;
      setAmount(calculatedAmount.toString());

      if (calculatedAmount > walletBalance) {
        setQuantityError("Insufficient balance");
      } else {
        setQuantityError("");
      }
    }
  };

  // ✅ Amount change — hamesha update karo, sirf error message dikhao
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    if (value === "") {
      setAmountError("");
      return;
    }

    const numValue = Number(value);

    if (plan.title === "Normal") {
      if (numValue < 100) {
        setAmountError("Minimum investment is $100");
      } else if (numValue > walletBalance) {
        setAmountError("Insufficient balance");
      } else {
        setAmountError("");
      }
    } else if (plan.title === "Legacy Reborn") {
      if (numValue < 3000) {
        setAmountError("Minimum investment is $3,000");
      } else if (numValue > walletBalance) {
        setAmountError("Insufficient balance");
      } else {
        setAmountError("");
      }
    } else {
      if (numValue > walletBalance) {
        setAmountError("Insufficient balance");
      } else {
        setAmountError("");
      }
    }
  };

  const getModalTheme = () => {
    if (plan.title === "Normal") {
      return { btn: "bg-blue-500 hover:bg-blue-600 text-white", text: "text-blue-600", iconBg: "bg-blue-100" };
    }
    if (plan.title === "Legacy Reborn") {
      return { btn: "bg-amber-500 hover:bg-amber-600 text-white", text: "text-amber-600", iconBg: "bg-amber-100" };
    }
    return { btn: "bg-purple-500 hover:bg-purple-600 text-white", text: "text-purple-600", iconBg: "bg-purple-100" };
  };

  const modalTheme = getModalTheme();


  const isSubmitDisabled =
    !amount ||
    !userIdInput ||
    !!amountError ||
    (isQuantityPlan && (!!quantityError || !quantity)) ||
    isActivating;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-[480px] bg-white dark:bg-[#11111a] rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/10">

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-1">
                Subscribe Now
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Activate <span className={modalTheme.text}>{plan.title}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors border border-gray-100 dark:border-white/10"
            >
              <span className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-none">&times;</span>
            </button>
          </div>

          {/* Wallet Info Box */}
          <div className="flex justify-between items-center bg-[#f0fdf4] dark:bg-green-900/20 border border-green-100 dark:border-green-500/30 rounded-2xl p-5 mb-6">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">Wallet Balance</p>
              <p className="text-green-600 dark:text-green-400 text-2xl font-bold">
                {isLoadingWallet ? <Loader2 className="h-6 w-6 animate-spin text-[#F5C451]" aria-label="Loading" /> : `$${walletBalance}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 dark:text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">Investment Range</p>
              <p className="text-gray-900 dark:text-white text-lg font-semibold">{plan.investmentRange}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
                USER ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userIdInput}
                  placeholder="Enter UserID"
                  onChange={(e) => {
                    setUserIdInput(e.target.value);
                    setUserName("");
                    setUserNameError("");
                  }}
                  aria-invalid={!!userNameError}
                  aria-describedby={userNameError ? "user-id-error" : undefined}
                  className="w-full bg-[#f4f6fc] dark:bg-white/5 text-gray-800 dark:text-white text-lg placeholder-gray-400 font-medium px-4 py-3.5 pr-12 rounded-xl border outline-none transition-all"
                />
                {isLoadingUserName && (
                  <Loader2
                    className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#F5C451]"
                    aria-label="Loading user name"
                  />
                )}
              </div>
              {userName && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium mt-2 block">
                  {userName}
                </span>
              )}
              {userNameError && !isLoadingUserName && (
                <p id="user-id-error" className="mt-2 text-xs font-medium text-red-500" role="alert">
                  {userNameError}
                </p>
              )}
            </div>

            {isQuantityPlan ? (
              <div>
                <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
                  QUANTITY <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={`w-full bg-[#f4f6fc] dark:bg-white/5 text-gray-800 dark:text-white text-lg placeholder-gray-400 font-medium px-4 py-3.5 rounded-xl border outline-none transition-all ${quantityError
                      ? "border-red-400 dark:border-red-500"
                      : "border-transparent focus:border-blue-300 dark:focus:border-blue-500"
                    }`}
                />
                {quantityError ? (
                  <p className="text-red-500 text-xs font-medium mt-2">⚠️ {quantityError}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-2 flex items-center gap-1">
                    💡 1 Quantity = $660
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">SELECTED PLAN</label>
                <div className="w-full bg-[#f8f9fc] dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 text-lg font-medium px-4 py-3.5 rounded-xl flex items-center gap-3">
                  <span className={`text-xl p-1.5 rounded-md ${modalTheme.iconBg}`}>{plan.icon}</span>
                  <span className={modalTheme.text}>{plan.title}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
                INVESTMENT AMOUNT (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
                readOnly={isQuantityPlan}
                className={`w-full bg-[#f4f6fc] dark:bg-white/5 text-gray-800 dark:text-white text-lg placeholder-gray-400 font-medium px-4 py-3.5 rounded-xl border outline-none transition-all ${isQuantityPlan ? "cursor-not-allowed" : ""
                  } ${amountError
                    ? "border-red-400 dark:border-red-500"
                    : "border-transparent focus:border-blue-300 dark:focus:border-blue-500"
                  }`}
              />
              {amountError ? (
                <p className="text-red-500 text-xs font-medium mt-2">⚠️ {amountError}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-2 flex items-center gap-1">
                  💡 Investment range: <span className="text-gray-900 dark:text-white font-bold">{plan.investmentRange}</span>
                </p>
              )}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleActivate}
            disabled={isSubmitDisabled || isActivating}
            className={`w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-extrabold tracking-widest uppercase transition-all duration-300 ${modalTheme.btn} ${isSubmitDisabled || isActivating ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <span className="text-xl">{isActivating ? "⏳" : "🚀"}</span>
            {isActivating ? "Activating..." : `Activate ${plan.title}`}
          </button>

          {activationError && (
            <p className="text-red-500 text-xs font-medium mt-3 text-center">⚠️ {activationError}</p>
          )}

        </div>
      </div>
    </>
  );
};

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // const response = await fetch('/api/investment-plans?Type=1', {
        //   method: 'GET',
        // });

        // const data = await response.json();

        // if (data.statusCode === 200 && data.data) {
          const hardcodedPlans: Plan[] = [
            {
              id: "1", // Hardcoded ID
              title: "Liquidity Provider",
              subtitle: "Perfect for New Investors",
              icon: "🚀",
              investmentRange: "$100+",
              isPopular: true,
              features: [
                { text: "ROI 8% on 90%" },
                { text: "10% for Direct Rewards" },
                { text: "10% for Binary Rewards" },
                { text: "10% for Rank Rewards" },
                { text: "Investor Limit 2.5X" },
                { text: "Leaders Limit 5X" },
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
              BoosterPackage: 1,
            },
            {
              id: "2", // Hardcoded ID
              title: "Smart Bonds", // Hardcoded title
              subtitle: "For Consistent Growth",
              icon: "📊",
              investmentRange: "$3,000+",

              features: [
                { text: "ROI 12%" },
                { text: "Investor Limit 2.5X" },
                { text: "Leaders Limit 5X" },
              ],
              theme: {
                text: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-500/10",
                border: "border-amber-200 dark:border-amber-500/30",
                glow: "shadow-sm dark:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
                button: "bg-amber-500 text-white border-transparent dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-black font-bold",
                buttonHover: "hover:bg-amber-600 dark:hover:from-amber-400 dark:hover:to-orange-400",
                iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
              },
              BoosterPackage: 2,
            },
            {
              id: "3", // Hardcoded ID
              title: "Secure Bonds", // Hardcoded title
              subtitle: "Professional Trading Suite",
              icon: "💎",
              investmentRange: "$660 - 1 Quantity",
              features: [
                { text: "ROI 14%" },
                { text: "Investor Limit 2.5X" },
                { text: "Leaders Limit 5X" },
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
              BoosterPackage: 3,
            },
          ];

          // const mappedPlans = hardcodedPlans.map((plan, index) => {
          //   const apiItem = data.data[index];
          //   if (apiItem) {
          //     return {
          //       ...plan,
          //       id: apiItem.productId,
          //       title: apiItem.name,
          //       BoosterPackage: apiItem.BoosterPackage,
          //     };
          //   }
          //   return plan;
          // });

          setPlans(hardcodedPlans);
        // }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] p-4 sm:p-8 font-sans relative transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full mx-auto">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#F5C451]" aria-label="Loading" />
          </div>
        ) : plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-[#11111a] border ${plan.theme.border} ${plan.theme.glow} transition-all duration-300 hover:-translate-y-2`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white dark:text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                ★ Most Popular ★
              </div>
            )}

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl ${plan.theme.iconBg} shadow-lg`}>
              {plan.icon}
            </div>

            <h2 className={`text-3xl font-bold mb-3 ${plan.theme.text}`}>
              {plan.title}
            </h2>

            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-8 ${plan.theme.bg} ${plan.theme.text} border ${plan.theme.border}`}>
              {plan.subtitle}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a24] border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-8">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
                Investment Range
              </p>
              <p className="text-gray-900 dark:text-white text-3xl font-bold">
                {plan.investmentRange}
              </p>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${plan.theme.border} ${plan.theme.bg}`}>
                    <span className={`text-[10px] font-bold ${plan.theme.text}`}>✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${plan.theme.button} ${plan.theme.buttonHover}`}
            >
              Activate Package
              <span className="text-lg">→</span>
            </button>
          </div>
        ))}
      </div>

      <ActivatePlanModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
      />
    </div>
  );
}
