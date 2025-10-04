

import { getSupabaseClient } from "./services/supabase";
import { Utils } from "./utils/format";

const TABLE = "notifications";

export type ActionResult<T = unknown> = {
    statusCode: number;
    message: string;
    data?: T;
};

export type Notification = {
    id: string;           // uuid
    title: string;        // notifikasi judul
    description?: string; // opsional, bisa kosong
    created_at: string;   // timestamp
    is_read: boolean;     // status sudah dibaca / belum
};


export async function getUnreadNotifications(): Promise<ActionResult<Notification[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

    if (error) {
        return { statusCode: 400, message: error.message };
    }


    return {
        statusCode: 200,
        message: "OK",
        data: (data ?? []) as Notification[],
    };
}


export async function readNotification(id: string): Promise<ActionResult<null>> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from(TABLE)
        .update({ is_read: true })
        .eq("id", id);

    if (error) {
        return { statusCode: 400, message: error.message };
    }

    return {
        statusCode: 200,
        message: "Notification marked as read",
        data: null,
    };
}

export async function sendNotification(
): Promise<{ statusCode: number; message: string; data?: Notification }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from("notifications")
        .insert({
            title: "Test Notification",
            description: "Pesan ini dikirim oleh developer, abaikan saja",
            is_read: false,
        })
        .select()
        .single();

    if (error) {
        return { statusCode: 400, message: error.message };
    }

    return { statusCode: 200, message: "Notification sent successfully", data: data as Notification };
}