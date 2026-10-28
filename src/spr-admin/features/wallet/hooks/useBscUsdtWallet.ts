"use client";

import { useCallback, useEffect, useState } from "react";

interface ProviderRequest {
  method: string;
  params?: unknown[];
}

interface InjectedWalletProvider {
  request: (args: ProviderRequest) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: InjectedWalletProvider;
  }
}

const BSC_CHAIN_ID = "0x38";
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/";
const BSC_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_BALANCE_OF_SELECTOR = "70a08231";
const USDT_DECIMALS = 18;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function getErrorCode(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Wallet request failed. Please try again.";
}

async function getUsdtBalance(
  provider: InjectedWalletProvider,
  account: string,
): Promise<string> {
  const address = account.toLowerCase().replace(/^0x/, "");
  const result = await provider.request({
    method: "eth_call",
    params: [
      {
        to: BSC_USDT_ADDRESS,
        data: `0x${USDT_BALANCE_OF_SELECTOR}${address.padStart(64, "0")}`,
      },
      "latest",
    ],
  });

  if (typeof result !== "string" || !/^0x[0-9a-f]+$/i.test(result)) {
    throw new Error("Could not read USDT balance from BNB Smart Chain.");
  }

  const rawBalance = BigInt(result);
  const divisor = 10n ** BigInt(USDT_DECIMALS);
  const whole = rawBalance / divisor;
  const fraction = (rawBalance % divisor).toString().padStart(USDT_DECIMALS, "0");
  return `${whole}.${fraction.slice(0, 2)}`;
}

function toUsdtBaseUnits(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("USDT amount must be greater than zero.");
  }
  const decimalAmount = amount.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: USDT_DECIMALS,
  });
  const match = /^(\d+)(?:\.(\d{1,18}))?$/.exec(decimalAmount);
  if (!match) throw new Error("USDT amount has an invalid precision.");
  const whole = BigInt(match[1] ?? "0");
  const fraction = BigInt((match[2] ?? "").padEnd(USDT_DECIMALS, "0") || "0");
  return whole * 10n ** BigInt(USDT_DECIMALS) + fraction;
}

