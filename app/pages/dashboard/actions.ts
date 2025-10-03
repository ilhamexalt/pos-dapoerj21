import { getSupabaseClient } from "~/services/supabase";

export type ActionResult<T = unknown> = {
    statusCode: number;
    message: string;
    data?: T;
};

const TABLE = "transactions";


export async function getIncomeOutcome(): Promise<
    ActionResult<{ name: string; value: number }[]>
> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select("type, amount");

    if (error) return { statusCode: 400, message: error.message };

    let income = 0;
    let outcome = 0;

    (data ?? []).forEach((row: any) => {
        if (row.type === "income") income += Number(row.amount || 0);
        if (row.type === "outcome") outcome += Number(row.amount || 0);
    });

    return {
        statusCode: 200,
        message: "OK",
        data: [
            { name: "Income", value: income },
            { name: "Outcome", value: outcome },
        ],
    };
}


export async function getDailyIncome(): Promise<
    ActionResult<{ date: string; income: number }[]>
> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select("created_at, type, amount")
        .eq("type", "income");

    if (error) return { statusCode: 400, message: error.message };

    const dailyMap: Record<string, number> = {};

    (data ?? []).forEach((row: any) => {
        const date = new Date(row.created_at).toISOString().split("T")[0]; // yyyy-MM-dd
        const amount = Number(row.amount || 0);

        if (!dailyMap[date]) dailyMap[date] = 0;
        dailyMap[date] += amount;
    });

    const result = Object.entries(dailyMap).map(([date, income]) => ({
        date,
        income,
    }));

    result.sort((a, b) => (a.date > b.date ? 1 : -1));

    return {
        statusCode: 200,
        message: "OK",
        data: result,
    };
}


export async function getCashOnHand(): Promise<ActionResult<{ nominal: number; updated_at: string }[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("cash")
        .select("*")

    if (error) return { statusCode: 400, message: error.message };
    return {
        statusCode: 200,
        message: "OK",
        data: data,
    };
}

