import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
    id: string;
    email: string | null;
    role?: string | null;
};

export type AuthSession = {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt?: number | null;
};

type AuthState = {
    user: AuthUser | null;
    session: AuthSession | null;
    setAuth: (payload: { user: AuthUser; session: AuthSession }) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            setAuth: ({ user, session }) => set({ user, session }),
            clearAuth: () => set({ user: null, session: null }),
        }),
        {
            name: "auth-store",
            version: 1,
            partialize: (state) => ({ user: state.user, session: state.session }),
        }
    )
);
