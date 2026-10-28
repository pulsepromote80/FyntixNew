"use client"; 

import React, { useState } from 'react';
import {
  Zap, Info, Package, ListOrdered, CreditCard, 
  BarChart2, Coins, UsersRound, Briefcase, FileText
} from 'lucide-react';

export default function MIPPackageInvestment() {
  
  // 1. States
  const [userId, setUserId] = useState('');
  const [quantity, setQuantity] = useState('1'); 
const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  // 2. Validation Logic 
  const isFormValid = 
    userId.trim() !== '' && 
    quantity !== '' && 
    Number(quantity) > 0 && 
    selectedPackage !== null;

  // Package Data
  const packages = [
    { id: 10, name: 'Package 10', price: '$500', roi: '$4.00/day', bonus: '$0.00', type: 'SINGLE ENTRY', badgeColor: 'bg-[#e0f2fe] text-[#0284c7]' },
    { id: 11, name: 'Package 11', price: '$500', roi: '$6.00/day', bonus: '$0.00', type: 'MULTI ENTRY', badgeColor: 'bg-[#fef3c7] text-[#b45309]' },
    { id: 12, name: 'Package 12', price: '$500', roi: '$8.00/day', bonus: '$0.00', type: 'MULTI ENTRY', badgeColor: 'bg-[#fef3c7] text-[#b45309]' },
  ];
               
  return (
    <div className="w-full bg-white p-6">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MIP Package Investment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Package 10 / 11 / 12 — Re-energised MIP entries · Package 13 — 3000 Plus Normal · Package 14 — 660 Normal Investment
        </p>
      </div>

      <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-6 mb-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#0284c7] font-semibold text-sm">
            <Zap size={18} fill="currentColor" />
            <span>MIP Package — Re-Energised</span>
          </div>
          <div className="bg-[#0284c7] text-white text-[11px] px-3 py-1 rounded-full font-medium">
            Type 10 / 11 / 12
          </div>
        </div>

        {/* PACKAGE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              onClick={() => setSelectedPackage(pkg.id)} 
              className={`bg-white border rounded-xl p-5 flex flex-col items-center text-center transition-all cursor-pointer ${
                selectedPackage === pkg.id 
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-[10px] text-gray-400 font-semibold tracking-wider mb-4 uppercase">MIP RE-ENERGISED</div>
              <Zap className="text-orange-500 mb-2" size={24} fill="currentColor" />
              <div className="text-gray-600 font-medium mb-1 text-sm">{pkg.name}</div>
              <div className="text-2xl font-bold text-gray-800 mb-3">{pkg.price}</div>
              <div className="text-[13px] text-[#0284c7] mb-1">Daily ROI: <span className="font-medium">{pkg.roi}</span></div>
              <div className="text-[13px] text-[#0284c7] mb-4">Sponsor Bonus: <span className="font-medium">{pkg.bonus}</span></div>
              <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${pkg.badgeColor}`}>{pkg.type}</div>
            </div>
          ))}

          {/* Package 13 */}
          <div 
            onClick={() => setSelectedPackage(13)}
            className={`border rounded-xl p-5 flex flex-col items-center text-center transition-all cursor-pointer bg-[#f5f3ff] ${
              selectedPackage === 13 
                ? 'border-purple-500 ring-2 ring-purple-200 shadow-md' 
                : 'border-purple-200 hover:border-purple-400'
            }`}
          >
            <div className="text-[10px] text-purple-400 font-semibold tracking-wider mb-4 uppercase text-center leading-tight">3000 PLUS NORMAL<br/>INVESTMENT</div>
            <div className="text-blue-500 mb-2">◆</div>
            <div className="text-gray-600 font-medium mb-1 text-sm">Package 13</div>
            <div className="text-2xl font-bold text-[#6b21a8] mb-3">$3,000+</div>
            <div className="text-[11px] text-purple-600 mb-4 text-left w-full px-2">
              Minimum amount: <span className="font-semibold">$3,000</span><br/>
              Admin enters the amount
            </div>
            <div className="text-[10px] font-bold px-3 py-1 rounded-full border border-purple-300 text-purple-700 bg-white mt-auto">CUSTOM AMOUNT</div>
          </div>
        </div>

        {/* Package 14 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div 
            onClick={() => setSelectedPackage(14)}
            className={`bg-white border rounded-xl p-5 flex flex-col items-center text-center transition-all cursor-pointer ${
              selectedPackage === 14 
                ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-[10px] text-gray-400 font-semibold tracking-wider mb-4 uppercase">660 PACKAGE 14%</div>
            <Zap className="text-orange-500 mb-2" size={24} fill="currentColor" />
            <div className="text-gray-600 font-medium mb-1 text-sm">Package 14</div>
            <div className="text-2xl font-bold text-gray-800 mb-3">$660</div>
            <div className="text-[13px] text-[#0284c7] mb-1">Daily ROI: <span className="font-medium">$0.00/day</span></div>
            <div className="text-[13px] text-[#0284c7] mb-4">Sponsor Bonus: <span className="font-medium">$0.00</span></div>
            <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#fef3c7] text-[#b45309]">MULTI ENTRY</div>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="mt-8 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-5 text-[13px] text-gray-700 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#0284c7] mb-4 text-sm">
            <Info size={18} />
            <span>MIP Package — How it works</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex gap-2"><Package size={16} className="text-orange-500 mt-[2px] shrink-0"/> <span><strong>Package 10</strong> → will always create <strong>only 1 entry</strong> (quantity locked)</span></div>
            <div className="flex gap-2"><ListOrdered size={16} className="text-blue-500 mt-[2px] shrink-0"/> <span><strong>Package 11 / 12</strong> → as many entries will be created as the quantity entered</span></div>
            <div className="flex gap-2"><div className="w-4 h-4 text-blue-500 flex justify-center mt-[2px] shrink-0 text-[10px]">◆</div> <span><strong>Package 13</strong> → admin enters the <strong>amount</strong> (3000 or above). Only <strong>1 entry</strong> is created with that exact amount</span></div>
            <div className="flex gap-2"><CreditCard size={16} className="text-blue-400 mt-[2px] shrink-0"/> <span><strong>Package 14</strong> → admin enters the <strong>quantity</strong> (same as Package 11 / 12). Each entry uses the fixed amount from the packages table (660)</span></div>
            <div className="flex gap-2"><BarChart2 size={16} className="text-green-500 mt-[2px] shrink-0"/> <span>Amount per entry = package table amount | Total = amount × quantity <em>(not applicable for Package 13)</em></span></div>
            <div className="flex gap-2"><Coins size={16} className="text-orange-500 mt-[2px] shrink-0"/> <span><strong>10%</strong> → Subscription | <strong>90%</strong> → Working Capital <em>(Package 13 and Package 14 do NOT add to working capital)</em></span></div>
            <div className="flex gap-2"><UsersRound size={16} className="text-purple-500 mt-[2px] shrink-0"/> <span>Referrer gets <strong>Direct Income</strong> on every entry (with 5x cap)</span></div>
            <div className="flex gap-2"><Briefcase size={16} className="text-blue-600 mt-[2px] shrink-0"/> <span>Binary business + Level income will be distributed on every entry</span></div>
            <div className="flex gap-2"><Zap size={16} className="text-orange-500 mt-[2px] shrink-0"/> <span><code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">investments.type = 10</code> | <code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">bonus_roi_histories.mip_re_energised = 1</code> <em>(Package 10 / 11 / 12)</em></span></div>
            <div className="flex gap-2"><div className="w-4 h-4 text-blue-500 flex justify-center mt-[2px] shrink-0 text-[10px]">◆</div> <span><code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">investments.type = 11</code> | <code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">no bonus_roi_histories row</code> <em>(Package 13)</em></span></div>
            <div className="flex gap-2"><FileText size={16} className="text-blue-400 mt-[2px] shrink-0"/> <span><code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">investments.type = 12</code> | <code className="bg-white/60 px-1 py-0.5 rounded border border-gray-200 text-[12px] font-mono">no bonus_roi_histories row</code> <em>(Package 14)</em></span></div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="mt-8">
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              User ID <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter user's id" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)} 
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1.5">Find the user id from Users Management</p>
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Quantity — how many entries to create <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)} 
              min="1"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1.5">Max 200 entries per submit. Quantity will always stay 1 for Package 10.</p>
          </div>

          <div>
            {/* BUTTON LOGIC */}
            <button 
              type="button"
              disabled={!isFormValid} 
              className={`w-full font-medium py-3 rounded-md transition-all flex justify-center items-center gap-2 ${
                isFormValid 
                  ? 'bg-[#6cb2c9] hover:bg-[#5a9bb0] text-white cursor-pointer shadow-sm' 
                  : 'bg-[#6cb2c9] text-white opacity-60 cursor-not-allowed'
              }`}
            >
              <Zap size={18} fill="currentColor" />
              Process MIP Package Investment
            </button>
            
            {/* Helper Text */}
            {!isFormValid && (
              <p className="text-center text-[12px] text-gray-500 mt-2">
                Please fill User ID, Quantity, and select a package to continue
              </p>
            )}
            {isFormValid && (
              <p className="text-center text-[12px] text-green-600 font-medium mt-2">
                ✓ Form is ready. You can now process the investment.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}