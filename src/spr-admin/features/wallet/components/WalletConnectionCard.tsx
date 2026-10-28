"use client";

import { AlertTriangle, Unplug, Wallet } from "lucide-react";
import { useBscUsdtWallet } from "../hooks/useBscUsdtWallet";
import { toast } from "sonner";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectionCard() {
  const {
    isInstalled,
    account,
    chainId,
    usdtBalance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchToBsc,
  } = useBscUsdtWallet();
  const isBsc = chainId.toLowerCase() === "0x38";

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.success("Wallet disconnected.");
    } catch {
      toast.error("Could not disconnect the wallet. Check MetaMask and try again.");
    }
  };

  return (
    <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-3">
        <Wallet className="h-5 w-5 text-white" aria-hidden />
        <h2 className="text-base font-bold text-white">Wallet Connection</h2>
      </div>
      <div className="flex flex-col justify-between gap-3 bg-blue-50 px-6 py-4 md:flex-row md:items-center">
        <div className="min-w-0 text-sm text-gray-700">
          {!isInstalled ? (
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <span>MetaMask not detected.</span>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-700 underline hover:text-blue-800"
              >
                Install MetaMask
              </a>
            </div>
          ) : account ? (
            <div className="flex flex-col gap-2">
              <span>
                Connected wallet:{" "}
                <span className="font-mono font-semibold" title={account}>
                  {shortenAddress(account)}
                </span>
              </span>
              {isBsc ? (
                <span className="font-semibold text-green-700">
                  Wallet USDT: {usdtBalance ? `${usdtBalance} USDT` : "Loading balance..."}
                </span>
              ) : (
                <span className="text-amber-800">
                  Switch to BNB Smart Chain to view the USDT balance.
                </span>
              )}
            </div>
          ) : (
            <span>Connect MetaMask and approve the wallet access request to view USDT.</span>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        {isInstalled && account ? (
          <div className="flex flex-wrap items-center gap-2">
            {!isBsc && (
              <button
                type="button"
                onClick={() => void switchToBsc()}
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Switch to BNB Smart Chain
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <Unplug className="h-4 w-4" aria-hidden />
              Disconnect
            </button>
          </div>
        ) : (
          isInstalled && (
            <button
              type="button"
              onClick={() => void connectWallet()}
              disabled={isConnecting}
              className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )
        )}
      </div>
    </section>
  );
}
