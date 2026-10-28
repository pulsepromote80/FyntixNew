import { httpClient } from "@/spr-admin/lib/axios";

export interface IncomeRequest {
  id: string;
  requestId: number | null;
  userId: string;
  fullName: string;
  email: string;
  credit: number;
  debit: number;
  transactionType: string;
  remark: string;
  totalWithdrawal: number;
  status: string;
  wallet: string;
  withdrawalMode: string;
  adminCharges: number;
  release: number;
  createdDate: string;
  approvalDate: string;
  transactionHash: string;
}

interface IncomeRequestReport {
  unApWithIncome: IncomeRequest[];
  aprWithIncome: IncomeRequest[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function readNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function parseActionResponse(payload: unknown): { statusCode: number; message: string } {
  if (!isRecord(payload)) {
    throw new Error("Withdrawal action returned an invalid response.");
  }

  const responseData = isRecord(payload.data) ? payload.data : undefined;
  const nestedResult = responseData?.updateFundRequest;
  const result = Array.isArray(nestedResult) && isRecord(nestedResult[0])
    ? nestedResult[0]
    : responseData ?? payload;
  const statusCode = Number(result.statusCode);
  const message = readString(result.message);

  if (!Number.isFinite(statusCode) || !message) {
    throw new Error("Withdrawal action response is missing its status or message.");
  }

  return { statusCode, message };
}

function readRows(value: unknown, keys: string[]): IncomeRequest[] {
  if (!isRecord(value)) {
    throw new Error("Income request report must be an object.");
  }

  const key = keys.find((candidate) => Array.isArray(value[candidate]));
  if (!key) {
    throw new Error(`Income request report is missing the "${keys[0]}" list.`);
  }

  const rows = value[key];
  if (!Array.isArray(rows)) {
    throw new Error(`Income request report contains an invalid "${key}" list.`);
  }

  return rows.map((row, index) => {
    if (!isRecord(row)) {
      throw new Error(`Income request report contains an invalid row in "${key}".`);
    }

    const requestIdValue = row.Id ?? row.id ?? row.ID;
    const requestIdNumber = Number(requestIdValue);
    const requestId =
      requestIdValue !== null &&
      requestIdValue !== undefined &&
      Number.isInteger(requestIdNumber) &&
      requestIdNumber > 0
        ? requestIdNumber
        : null;
    const id = readString(row.URID) || readString(requestIdValue);
    const totalWithdrawal = readNumber(row.TotWithdl, row.debit);
    const adminCharges = readNumber(row.AdminCharges, row.AdminCharge);
    return {
      id: id || `${key}-${index}`,
      requestId,
      userId: readString(row.AuthLogin),
      fullName: readString(row.FullName),
      email: readString(row.Email),
      credit: readNumber(row.credit),
      debit: readNumber(row.debit),
      transactionType: readString(row.TransType),
      remark: readString(row.Remark),
      totalWithdrawal,
      status: readString(row.status) || "Pending",
      wallet: readString(row.Wallet),
      withdrawalMode: readString(row.withdrawalmode),
      adminCharges,
      release: readNumber(row.Release, totalWithdrawal - adminCharges),
      createdDate: readString(row.CreatedDate),
      approvalDate: readString(row.ApprovalDate),
      transactionHash: readString(row.TransHash),
    };
  });
}

function parseReport(payload: unknown): IncomeRequestReport {
  let report = payload;
  if (
    isRecord(report) &&
    (Number(report.statusCode) === 404 ||
      (report.data === null &&
        typeof report.message === "string" &&
        report.message.toLowerCase() === "no data found"))
  ) {
    return { unApWithIncome: [], aprWithIncome: [] };
  }

  if (
    isRecord(report) &&
    isRecord(report.data)
  ) {
    report = report.data;
  }

  if (
    isRecord(report) &&
    (Number(report.statusCode) === 404 ||
      (report.data === null &&
        typeof report.message === "string" &&
        report.message.toLowerCase() === "no data found"))
  ) {
    return { unApWithIncome: [], aprWithIncome: [] };
  }

  return {
    unApWithIncome: readRows(report, ["unApWithIncome", "UnApWithIncome"]),
    aprWithIncome: readRows(report, ["aprWithIncome", "AprWithIncome"]),
  };
}

export const incomeRequestService = {
  getReport: async (): Promise<IncomeRequestReport> => {
    const { data } = await httpClient.post<unknown>("/admin/income-request-report", {});
    return parseReport(data);
  },
  approveOrReject: async (payload: {
    action: "approve" | "reject";
    id: number;
    authLoginId: string;
    rfstatus: 1 | 2;
    remark: string;
  }): Promise<{ statusCode: number; message: string }> => {
    const { data } = await httpClient.post<unknown>(
      "/admin/withdrawal-request/action",
      payload,
    );
    return parseActionResponse(data);
  },
  recordUsdtTransfer: async (payload: {
    AuthLoginId: string;
    debit: number;
    Wallet: string;
    TransHash: string;
  }): Promise<{ statusCode: number; message: string }> => {
    const { data } = await httpClient.post<unknown>(
      "/admin/withdrawal-request/action",
      { action: "usdt-transfer", ...payload },
    );
    return parseActionResponse(data);
  },
};
