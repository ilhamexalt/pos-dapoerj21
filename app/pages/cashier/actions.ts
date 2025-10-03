import { getSupabaseClient } from "~/services/supabase";
import { useAuthStore } from "~/stores/auth";
import { Utils } from "~/utils/format";

export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionCategory = "income" | "outcome" | "selling" | "buying";
export type TransactionType = "income" | "outcome";

export interface Transaction {
    id: string;
    amount: number;
    user_uid?: string | null;
    status?: TransactionStatus;
    category?: TransactionCategory;
    type?: TransactionType;
    description?: string | null;
    created_at?: string;
}


export type ActionResult<T = unknown> = {
    statusCode: number;
    message: string;
    data?: T;
};

const TABLE = "transactions";

export async function listTransactions(): Promise<ActionResult<Transaction[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false })

    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "OK", data: (data ?? []) as Transaction[] };
}

export type CreateTransactionPayload = Omit<Transaction, "id">;


export async function createTransaction(
    payload: CreateTransactionPayload
): Promise<ActionResult<Transaction>> {
    const supabase = getSupabaseClient();
    const state = useAuthStore.getState();
    const user_uid = state.user?.id;

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            ...payload,
            user_uid,
            category: "buying",
            status: "completed",
            type: "outcome",
            created_at: Utils().getJakartaTimeISO(),
        })
        .select()
        .single();

    if (error) {
        return { statusCode: 400, message: error.message };
    }

    await supabase
        .from("notifications")
        .insert({
            title: "Transaction",
            description: "Transaction created successfully",
            is_read: false,
        })
        .select()
        .single();

    return {
        statusCode: 200,
        message: "Transaction created successfully",
        data: data as Transaction,
    };
}

export async function updateTransaction(id: string, payload: Partial<Transaction>): Promise<ActionResult<Transaction>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select().single();
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "Transaction updated successfully" };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "Transaction deleted successfully" };
}


