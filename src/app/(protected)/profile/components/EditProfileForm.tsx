"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaWallet, FaSave, FaUserCircle, FaPaperPlane } from "react-icons/fa";
import type { SelectOption } from "@/types/common";


const editProfileSchema = z.object({
  fName: z.string().min(1, "First name is required"),
  lName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(7, "Mobile number must be at least 7 digits").max(13, "Mobile number must be at most 13 digits"),
  countryid: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  walletBep20: z.string().optional(),
  updateprofileotp: z.string().min(1, "OTP is required"),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export function EditProfileForm() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const methods = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fName: "",
      lName: "",
      email: "",
      mobile: "",
      countryid: "",
      address: "",
      walletBep20: "",
      updateprofileotp: "",
    },
  });

  const { formState: { isSubmitting } } = methods;
  const { watch, setValue } = methods;
  const walletBep20 = watch("walletBep20");

  // Fetch profile details and countries on mount
  useEffect(() => {
    fetchProfileDetails();
    fetchCountries();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const response = await fetch("/api/auth/profile-details");
      const result = await response.json();

      if (result.success && result.data?.data?.[0]) {
        const data = result.data.data[0];
        setValue("fName", data.FName || "");
        setValue("lName", data.LName || "");
        setValue("email", data.Email || "");
        setValue("mobile", data.Mobile || "");
        setValue("countryid", data.CountryId?.toString() || "");
        setValue("address", data.Address || "");
        setValue("walletBep20", data.WalletBep20 || "");
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/auth/countries");

      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        const countryOptions = result.data.map((country: any) => ({
          label: country.Country_Name || country.name || country.countryName,
          value: country.Country_Id?.toString() || country.id?.toString() || country.countryId?.toString(),
        }));
        setCountries(countryOptions);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      const response = await fetch("/api/auth/send-otp-update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setOtpSent(true);
        toast.success(result.message || "OTP sent to your email");
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const isValidBep20Length = (value: string) => {
    if (!value) return true;
    return value.length >= 38 && value.length <= 44;
  };

  const onSubmit = async (data: EditProfileValues) => {
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FName: data.fName,
          LName: data.lName,
          Address: data.address ?? "",
          mobile: data.mobile,
          countryid: parseInt(data.countryid),
          WalletBep20: data.walletBep20 ?? "",
          updateprofileotp: data.updateprofileotp,
        }),
      });

      const result = await response.json();

      const statusCode = result.data?.statusCode || result.statusCode;
      const message = result.data?.message || result.message;

      if (result.success && statusCode === 200) {
        // Update local store
        if (user) {
          setUser({
            ...user,
            name: `${data.fName} ${data.lName}`,
            email: data.email,
          });
        }

        toast.success(message || "Profile updated successfully");
        setOtpSent(false);
        setValue("updateprofileotp", "");
      } else {
        toast.error(message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal Information Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
            <FaUserCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaUser className="w-4 h-4 text-amber-500" />
                First Name <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="fName"
                placeholder={loading ? "Loading..." : "Enter your first name"}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaUser className="w-4 h-4 text-amber-500" />
                Last Name <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="lName"
                placeholder={loading ? "Loading..." : "Enter your last name"}
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
            <FaEnvelope className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Contact Information
            </h3>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaEnvelope className="w-4 h-4 text-amber-500" />
              Email
            </label>
            <FormInput
              name="email"
              type="email"
              placeholder={loading ? "Loading..." : ""}
              readOnly
              disabled
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mt-4">
            <div className="col-span-3 sm:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaGlobe className="w-4 h-4 text-amber-500" />
                Code
              </label>
              <input
                type="text"
                value="+91"
                readOnly
                disabled
                className="w-full px-3 sm:px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="col-span-9 sm:col-span-10">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaPhone className="w-4 h-4 text-amber-500" />
                Mobile
              </label>
              <FormInput
                name="mobile"
                type="tel"
                placeholder={loading ? "Loading..." : "Enter mobile number"}
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
            <FaGlobe className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Location
            </h3>
          </div>

          <div className="relative w-full">
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaGlobe className="w-4 h-4 text-amber-500" />
              Country <span className="text-red-500">*</span>
            </label>
            <FormSelect
              name="countryid"
              options={countries}
              placeholder={loading ? "Loading..." : "Select Country"}
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaMapMarkerAlt className="w-4 h-4 text-amber-500" />
              Address
            </label>
            <FormInput
              name="address"
              placeholder={loading ? "Loading..." : "Enter your address"}
            />
          </div>
        </div>

        {/* Wallet Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
            <FaWallet className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Wallet Information
            </h3>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FaWallet className="w-4 h-4 text-amber-400" />
              Wallet Address (BEP20)
            </label>
            <FormInput
              name="walletBep20"
              placeholder={loading ? "Loading..." : "Enter BEP20 wallet address"}
              maxLength={44}
            />
            {walletBep20 && !isValidBep20Length(walletBep20) && (
              <p className="mt-1 text-xs text-red-500">
                Please Enter a Valid BEP20 USDT Wallet Address (38-44 characters)
              </p>
            )}
          </div>
        </div>

        {/* OTP Verification Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
            <FaPaperPlane className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              OTP Verification
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter OTP <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="updateprofileotp"
                placeholder="Enter OTP sent to your email"
                type="text"
              />
            </div>
            <div className="flex items-end sm:items-center">
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpSent}
                className="w-full sm:w-auto px-4 py-2.5 font-semibold text-gray-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {sendingOtp ? "Sending..." : otpSent ? "OTP Sent" : "Send OTP"}
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !otpSent}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FaSave className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </FormProvider>
  );
}