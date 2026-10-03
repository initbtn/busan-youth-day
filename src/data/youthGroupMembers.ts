export interface YouthGroupMember {
  id: string;
  name: string;
  baptismalName?: string;
  parish: string;
  district: string;
  role: string;
  saintId: string;
  avatarUrl?: string;
  motto?: string;
}

export const YOUTH_GROUP_MEMBERS: YouthGroupMember[] = [];

export function getYouthGroupMembers(saintId: string): YouthGroupMember[] {
  return YOUTH_GROUP_MEMBERS.filter((m) => m.saintId === saintId);
}

