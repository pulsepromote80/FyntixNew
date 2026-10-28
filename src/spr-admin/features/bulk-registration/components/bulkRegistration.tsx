"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import axios from "axios";
import { FileText, LoaderCircle, Search, Users, UserRound } from "lucide-react";
import { bulkRegistrationService } from "@/spr-admin/features/bulk-registration/services/bulkRegistration.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

interface Country {
  id: string;
  name: string;
}

interface RegistrationForm {
  fName: string;
  lName: string;
  mobile: string;
  email: string;
  password: string;
  noOfId: string;
  countryId: string;
  position: "Left" | "Right";
}

type RegistrationField = keyof RegistrationForm;

const initialForm: RegistrationForm = {
  fName: "",
  lName: "",
  mobile: "",
  email: "",
  password: "",
  noOfId: "",
  countryId: "",
  position: "Left",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getCaseInsensitiveField(record: Record<string, unknown>, field: string): unknown {
  const entry = Object.entries(record).find(([key]) => key.toLowerCase() === field.toLowerCase());
  return entry?.[1];
}

function extractList(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!isRecord(value) || depth > 4) return null;

  for (const key of ["data", "countries", "items", "results", "records"]) {
    if (key in value) {
      const list = extractList(value[key], depth + 1);
      if (list) return list;
    }
  }
  return null;
}

function parseCountries(value: unknown): Country[] {
  const list = extractList(value);
  if (!list) {
    throw new Error("The country list response is invalid.");
  }

  return list.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id =
      getCaseInsensitiveField(item, "country_Id") ??
      getCaseInsensitiveField(item, "countryId") ??
      getCaseInsensitiveField(item, "id");
    const name =
      getCaseInsensitiveField(item, "country_Name") ??
      getCaseInsensitiveField(item, "countryName") ??
      getCaseInsensitiveField(item, "name");

    if (
      (typeof id !== "string" && typeof id !== "number") ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return [];
    }
    return [{ id: String(id), name: name.trim() }];
  });
}

function extractReferralName(value: unknown, depth = 0): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const name = extractReferralName(item, depth + 1);
      if (name) return name;
    }
    return null;
  }
  if (!isRecord(value) || depth > 4) return null;

  const directName =
    getCaseInsensitiveField(value, "name") ?? getCaseInsensitiveField(value, "userName");
  if (typeof directName === "string" && directName.trim()) return directName.trim();

  const firstName = getCaseInsensitiveField(value, "FName");
  const lastName = getCaseInsensitiveField(value, "LName");
  if (typeof firstName === "string" || typeof lastName === "string") {
    const fullName = [firstName, lastName]
      .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
      .join(" ");
    if (fullName) return fullName;
  }

  for (const key of ["data", "result"]) {
    if (key in value) {
      const name = extractReferralName(value[key], depth + 1);
      if (name) return name;
    }
  }
  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return error instanceof Error ? error.message : fallback;
}

function validate(form: RegistrationForm, referralId: string) {
  const errors: Partial<Record<RegistrationField | "referralId", string>> = {};
  if (!referralId.trim()) errors.referralId = "Referral User ID is required.";
  if (!form.fName.trim()) errors.fName = "First name is required.";
  if (!form.lName.trim()) errors.lName = "Last name is required.";
  if (!form.mobile.trim()) errors.mobile = "Mobile number is required.";
  else if (!/^\d{10,15}$/.test(form.mobile.trim())) {
    errors.mobile = "Enter a valid mobile number (10-15 digits).";
  }
  if (!form.email.trim()) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.password.trim()) errors.password = "Password is required.";
  const count = Number(form.noOfId);
  if (!form.noOfId || !Number.isInteger(count)) {
    errors.noOfId = "Enter the number of IDs to register.";
  } else if (count < 1 || count > 50) {
    errors.noOfId = "Number of IDs must be between 1 and 50.";
  }
  if (!form.countryId) errors.countryId = "Select a country.";
  return errors;
}

