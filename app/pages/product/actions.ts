import { getSupabaseClient } from "~/services/supabase";
import { useAuthStore } from "~/stores/auth";

export type ProductRecord = {
    id: string;
    name: string;
    description: string;
    category: "makanan" | "minuman";
    in_stock: number;
    price: number;
    user_uid?: string;
};

export type ActionResult<T = unknown> = {
    statusCode: number;
    message: string;
    data?: T;
};

const TABLE = "products";

export async function listProducts(): Promise<ActionResult<ProductRecord[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select("id, name, description, category, in_stock, price, user_uid")
        .order("name", { ascending: true })
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "OK", data: (data ?? []) as ProductRecord[] };
}

export type CreateProductPayload = Omit<ProductRecord, "id">;

export async function createProduct(payload: CreateProductPayload): Promise<ActionResult<ProductRecord>> {
    const supabase = getSupabaseClient();
    const state = useAuthStore.getState();
    const userUid = state.user?.id;
    const { data, error } = await supabase.from(TABLE).insert({ ...payload, user_uid: userUid }).select().single();
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "Product created successfully", data: data as ProductRecord };
}

export async function updateProduct(id: string, payload: Partial<ProductRecord>): Promise<ActionResult<ProductRecord>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select().single();
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "Product updated successfully", data: data as ProductRecord };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) return { statusCode: 400, message: error.message };
    return { statusCode: 200, message: "Product deleted successfully" };
}


