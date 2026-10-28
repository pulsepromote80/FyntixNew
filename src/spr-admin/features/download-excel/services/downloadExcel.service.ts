import { apiClient } from "@/spr-admin/lib/api-client";

export const downloadExcelService = {
  generate: (transType: string) =>
    apiClient.post<unknown, { transType: string }>("/admin/reports/download-excel", {
      transType,
    }),
};