export default function BulkRegistration() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState("");
  const [referralId, setReferralId] = useState("");
  const [referralName, setReferralName] = useState("");
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<RegistrationField | "referralId", string>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    let isCurrent = true;
    setCountriesLoading(true);
    setCountriesError("");

    bulkRegistrationService
      .getCountries()
      .then((response) => {
        const result = parseCountries(response);
        if (isCurrent) setCountries(result);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setCountriesError(getErrorMessage(error, "Failed to load countries."));
        }
      })
      .finally(() => {
        if (isCurrent) setCountriesLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleLookup = async () => {
    const authLogin = referralId.trim();
    if (!authLogin || isLookingUp) return;

    setIsLookingUp(true);
    setIsReferralValid(false);
    setReferralName("");
    setReferralError("");
    setErrors((current) => {
      const { referralId: _referralId, ...remaining } = current;
      return remaining;
    });
    try {
      const response = await bulkRegistrationService.lookupReferral(authLogin);
      const name = extractReferralName(response);
      if (!name) {
        setReferralError("Referral user not found. Check the user ID and try again.");
        return;
      }
      setReferralName(name);
      setIsReferralValid(true);
    } catch (error) {
      setReferralError(getErrorMessage(error, "Failed to look up referral user."));
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleReferralChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReferralId(event.target.value);
    setReferralName("");
    setIsReferralValid(false);
    setReferralError("");
    setForm(initialForm);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const field = name as RegistrationField;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!isReferralValid) {
      const message = "Verify the referral user ID before submitting.";
      setReferralError(message);
      showToast(message, "error");
      return;
    }

    const validationErrors = validate(form, referralId);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await bulkRegistrationService.register({
        IntroAuthlogin: referralId.trim(),
        IntroSide: form.position === "Left" ? "L" : "R",
        FName: form.fName.trim(),
        LName: form.lName.trim(),
        Mobile: form.mobile.trim(),
        Email: form.email.trim(),
        Password: form.password,
        NoOfId: Number(form.noOfId),
        CountryId: form.countryId,
      });
      showToast("Bulk registration completed successfully.");
      setForm(initialForm);
      setReferralId("");
      setReferralName("");
      setIsReferralValid(false);
      setErrors({});
    } catch (error) {
      showToast(getErrorMessage(error, "Bulk registration failed."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-gray-100";

  return (
    <div className="spr-admin-bulk-registration flex w-full items-start justify-center px-4 pb-6 pt-4 font-sans">
      <div className="flex w-full flex-col gap-5">
        <header className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Users className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Registration</h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Register multiple users efficiently in one go
            </p>
          </div>
        </header>

        <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="text-lg font-bold text-white">Registration Details</h2>
            <p className="mt-0.5 text-xs text-white/90">
              Fill in the information below to register users in bulk
            </p>
          </div>

          <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-blue-600" aria-hidden />
                <h3 className="text-base font-semibold text-gray-800">Referral User Information</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                    htmlFor="bulk-referral-id"
                  >
                    Referral User ID <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="bulk-referral-id"
                      value={referralId}
                      disabled={isLookingUp}
                      onChange={handleReferralChange}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleLookup();
                        }
                      }}
                      className={inputClassName}
                      placeholder="Enter referral user ID"
                      aria-invalid={Boolean(referralError)}
                      aria-describedby={referralError ? "bulk-referral-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => void handleLookup()}
                      disabled={!referralId.trim() || isLookingUp}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      {isLookingUp ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Search className="h-4 w-4" aria-hidden />
                      )}
                      {isLookingUp ? "Checking" : "Verify"}
                    </button>
                  </div>
                  {referralError && (
                    <p
                      id="bulk-referral-error"
                      className="mt-1.5 text-xs text-red-700"
                      role="alert"
                    >
                      {referralError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                    htmlFor="bulk-referral-name"
                  >
                    Referral Name
                  </label>
                  <input
                    id="bulk-referral-name"
                    value={referralName}
                    readOnly
                    className={inputClassName}
                    placeholder="Referral name will appear here"
                  />
                </div>
              </div>
            </section>

            {isReferralValid && (
              <section className="space-y-4 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" aria-hidden />
                  <h3 className="text-base font-semibold text-gray-800">
                    User Registration Details
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="First Name" error={errors.fName}>
                    <input
                      name="fName"
                      value={form.fName}
                      onChange={handleChange}
                      className={inputClassName}
                      autoComplete="given-name"
                    />
                  </FormField>
                  <FormField label="Last Name" error={errors.lName}>
                    <input
                      name="lName"
                      value={form.lName}
                      onChange={handleChange}
                      className={inputClassName}
                      autoComplete="family-name"
                    />
                  </FormField>
                  <FormField label="Mobile Number" error={errors.mobile}>
                    <input
                      name="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={handleChange}
                      className={inputClassName}
                      autoComplete="tel"
                    />
                  </FormField>
                  <FormField label="Email Address" error={errors.email}>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClassName}
                      autoComplete="email"
                    />
                  </FormField>
                  <FormField label="Password" error={errors.password}>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      className={inputClassName}
                      autoComplete="new-password"
                    />
                  </FormField>
                  <FormField label="Number of IDs (max. 50)" error={errors.noOfId}>
                    <input
                      name="noOfId"
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      value={form.noOfId}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="Enter 1 to 50"
                    />
                  </FormField>
                  <FormField label="Country" error={errors.countryId}>
                    <select
                      name="countryId"
                      value={form.countryId}
                      onChange={handleChange}
                      disabled={countriesLoading || Boolean(countriesError)}
                      className={inputClassName}
                    >
                      <option value="">
                        {countriesLoading ? "Loading countries..." : "Select country"}
                      </option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Position">
                    <select
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className={inputClassName}
                    >
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </select>
                  </FormField>
                </div>
                {countriesError && (
                  <p className="text-sm text-red-700" role="alert">
                    {countriesError}
                  </p>
                )}
              </section>
            )}

            <button
              type="submit"
              disabled={!isReferralValid || isSubmitting || isLookingUp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
              {isSubmitting ? "Processing..." : "Register Users"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
