import { create } from "zustand";
import type { DirectMember } from "@/services/community.service";

interface PersonalTeamMember {
  uLvl?: number;
  Loginid?: string;
  SponsorId?: string;
  Name?: string;
  RegDate?: string;
  Email?: string;
  Mobile?: string;
  Urank?: string;
  status?: string;
  SubscriptionAmount?: number;
  SubscribeDate?: string;
  DeployDate?: string;
  TeamBusiness?: number;
  ActiveTeam?: number;
  totTeam?: number;
  CountryFlag?: string;
  CountryId?: number;
  Package?: number;
}

interface LeftRightDownlineMember {
  name?: string;
  loginid?: string;
  mobile?: string;
  sponserId?: string;
  regDate?: string;
  licneseAmount?: number;
  deployAmount?: number;
  leftLBuss?: number;
  rightRBuss?: number;
  introSide?: string;
}

interface CommunityState {
  directMemberData: DirectMember[];
  personalTeamData: PersonalTeamMember[];
  leftRightData: LeftRightDownlineMember[];
  loading: boolean;
  error: string | null;
  setDirectMemberData: (data: DirectMember[]) => void;
  setPersonalTeamData: (data: PersonalTeamMember[]) => void;
  setLeftRightData: (data: LeftRightDownlineMember[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearDirectMemberData: () => void;
  clearPersonalTeamData: () => void;
  clearLeftRightData: () => void;
  fetchLeftRightData: (params: { LoginId: string; side: string; FromDate: string; ToDate: string }) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  directMemberData: [],
  personalTeamData: [],
  leftRightData: [],
  loading: false,
  error: null,
  setDirectMemberData: (data) => set({ directMemberData: data }),
  setPersonalTeamData: (data) => set({ personalTeamData: data }),
  setLeftRightData: (data) => set({ leftRightData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearDirectMemberData: () => set({ directMemberData: [], error: null }),
  clearPersonalTeamData: () => set({ personalTeamData: [], error: null }),
  clearLeftRightData: () => set({ leftRightData: [], error: null }),
  fetchLeftRightData: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/Community/getLeftRightdownlineTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch left/right downline data");
      }

      set({ leftRightData: data.data || data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch left/right downline data",
        loading: false,
      });
    }
  },
}));
