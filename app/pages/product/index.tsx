import type { FormProps } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Modal,
  Space,
  Popconfirm,
  notification,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Utils } from "~/utils/format";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRecord,
  type CreateProductPayload,
} from "./actions";
import { useAuthStore } from "~/stores/auth";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

type ProductFieldType = {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  in_stock?: number;
  price?: number;
};

type NotificationType = "success" | "info" | "warning" | "error";

export default function Product() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [form] = Form.useForm<ProductFieldType>();
  const [editForm] = Form.useForm<ProductFieldType>();
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

  const loadProducts = async () => {
    setListLoading(true);
    const res = await listProducts();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      setProducts(res.data || []);
    }
    setListLoading(false);
  };

  const onFinish: FormProps<ProductFieldType>["onFinish"] = async (values) => {
    try {
      setLoading(true);
      const payload: CreateProductPayload = {
        name: String(values.name),
        description: String(values.description),
        category: values.category as "makanan" | "minuman",
        in_stock: Number(values.in_stock ?? 0),
        price: Number(values.price ?? 0),
      };
      const res = await createProduct(payload);
      if (res.statusCode !== 200) {
        openNotificationWithIcon("error", res.message);
      } else {
        openNotificationWithIcon("success", res.message);
        form.resetFields();
        setCreateOpen(false);
        loadProducts();
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

  const onFinishFailed: FormProps<ProductFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    openNotificationWithIcon(
      "error",
      errorInfo?.errorFields?.[0]?.errors?.[0] || "Terjadi kesalahan"
    );
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 220, ellipsis: true },
      { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (v: string) => Utils().capitalizeEachWord(v),
      },
      { title: "In Stock", dataIndex: "in_stock", key: "in_stock", width: 110 },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        width: 140,
        render: (v: number) => new Intl.NumberFormat("id-ID").format(v),
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_: unknown, record: ProductRecord) =>
          user?.email === "ilhamexalt33@gmail.com" ? (
            <Space>
              <Button
                size="small"
                onClick={() => {
                  setEditing(record);
                  setEditOpen(true);
                  editForm.setFieldsValue({
                    id: record.id,
                    name: record.name,
                    description: record.description,
                    category: record.category,
                    in_stock: record.in_stock,
                    price: record.price,
                  });
                }}
              >
                <EditOutlined />
              </Button>
              <Popconfirm
                title="Delete Product"
                description={`Are you sure you want to delete (${record.name}) ?`}
                okText="Yes"
                cancelText="Cancel"
                onConfirm={async () => {
                  const res = await deleteProduct(record.id);
                  if (res.statusCode !== 200) {
                    openNotificationWithIcon("error", res.message);
                  } else {
                    openNotificationWithIcon("success", res.message);
                    loadProducts();
                  }
                }}
              >
                <Button danger size="small">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            "-"
          ),
      },
    ],
    [editForm]
  );

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-6">
      {contextHolder}
      <Card
        title="Product List"
        extra={
          user?.email === "ilhamexalt33@gmail.com" && (
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              Add Product
            </Button>
          )
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
        title="Add Product"
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
          <Form.Item<ProductFieldType>
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name field is required" }]}
          >
            <Input placeholder="Please input product name" />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description field is required" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Please input product description"
            />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category field is required" }]}
          >
            <Select placeholder="Choose product category">
              <Select.Option value="makanan">Makanan</Select.Option>
              <Select.Option value="minuman">Minuman</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="In Stock"
            name="in_stock"
            rules={[{ required: true, message: "Stock field is required" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              className="w-full"
              placeholder="Product stock"
            />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Price"
            name="price"
            rules={[{ required: true, message: "Price field is required" }]}
          >
            <InputNumber
              min={0}
              step={100}
              className="w-full"
              prefix="Rp"
              style={{ width: "100%" }}
              placeholder="Product price"
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
        </Form>
      </Modal>

      <Modal
        title={`Edit Product`}
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
              const res = await updateProduct(editing.id, {
                name: String(values.name),
                description: String(values.description),
                category: values.category as "makanan" | "minuman",
                in_stock: Number(values.in_stock ?? 0),
                price: Number(values.price ?? 0),
              });
              if (res.statusCode !== 200) {
                openNotificationWithIcon("error", res.message);
              } else {
                openNotificationWithIcon("success", res.message);
                setEditOpen(false);
                setEditing(null);
                loadProducts();
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
          <Form.Item<ProductFieldType> label="ID" name="id">
            <Input disabled />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Name"
            name="name"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama produk" />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Description"
            name="description"
            rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
          >
            <Input.TextArea rows={3} placeholder="Masukkan deskripsi produk" />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Category"
            name="category"
            rules={[{ required: true, message: "Kategori field is required" }]}
          >
            <Select placeholder="Pilih kategori">
              <Select.Option value="makanan">Makanan</Select.Option>
              <Select.Option value="minuman">Minuman</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="In Stock"
            name="in_stock"
            rules={[{ required: true, message: "Stok wajib diisi" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              style={{ width: "100%" }}
              placeholder="Jumlah stok"
            />
          </Form.Item>

          <Form.Item<ProductFieldType>
            label="Price"
            name="price"
            rules={[{ required: true, message: "Harga wajib diisi" }]}
          >
            <InputNumber
              min={0}
              step={100}
              className="w-full"
              style={{ width: "100%" }}
              prefix="Rp"
              placeholder="Harga produk"
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
        </Form>
      </Modal>
    </div>
  );
}
