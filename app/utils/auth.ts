import type { AuthSession } from "~/stores/auth";

export function isSessionValid(session: AuthSession | null): boolean {
    if (!session) return false;
    if (!session.accessToken) return false;
    // Supabase expires_at biasanya epoch seconds
    if (session.expiresAt && typeof session.expiresAt === "number") {
        const nowSec = Math.floor(Date.now() / 1000);
        return session.expiresAt > nowSec;
    }
    // Jika tidak ada expires, anggap tidak valid untuk amankan
    return false;
}


