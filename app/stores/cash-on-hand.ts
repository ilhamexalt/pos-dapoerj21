// ✅ store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CashOnHand = {
    nominal: number;
    updated_at: string;
};

type CashOnHandState = {
    cashOnHand: CashOnHand | null;
    setCashOnHand: (cashOnHand: CashOnHand) => void;
};

export const useCashOnHandStore = create<CashOnHandState>()(
    persist(
        (set) => ({
            cashOnHand: null,
            setCashOnHand: (cashOnHand) => set({ cashOnHand }),
        }),
        { name: "cash-on-hand-storage" }
    )
);
