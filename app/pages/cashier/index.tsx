import type { FormProps } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Table,
  Modal,
  Space,
  Popconfirm,
  notification,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Utils } from "~/utils/format";
import {
  type Transaction,
  type CreateTransactionPayload,
  listTransactions,
  createTransaction,
  type TransactionStatus,
  type TransactionCategory,
  type TransactionType,
  updateTransaction,
  deleteTransaction,
} from "./actions";
import { useAuthStore } from "~/stores/auth";
import "@ant-design/v5-patch-for-react-19";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

type TransactionFieldType = {
  id: string;
  amount: number;
  user_uid?: string | null;
  status?: TransactionStatus;
  category?: TransactionCategory;
  type?: TransactionType;
  description?: string | null;
  created_at?: string;
};

type NotificationType = "success" | "info" | "warning" | "error";

export default function Cashier() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Transaction[]>([]);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form] = Form.useForm<TransactionFieldType>();
  const [editForm] = Form.useForm<TransactionFieldType>();
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const user = useAuthStore((s) => s.user);

  const openNotificationWithIcon = (
    type: NotificationType,
    message?: string
  ) => {
    api[type]({
      message: Utils().capitalizeEachWord(type),
      description: message,
    });
  };

  const loadTransactions = async () => {
    setListLoading(true);
    const res = await listTransactions();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      setProducts(res.data || []);
    }
    setListLoading(false);
  };

  const onFinish: FormProps<TransactionFieldType>["onFinish"] = async (
    values
  ) => {
    try {
      setLoading(true);
      const payload: CreateTransactionPayload = {
        description: String(values.description),
        amount: Number(values.amount ?? 0),
      };
      const res = await createTransaction(payload);
      if (res.statusCode !== 200) {
        openNotificationWithIcon("error", res.message);
      } else {
        openNotificationWithIcon("success", res.message);
        form.resetFields();
        setCreateOpen(false);
        loadTransactions();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Terjadi kesalahan");
      openNotificationWithIcon("error", message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<TransactionFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    openNotificationWithIcon(
      "error",
      errorInfo?.errorFields?.[0]?.errors?.[0] || "Terjadi kesalahan"
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        sorter: (a: any, b: any) => a.amount - b.amount,
        render: (v: number) => new Intl.NumberFormat("id-ID").format(v),
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        filters: [
          { text: "Buying", value: "buying" },
          { text: "Selling", value: "selling" },
        ],
        render: (v: string) => Utils().capitalizeEachWord(v),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (v: string) => Utils().capitalizeEachWord(v),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        filters: [
          { text: "Income", value: "income" },
          { text: "Outcome", value: "outcome" },
        ],
        render: (v: string) => {
          const text = Utils().capitalizeEachWord(v);
          const color = v === "outcome" ? "red" : "green";
          return <span style={{ color }}>{text}</span>;
        },
      },
      {
        title: "Created At",
        dataIndex: "created_at",
        key: "created_at",
        render: (v: string) => Utils().formatDateToCustom(v),
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_: unknown, record: Transaction) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(record);
                setEditOpen(true);
                editForm.setFieldsValue({
                  id: record.id,
                  amount: record.amount,
                  description: record.description,
                });
              }}
            >
              <EditOutlined />
            </Button>

            {user?.email === "ilhamexalt33@gmail.com" && (
              <Popconfirm
                title="Delete Transaction"
                description={`Are you sure you want to delete (${record.id}) ?`}
                okText="Yes"
                cancelText="Cancel"
                onConfirm={async () => {
                  const res = await deleteTransaction(record.id);
                  if (res.statusCode !== 200) {
                    openNotificationWithIcon("error", res.message);
                  } else {
                    openNotificationWithIcon("success", res.message);
                    loadTransactions();
                  }
                }}
              >
                <Button danger size="small">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [editForm]
  );

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="p-6">
      {contextHolder}
      <Card
        title={`Transactions (${products.length})`}
        extra={
          <Space>
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              Add Transaction
            </Button>
          </Space>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            rowKey={(r) => r.id}
            loading={listLoading}
            columns={columns as any}
            dataSource={products}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: "max-content" }}
            tableLayout="auto"
          />
        </div>
      </Card>

      <Modal
        title="Add Transaction"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onAfterClose={() => {
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<Transaction>
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Amount field is required" }]}
          >
            <InputNumber
              min={0}
              step={1000}
              prefix="Rp"
              style={{ width: "100%" }}
              className="w-full"
              placeholder="Please input amount"
              formatter={(value) =>
                value
                  ? new Intl.NumberFormat("id-ID").format(Number(value))
                  : ""
              }
              parser={(value) =>
                (value ? value.replace(/\D/g, "") : "") as unknown as number
              }
            />
          </Form.Item>

          <Form.Item<Transaction>
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description field is required" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Please input description" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Edit Transaction`}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onOk={() => editForm.submit()}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editing) return;
            try {
              setLoading(true);
              const res = await updateTransaction(editing.id, {
                description: String(values.description),
                amount: Number(values.amount ?? 0),
              });
              if (res.statusCode !== 200) {
                openNotificationWithIcon("error", res.message);
              } else {
                openNotificationWithIcon("success", res.message);
                setEditOpen(false);
                setEditing(null);
                loadTransactions();
              }
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : String(error ?? "Terjadi kesalahan");
              openNotificationWithIcon("error", message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item<TransactionFieldType> label="ID" name="id">
            <Input disabled />
          </Form.Item>

          <Form.Item<Transaction>
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Amount field is required" }]}
          >
            <InputNumber
              min={0}
              step={1000}
              prefix="Rp"
              style={{ width: "100%" }}
              className="w-full"
              placeholder="Please input amount"
              formatter={(value) =>
                value
                  ? new Intl.NumberFormat("id-ID").format(Number(value))
                  : ""
              }
              parser={(value) =>
                (value ? value.replace(/\D/g, "") : "") as unknown as number
              }
            />
          </Form.Item>

          <Form.Item<Transaction>
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description field is required" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Please input description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
