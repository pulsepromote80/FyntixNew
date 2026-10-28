import { create } from "zustand";

export interface DirectMember {
  TopupStatus: string;
  Loginid: string;
  Name: string;
  Position: string;
  RegDate: string;
  Mobile: string;
  Email: string;
  SubscriptionAmount: number;
  SubscribeDate: string;
  Urank: string;
  BinaryLbuss: number;
  BinaryRbuss: number;
  BinaryTotTeam: number;
  BinaryActiveTeam: number;
}

export interface DownlineMember {
  loginid: string;
  Name: string;
  Mobile: string;
  ParentID: string;
  SponserId: string;
  RegDate: string;
  TopupDate: string;
  PackageAmount: number;
  LeftLBuss: number;
  RightRBuss: number;
  introSide: string;
}

export interface NetworkTreeNode {
  uLvl?: number;
  id?: number;
  Loginid?: string;
  SponsorId?: string;
  Name?: string;
  RegDate?: string;
  Email?: string;
  Mobile?: string;
  TopupDate?: string;
  status?: string;
  LeaseAmount?: number;
  TotalTeam?: number;
  ActiveTeam?: number;
  TeamBusiness?: number;
  DirectBusiness?: number;
  children?: NetworkTreeNode[];
}

interface CommunityState {
  directMemberData: DirectMember[];
  personalTeamList: DownlineMember[];
  networkTreeData: NetworkTreeNode[];
  loading: boolean;
  error: { message: string } | null;
  setDirectMemberData: (data: DirectMember[]) => void;
  setPersonalTeamList: (data: DownlineMember[]) => void;
  setNetworkTreeData: (data: NetworkTreeNode[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: { message: string } | null) => void;
  clearData: () => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  directMemberData: [],
  personalTeamList: [],
  networkTreeData: [],
  loading: false,
  error: null,
  setDirectMemberData: (data) => set({ directMemberData: data }),
  setPersonalTeamList: (data) => set({ personalTeamList: data }),
  setNetworkTreeData: (data) => set({ networkTreeData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearData: () => set({ directMemberData: [], personalTeamList: [], networkTreeData: [], loading: false, error: null }),
}));
