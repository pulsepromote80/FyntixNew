"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import * as OTPAuth from "otpauth";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Shield, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  RefreshCw,
  Loader2
} from "lucide-react";

export function Manage2FAForm() {
  const [otp, setOtp] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [qrGeneratedOnce, setQrGeneratedOnce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
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

  useEffect(() => {
    if (!statusCheckedRef.current) {
      statusCheckedRef.current = true;
      check2FAStatus();
      // Auto-generate QR if 2FA is not enabled
      generateQR();
    }
  }, []);

  const check2FAStatus = async () => {
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
  };

  useEffect(() => {
    if (twoFAState.enabled || twoFAState.is2FAAlreadyEnabled) {
      return;
    }

    if (qrGeneratedOnce) {
      return;
    }

    if (error && typeof error === 'object' && 'data' in error) {
      const payload = (error as any).data;
      if (payload && typeof payload === "object") {
        const qrCode = payload.qrCode || payload.otpauthUrl || payload.qr || payload.url || null;
        const manualKey = payload.manualKey || payload.secret || payload.secretKey || null;

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
    }
  }, [error]);

  const generateQR = async () => {
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
  };

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

  const handleDisable = () => {
    if (window.confirm("Are you sure you want to disable 2FA?")) {
      setTwoFAState({
        enabled: false,
        secret: null,
        otpauthUrl: null,
        qrGenerated: false,
        is2FAAlreadyEnabled: false,
      });
      setQrGeneratedOnce(false);
      setOtp("");
      toastShownRef.current = false;
      qrToastShownRef.current = false;
      toast.success("2FA disabled. You can now generate a new QR.");
    }
  };

  const copySecret = () => {
    if (twoFAState.secret) {
      navigator.clipboard.writeText(twoFAState.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast.success("Secret copied!");
    }
  };

  const isEnabled = twoFAState.enabled || twoFAState.is2FAAlreadyEnabled;

  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    return 'Something went wrong. Please try again.';
  };

  return (
    <div className="max-w-4xl p-4 mx-auto sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">
            <Shield className="w-5 h-5 text-amber-500" />
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

      {error && (
        <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl dark:text-red-400">
          {getErrorMessage()}
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
                <QrCode className="w-4 h-4 text-amber-500" />
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
                className="flex items-center justify-center w-full gap-2 px-5 py-3 font-bold text-gray-900 transition-all shadow-lg rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="w-full px-4 py-3 font-mono text-lg tracking-widest text-center text-gray-900 transition-all border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                placeholder="· · · · · ·"
                disabled={!twoFAState.secret || isEnabling || isValidating}
              />

              <button
                type="button"
                onClick={handleEnable2FA}
                disabled={isEnabling || isValidating || !twoFAState.secret || !otp}
                className="flex items-center justify-center w-full gap-2 px-5 py-3 mt-4 font-bold text-white transition-colors shadow-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
