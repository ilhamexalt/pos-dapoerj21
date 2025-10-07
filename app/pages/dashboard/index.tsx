import {
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts";
import { getCashOnHand, getDailyIncome, getIncomeOutcome } from "./actions";
import { useEffect, useState } from "react";
import { Utils } from "~/utils/format";
import { notification, Spin } from "antd";
import { useCashOnHandStore } from "~/stores/cash-on-hand";

function BarchartChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="margin" fill="#4caf50" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PiechartcustomChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Tooltip />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          fill="#4caf50"
          label
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

type NotificationType = "success" | "info" | "warning" | "error";

export default function Dashboard() {
  const [incomeOutcome, setIncomeOutcome] = useState<
    { name: string; value: number }[]
  >([]);
  const [dailyIncome, setDailyIncome] = useState<
    { date: string; margin: number }[]
  >([]);

  const [api, contextHolder] = notification.useNotification();
  const [loadingIncomeOutcome, setLoadingIncomeOutcome] = useState(false);
  const [loadingDailyIncome, setLoadingDailyIncome] = useState(false);
  const [cashOnHand, setCashOnHand] = useState<
    { nominal: number; updated_at: string }[]
  >([]);

  const openNotificationWithIcon = (
    type: NotificationType,
    message?: string
  ) => {
    api[type]({
      message: Utils().capitalizeEachWord(type),
      description: message,
    });
  };

  const loadIncomeOutcome = async () => {
    setLoadingIncomeOutcome(true);
    const res = await getIncomeOutcome();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      setIncomeOutcome(res.data || []);
    }
    setLoadingIncomeOutcome(false);
  };

  const loadDailyIncome = async () => {
    setLoadingDailyIncome(true);
    const res = await getDailyIncome();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      setDailyIncome(
        res.data?.map((item) => ({ date: item.date, margin: item.income })) ||
          []
      );
    }
    setLoadingDailyIncome(false);
  };

  const loadCashOnHand = async () => {
    const res = await getCashOnHand();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      const { setCashOnHand } = useCashOnHandStore.getState();
      const item = res.data?.[0];
      if (item) {
        setCashOnHand({
          nominal: item.nominal,
          updated_at: item.updated_at,
        });
      }
    }
  };

  useEffect(() => {
    loadIncomeOutcome();
    loadDailyIncome();
    loadCashOnHand();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {contextHolder}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="mb-2 font-semibold">Margin</h3>
        {loadingDailyIncome ? (
          <Spin tip="Loading" size="small">
            <BarchartChart data={dailyIncome} />
          </Spin>
        ) : (
          <BarchartChart data={dailyIncome} />
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="mb-2 font-semibold">Income & Outcome</h3>
        {loadingIncomeOutcome ? (
          <Spin tip="Loading" size="small">
            <PiechartcustomChart data={incomeOutcome} />
          </Spin>
        ) : (
          <PiechartcustomChart data={incomeOutcome} />
        )}
      </div>
    </div>
  );
}
