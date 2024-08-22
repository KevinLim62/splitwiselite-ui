import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Member = {
  id: number;
  name: string;
  isActive: boolean;
};

interface MemberSlice {
  members: Member[];
  addMember: (member: Member) => void;
  editMember: (updatedMember: Member) => void;
  deleteMember: (id: number) => void; // Corrected to match the function signature in the interface
}

export const useMemberStore = create<MemberSlice>()(
  persist(
    (set) => ({
      members: [] as Member[], // Corrected to plural 'Members'

      addMember: (member: Member) =>
        set((state: { members: Member[] }) => ({
          members: [member, ...state.members], // Corrected to push the new Member into the array
        })),

      editMember: (updatedMember: Member) =>
        set((state: { members: Member[] }) => ({
          members: state.members.map((member) =>
            member.id === updatedMember.id ? updatedMember : member
          ), // Properly replacing the updated Member in the list
        })),

      deleteMember: (id: number) =>
        set((state: { members: Member[] }) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, isActive: false } : member
          ),
        })),
    }),
    {
      name: "member-data", // name of the item in the storage (must be unique)
    }
  )
);
