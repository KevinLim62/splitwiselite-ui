import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Group = {
  id: number;
  name: string;
  description: string;
  members: string[];
  isActive: boolean;
};

interface GroupSlice {
  groups: Group[];
  addGroup: (group: Group) => void;
  editGroup: (updatedGroup: Group) => void;
  deleteGroup: (id: number) => void; // Corrected to match the function signature in the interface
}

export const useGroupStore = create<GroupSlice>()(
  persist(
    (set) => ({
      groups: [] as Group[], // Corrected to plural 'groups'

      addGroup: (group: Group) =>
        set((state: { groups: Group[] }) => ({
          groups: [group, ...state.groups], // Corrected to push the new group into the array
        })),

      editGroup: (updatedGroup: Group) =>
        set((state: { groups: Group[] }) => ({
          groups: state.groups.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          ), // Properly replacing the updated group in the list
        })),

      deleteGroup: (id: number) =>
        set((state: { groups: Group[] }) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, isActive: false } : group
          ),
        })),
    }),
    {
      name: "group-data", // name of the item in the storage (must be unique)
    }
  )
);
