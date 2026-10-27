import { apiClient } from "@/lib/api-client";

export interface DirectMember {
  Urid?: string;
  Name?: string;
  Loginid?: string;
  Mobile?: string;
  Email?: string;
  RegDate?: string;
  Position?: string;
  TopupStatus?: string;
  SubscriptionAmount?: number;
  leaseAmount?: number;
  topupDate?: string;
  BinaryLbuss?: number;
  BinaryRbuss?: number;
  DeployDate?: string;
  TeamBusiness?: number;
  Urank?: string;
  BinaryActiveTeam?: number;
  BinaryTotTeam?: number;
  PendingCredit?: string;
  SubscribeDate?: string;
  Package?: number;
  ActivationDate?: string;
}

export interface DirectMemberResponse {
  statusCode: number;
  message: string;
  data?: DirectMember[];
}

export const communityService = {
  getDirectMember: (body: { urid?: string; statusId?: string; loginid?: string }) =>
    apiClient.post<DirectMemberResponse>("/Community/direct-network", body),
  getPersonalTeam: (body: { uRank?: string; lvl?: string; statusId?: string }) =>
    apiClient.post<DirectMemberResponse>("/Community/personal-team", body),
  getRank: () =>
    apiClient.get<any>("/Community/rank"),
};
