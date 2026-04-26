import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "student" | "teacher" | "admin";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  level?: string;
  lichessUsername?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("access_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, token: null });
      },
    }),
    { name: "xadrez-auth" }
  )
);
