"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import * as OTPAuth from "otpauth";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Shield, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2
} from "lucide-react";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(...values: unknown[]): string | null {
  return values.find((value): value is string => typeof value === "string" && value.length > 0) ?? null;
}

export function Manage2FAForm() {
  const [otp, setOtp] = useState("");
  const [isEnabling, setIsEnabling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [qrGeneratedOnce, setQrGeneratedOnce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const statusCheckedRef = useRef(false);
  const toastShownRef = useRef(false);
  const qrToastShownRef = useRef(false);
  

  const [twoFAState, setTwoFAState] = useState({
    enabled: false,
    secret: null as string | null,
    otpauthUrl: null as string | null,
    qrGenerated: false,
    is2FAAlreadyEnabled: false,
  });

  const check2FAStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/generate-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      const result = await response.json();

      // Check if 2FA is already enabled
      const status = result.data?.Status !== undefined ? result.data.Status : result.data?.status;
      const message = result.data?.Message || result.data?.message;

      if (result.success && status === false &&
          message?.toLowerCase().includes('already enabled')) {
        setTwoFAState(prev => ({
          ...prev,
          is2FAAlreadyEnabled: true,
          enabled: true,
          qrGenerated: false,
        }));
        setQrGeneratedOnce(true);
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          toast.success("🔐 2FA is already enabled for this account");
        }
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  }, []);

  useEffect(() => {
    if (twoFAState.enabled || twoFAState.is2FAAlreadyEnabled) {
      return;
    }

    if (qrGeneratedOnce) {
      return;
    }

    if (isRecord(error) && isRecord(error.data)) {
      const payload = error.data;
      const qrCode = firstString(payload.qrCode, payload.otpauthUrl, payload.qr, payload.url);
      const manualKey = firstString(payload.manualKey, payload.secret, payload.secretKey);

      if (qrCode && manualKey) {
        setTwoFAState(prev => ({
          ...prev,
          secret: manualKey,
          otpauthUrl: qrCode,
          qrGenerated: true,
          is2FAAlreadyEnabled: false,
        }));
        setQrGeneratedOnce(true);
        if (!qrToastShownRef.current) {
          qrToastShownRef.current = true;
          toast.success("✅ QR generated! Scan it with Google Authenticator");
        }
      }
    }
  }, [
    error,
    qrGeneratedOnce,
    twoFAState.enabled,
    twoFAState.is2FAAlreadyEnabled,
  ]);

  const generateQR = useCallback(async () => {
    if (twoFAState.enabled || twoFAState.is2FAAlreadyEnabled) {
      toast.error("2FA is already enabled for this account");
      return;
    }

    qrToastShownRef.current = false;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/generate-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        // Check if 2FA is already enabled
        const status = result.data.Status !== undefined ? result.data.Status : result.data.status;
        const message = result.data.Message || result.data.message;

        if (status === false && message?.toLowerCase().includes('already enabled')) {
          setTwoFAState(prev => ({
            ...prev,
            is2FAAlreadyEnabled: true,
            enabled: true,
            qrGenerated: false,
          }));
          setQrGeneratedOnce(true);
          if (!toastShownRef.current) {
            toastShownRef.current = true;
            toast.success("🔐 2FA is already enabled for this account");
          }
          return;
        }

        const qrCode = result.data.Data?.QrCode || result.data.data?.qrCode || result.data.qrCode || result.data.otpauthUrl || result.data.qr || result.data.url || null;
        const manualKey = result.data.Data?.ManualKey || result.data.data?.manualKey || result.data.manualKey || result.data.secret || result.data.secretKey || null;
        const isAlreadyGenerated = result.data.Data?.IsAlreadyGenerated || result.data.data?.isAlreadyGenerated || result.data.isAlreadyGenerated || false;

        if (qrCode && manualKey) {
          setTwoFAState(prev => ({
            ...prev,
            secret: manualKey,
            otpauthUrl: qrCode,
            qrGenerated: true,
            is2FAAlreadyEnabled: false,
          }));
          setQrGeneratedOnce(true);
          if (!qrToastShownRef.current) {
            qrToastShownRef.current = true;
            const msg = isAlreadyGenerated ? "✅ QR already exists! Scan it with Google Authenticator" : "✅ QR generated! Scan it with Google Authenticator";
            toast.success(msg);
          }
        }
      } else if (result.message?.toLowerCase().includes('already enabled')) {
        setTwoFAState(prev => ({
          ...prev,
          is2FAAlreadyEnabled: true,
          enabled: true,
          qrGenerated: false,
        }));
        setQrGeneratedOnce(true);
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          toast.success("🔐 2FA is already enabled for this account");
        }
      } else {
        setError(result);
        toast.error(result.message || "Failed to generate QR");
      }
    } catch (error) {
      console.error("QR Generation error:", error);
      setError(error);
      toast.error("Failed to generate QR");
    } finally {
      setLoading(false);
    }
  }, [twoFAState.enabled, twoFAState.is2FAAlreadyEnabled]);

  useEffect(() => {
    if (!statusCheckedRef.current) {
      statusCheckedRef.current = true;
      void check2FAStatus();
      void generateQR();
    }
  }, [check2FAStatus, generateQR]);

  const validateOtp = (secret: string, token: string) => {
    if (!secret || !token || token.length !== 6) {
      return false;
    }

    try {
      const totp = new OTPAuth.TOTP({
        issuer: "KALKII",
        label: "user",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const delta = totp.validate({ token: String(token), window: 1 });
      return delta !== null;
    } catch (error) {
      console.error("OTP validation error:", error);
      return false;
    }
  };

  const handleEnable2FA = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter 6-digit code");
      return;
    }

    if (!twoFAState.secret) {
      toast.error("Please generate QR code first");
      return;
    }

    const isValid = validateOtp(twoFAState.secret, otp);
    if (!isValid) {
      toast.error("Invalid authenticator code. Please try again.");
      return;
    }

    setIsEnabling(true);

    try {
      const response = await fetch("/api/auth/enable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      });
      const result = await response.json();

      const status = result.data?.Status !== undefined ? result.data.Status : result.data?.status;
      const message = result.data?.Message || result.data?.message;

      if (result.success && status === true) {
        toast.success("2FA enabled successfully!");
        setOtp("");
        await handleValidateCode();
      } else {
        const errorMsg = message || result.message || "Failed to enable 2FA";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Enable 2FA error:", error);
      toast.error("Failed to enable 2FA");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleValidateCode = async () => {
    setIsValidating(true);

    try {
      const response = await fetch("/api/auth/validate-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      });
      const result = await response.json();

      const status = result.data?.Status !== undefined ? result.data.Status : result.data?.status;
      const message = result.data?.Message || result.data?.message;

      if (result.success && status === true) {
        setTwoFAState(prev => ({
          ...prev,
          enabled: true,
          qrGenerated: false,
        }));
        toast.success(message || "Code validated successfully");
      } else {
        const errorMsg = message || result.message || "Verification failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Validate code error:", error);
      toast.error("Verification failed");
    } finally {
      setIsValidating(false);
    }
  };

  const isEnabled = twoFAState.enabled || twoFAState.is2FAAlreadyEnabled;

  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (isRecord(error) && typeof error.message === "string") return error.message;
    if (
      isRecord(error) &&
      isRecord(error.data) &&
      typeof error.data.message === "string"
    ) {
      return error.data.message;
    }
    return 'Something went wrong. Please try again.';
  };

  return (
    <div className="max-w-4xl p-4 mx-auto sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">
            <Shield className="w-5 h-5 text-[#1680ff] dark:text-[#25c6e8]" />
            Two-Factor Authentication
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEnabled 
              ? "Your account is secured with 2FA" 
              : qrGeneratedOnce 
                ? "Enter OTP to enable 2FA" 
                : "Add an extra layer of security to your account"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEnabled ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold text-sm rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold text-sm rounded-full border border-red-200 dark:border-red-800">
              <XCircle className="w-4 h-4" /> Not Enabled
            </span>
          )}
        </div>
      </div>

      {Boolean(error) && (
        <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl dark:text-red-400">
          {getErrorMessage() ?? "Something went wrong. Please try again."}
          {!qrGeneratedOnce && !isEnabled && (
            <button 
              onClick={generateQR}
              className="block mt-2 text-xs underline hover:no-underline"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {isEnabled ? (
        <div className="p-6 border bg-gray-50 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-700/60 rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                2FA is Enabled
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your account is protected with two-factor authentication.
              </p>
              {twoFAState.is2FAAlreadyEnabled && (
                <p className="mt-2 text-xs text-amber-600">
                  ⚠️ 2FA was already enabled for this account
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border bg-gray-50 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-700/60 rounded-2xl sm:p-6">
          <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-white/70 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <QrCode className="w-4 h-4 text-[#1680ff] dark:text-[#25c6e8]" />
                {twoFAState.otpauthUrl ? "Scan this QR" : "Generate QR Code"}
              </div>
              
              {twoFAState.otpauthUrl ? (
                <div className="p-3 bg-white shadow-sm dark:bg-gray-800 rounded-xl">
                  {twoFAState.otpauthUrl.startsWith("data:image") ? (
                    <img
                      src={twoFAState.otpauthUrl}
                      alt="QR Code"
                      className="object-contain w-48 h-48"
                    />
                  ) : (
                    <QRCodeCanvas value={twoFAState.otpauthUrl} size={180} />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-48 h-48 bg-gray-100 border-2 border-gray-300 border-dashed dark:bg-gray-800 rounded-xl dark:border-gray-600">
                  <QrCode className="w-12 h-12 text-gray-400" />
                  <p className="mt-2 text-xs text-gray-400">
                    {qrGeneratedOnce ? "QR already generated" : "No QR generated"}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={generateQR}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] px-5 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {qrGeneratedOnce ? "Refresh QR" : "Generate QR"}
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                {qrGeneratedOnce 
                  ? "Scan QR with Google Authenticator and enter code below" 
                  : "Click Generate QR to start setup"}
              </p>
            </div>

            <div className="p-4 rounded-xl">
              <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Verify & Enable 2FA
              </div>

              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Authenticator Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-3 text-center font-mono text-lg tracking-widest text-gray-900 transition-all focus:border-[#1680ff] focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                placeholder="· · · · · ·"
                disabled={!twoFAState.secret || isEnabling || isValidating}
              />

              <button
                type="button"
                onClick={handleEnable2FA}
                disabled={isEnabling || isValidating || !twoFAState.secret || !otp}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] px-5 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(isEnabling || isValidating) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEnabling ? "Enabling..." : "Verifying..."}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Enable 2FA
                  </>
                )}
              </button>

              {twoFAState.secret && qrGeneratedOnce && (
                <p className="mt-2 text-xs text-center text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              )}

              {loading && !twoFAState.qrGenerated && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-amber-600 dark:text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating QR code...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
