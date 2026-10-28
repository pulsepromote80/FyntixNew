import { apiClient } from "@/spr-admin/lib/api-client";

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// ⚠️ Capital field names — exactly backend response jaise
export interface FundType {
  Id: number;
  Type: string;       // Display naam — "Working Wallet"
  Ftype: string;      // Backend code — "pp@ww"
}

export interface FundTypeWiseCrDr {
    Id: number;
    CrDr: number;
    Type: string;
    WalletId: number;
}

export interface WalletDetails {
    Name: string;
    IncomeWallet: number;
    DepositWallet: number;
    FundWallet: number;
    MentorWallet: number;
    RentWallet?: number;
    ROIWallet?: number;
    statusCode: number;
    message: string;
}

export interface UserWalletDetailsData {
    FundTypes: FundType[];
    FundTypeWiseCrDrList: FundTypeWiseCrDr[];
    WalletDetails: WalletDetails;
}

export const getUserWalletDetails = (
    loginId: string
): Promise<ApiResponse<UserWalletDetailsData>> => {
    return apiClient.get<ApiResponse<UserWalletDetailsData>>(
        `/admin/wallet-details?LoginId=${encodeURIComponent(loginId)}`
    );
};

// ============================================
// Credit/Debit Transaction (final submit with OTP)
// ============================================
export interface CreditDebitPayload {
    Wallettype: string;    // 👈 rename from WalletId
    CrDr: number;
    Authlogin: string;     // 👈 rename from LoginID
    Amt: number;           // 👈 rename from Amount
    Remark: string;        // 👈 rename from Description
    CrdDbtOTP: string;
}

export interface CreditDebitResponse {
    statusCode: number;
    message: string;
    data: null;
}

export const submitCreditDebit = (
  payload: CreditDebitPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post<ApiResponse<null>>(
    "/admin/credit-debit",
    payload
  );
};