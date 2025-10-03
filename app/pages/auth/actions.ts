import { getSupabaseClient } from "~/services/supabase";

type LoginValues = { email: string; password: string }
type AuthResponse = { statusCode: number; message: string; data?: unknown }

export async function login(values: LoginValues): Promise<AuthResponse> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
    })

    if (error) {
        return { statusCode: 401, message: error.message }
    }

    return {
        statusCode: 200,
        message: "Login berhasil",
        data,
    }
}

export async function logout(): Promise<AuthResponse> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        return { statusCode: 400, message: error.message }
    }
    return { statusCode: 200, message: "Logout berhasil" }
}