export function useBscUsdtWallet() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [usdtBalance, setUsdtBalance] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const switchToBsc = useCallback(async () => {
    const provider = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) {
      setError("MetaMask was not detected. Install MetaMask to connect your wallet.");
      return;
    }

    setError("");
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_CHAIN_ID }],
      });
    } catch (switchError) {
      if (getErrorCode(switchError) !== 4902) {
        setError(getErrorMessage(switchError));
        return;
      }

      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BSC_CHAIN_ID,
              chainName: "BNB Smart Chain",
              rpcUrls: [BSC_RPC_URL],
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              blockExplorerUrls: ["https://bscscan.com"],
            },
          ],
        });
      } catch (addError) {
        setError(getErrorMessage(addError));
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const provider = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) {
      setError("MetaMask was not detected. Install MetaMask to connect your wallet.");
      return;
    }

    setIsConnecting(true);
    setError("");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!isStringArray(accounts) || accounts.length === 0) {
        throw new Error("No wallet account was authorized.");
      }

      const address = accounts[0];
      if (!address) {
        throw new Error("No wallet account was authorized.");
      }
      setAccount(address);
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_CHAIN_ID }],
      }).catch(async (switchError: unknown) => {
        if (getErrorCode(switchError) !== 4902) throw switchError;
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BSC_CHAIN_ID,
              chainName: "BNB Smart Chain",
              rpcUrls: [BSC_RPC_URL],
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              blockExplorerUrls: ["https://bscscan.com"],
            },
          ],
        });
      });
      const activeChainId = await provider.request({ method: "eth_chainId" });
      if (typeof activeChainId !== "string") {
        throw new Error("Could not detect the connected wallet network.");
      }
      setChainId(activeChainId);
      if (activeChainId.toLowerCase() !== BSC_CHAIN_ID) {
        throw new Error("Switch MetaMask to BNB Smart Chain to view USDT balance.");
      }
      setUsdtBalance(await getUsdtBalance(provider, address));
    } catch (connectError) {
      const code = getErrorCode(connectError);
      setError(
        code === 4001
          ? "Wallet connection was rejected. Approve the MetaMask request to continue."
          : getErrorMessage(connectError),
      );
      setUsdtBalance("");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    const provider = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) {
      setError("MetaMask was not detected.");
      return;
    }

    setError("");
    try {
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      setAccount("");
      setUsdtBalance("");
    } catch (disconnectError) {
      setError(
        getErrorCode(disconnectError) === 4001
          ? "Wallet disconnect was rejected in MetaMask."
          : getErrorMessage(disconnectError),
      );
      throw disconnectError;
    }
  }, []);

  const sendUsdt = useCallback(async (recipient: string, amount: number) => {
    const provider = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) throw new Error("MetaMask was not detected.");
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      throw new Error("The withdrawal wallet address is invalid.");
    }

    const [accounts, activeChainId] = await Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }),
    ]);
    if (!isStringArray(accounts) || !accounts[0]) {
      throw new Error("Connect MetaMask before approving a USDT withdrawal.");
    }
    if (typeof activeChainId !== "string" || activeChainId.toLowerCase() !== BSC_CHAIN_ID) {
      throw new Error("Switch MetaMask to BNB Smart Chain before sending USDT.");
    }

    const rawAmount = toUsdtBaseUnits(amount);
    const recipientWord = recipient.slice(2).toLowerCase().padStart(64, "0");
    const amountWord = rawAmount.toString(16).padStart(64, "0");
    const sender = accounts[0];
    const balanceResult = await provider.request({
      method: "eth_call",
      params: [
        {
          to: BSC_USDT_ADDRESS,
          data: `0x${USDT_BALANCE_OF_SELECTOR}${sender.toLowerCase().slice(2).padStart(64, "0")}`,
        },
        "latest",
      ],
    });
    if (typeof balanceResult !== "string" || !/^0x[0-9a-f]+$/i.test(balanceResult)) {
      throw new Error("Could not verify the sender's USDT balance.");
    }
    if (BigInt(balanceResult) < rawAmount) {
      throw new Error("Insufficient USDT balance to approve this withdrawal.");
    }

    const transactionHash = await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: sender,
          to: BSC_USDT_ADDRESS,
          value: "0x0",
          data: `0xa9059cbb${recipientWord}${amountWord}`,
        },
      ],
    });
    if (
      typeof transactionHash !== "string" ||
      !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)
    ) {
      throw new Error("MetaMask did not return a valid transaction hash.");
    }
    return transactionHash;
  }, []);

  useEffect(() => {
    const provider = window.ethereum;
    setIsInstalled(Boolean(provider));
    if (!provider) return;

    let active = true;
    const loadWallet = async () => {
      try {
        const [accounts, activeChainId] = await Promise.all([
          provider.request({ method: "eth_accounts" }),
          provider.request({ method: "eth_chainId" }),
        ]);
        if (!active) return;
        const currentAccount = isStringArray(accounts) ? accounts[0] ?? "" : "";
        const currentChainId = typeof activeChainId === "string" ? activeChainId : "";
        setAccount(currentAccount);
        setChainId(currentChainId);
        if (currentAccount && currentChainId.toLowerCase() === BSC_CHAIN_ID) {
          setUsdtBalance(await getUsdtBalance(provider, currentAccount));
        }
      } catch (loadError) {
        if (active) {
          console.error("Unable to read connected MetaMask wallet:", loadError);
          setError("Unable to read the connected wallet.");
        }
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccount = isStringArray(accounts) ? accounts[0] ?? "" : "";
      setAccount(nextAccount);
      setUsdtBalance("");
      if (nextAccount && chainId.toLowerCase() === BSC_CHAIN_ID) {
        void getUsdtBalance(provider, nextAccount)
          .then(setUsdtBalance)
          .catch((balanceError: unknown) => {
            console.error("Unable to refresh USDT balance:", balanceError);
            setError("Unable to read USDT balance.");
          });
      }
    };

    const handleChainChanged = (nextChainId: unknown) => {
      const nextId = typeof nextChainId === "string" ? nextChainId : "";
      setChainId(nextId);
      setUsdtBalance("");
      if (account && nextId.toLowerCase() === BSC_CHAIN_ID) {
        void getUsdtBalance(provider, account)
          .then(setUsdtBalance)
          .catch((balanceError: unknown) => {
            console.error("Unable to refresh USDT balance:", balanceError);
            setError("Unable to read USDT balance.");
          });
      }
    };

    void loadWallet();
    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    return () => {
      active = false;
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account, chainId]);

  return {
    isInstalled,
    account,
    chainId,
    usdtBalance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchToBsc,
    sendUsdt,
  };
}
