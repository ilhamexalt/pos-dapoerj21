// store/auth.ts
import { create } from "zustand"

type User = {
    id: string
    email: string
} | null

interface AuthState {
    user: User
    setUser: (user: User) => void
    clearUser: () => void
    hydrateUser: (user: any) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null,
    setUser: (user) => {
        set({ user })
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user))
        }
    },
    clearUser: () => {
        set({ user: null })
        if (typeof window !== "undefined") {
            localStorage.removeItem("user")
        }
    },
    hydrateUser: (user) => {
        if (!user) return
        const newUser = { id: user.id, email: user.email }
        set({ user: newUser })
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(newUser))
        }
    },
}))
