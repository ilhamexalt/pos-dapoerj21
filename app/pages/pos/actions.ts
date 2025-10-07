import { getSupabaseClient } from "~/services/supabase";
import { useAuthStore } from "~/stores/auth";

export type OrderPayload = {
    product_id: string;
    quantity: number;
    price: number;
    payment_method_id?: string | null;
};

export type ActionResult<T = unknown> = {
    statusCode: number;
    message: string;
    data?: T;
};

export async function createOrderWithItemsAndTransaction(
    payload: OrderPayload
): Promise<ActionResult<{ order_id: string }>> {
    const supabase = getSupabaseClient();
    const state = useAuthStore.getState();
    const userUid = state.user?.id ?? null;

    // total_amount = quantity * price
    const totalAmount = Number(payload.quantity) * Number(payload.price);

    // 1) create order
    const { data: order, error: errOrder } = await supabase
        .from("orders")
        .insert({
            product_id: payload.product_id,
            user_uid: userUid,
            status: "completed",
            total_amount: totalAmount,
        })
        .select()
        .single();
    if (errOrder || !order) return { statusCode: 400, message: errOrder?.message || "Failed to create order" };

    // 2) create order_items
    const { error: errItem } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: payload.product_id,
        quantity: payload.quantity,
        price: payload.price,
    });
    if (errItem) return { statusCode: 400, message: errItem.message };

    // 3) create transactions
    const { error: errTrx } = await supabase.from("transactions").insert({
        order_id: order.id,
        payment_method_id: payload.payment_method_id ?? null,
        amount: totalAmount,
        user_uid: userUid,
        status: "pending",
        category: "selling",
        type: "income",
        description: `Payment For Order #${payload.product_id}`,
    });
    if (errTrx) return { statusCode: 400, message: errTrx.message };

    await supabase
        .from("notifications")
        .insert({
            title: "Order",
            description: "Order created successfully",
            is_read: false,
        })
        .select()
        .single();

    return { statusCode: 200, message: "Order created successfully", data: { order_id: order.id } };
}


