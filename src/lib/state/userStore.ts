import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: number;
  name: string;
  isActive: boolean;
};

interface UserSlice {
  users: User[];
  addUser: (user: User) => void;
  editUser: (updatedUser: User) => void;
  deleteUser: (id: number) => void; // Corrected to match the function signature in the interface
}

export const useUserStore = create<UserSlice>()(
  persist(
    (set) => ({
      users: [] as User[], // Corrected to plural 'Users'

      addUser: (user: User) =>
        set((state: { users: User[] }) => ({
          users: [user, ...state.users], // Corrected to push the new User into the array
        })),

      editUser: (updatedUser: User) =>
        set((state: { users: User[] }) => ({
          users: state.users.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          ), // Properly replacing the updated User in the list
        })),

      deleteUser: (id: number) =>
        set((state: { users: User[] }) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, isActive: false } : user
          ),
        })),
    }),
    {
      name: "user-data", // name of the item in the storage (must be unique)
    }
  )
);
