import type { FormProps } from "antd";
import { Button, Card, Form, InputNumber, Select, notification } from "antd";
import { useEffect, useMemo, useState } from "react";
import { listProducts, type ProductRecord } from "~/pages/product/actions";
import { createOrderWithItemsAndTransaction } from "./actions";
import { Utils } from "~/utils/format";

type PosFieldType = {
  product_id?: string;
  quantity?: number;
  price?: number; // unit price
};

type NotificationType = "success" | "info" | "warning" | "error";

export default function Pos() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form] = Form.useForm<PosFieldType>();
  const qtyWatch = Form.useWatch("quantity", form);
  const priceWatch = Form.useWatch("price", form);
  const computedTotal = useMemo(() => {
    const q = Number(qtyWatch ?? 0);
    const p = Number(priceWatch ?? 0);
    return q * p;
  }, [qtyWatch, priceWatch]);

  const openNotificationWithIcon = (
    type: NotificationType,
    message?: string
  ) => {
    api[type]({
      message: Utils().capitalizeEachWord(type),
      description: message,
    });
  };

  useEffect(() => {
    (async () => {
      const res = await listProducts();
      if (res.statusCode !== 200) {
        openNotificationWithIcon("error", res.message);
      } else {
        setProducts(res.data || []);
      }
    })();
  }, []);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.name}`,
        value: p.id,
      })),
    [products]
  );

  const onFinish: FormProps<PosFieldType>["onFinish"] = async (values) => {
    try {
      setLoading(true);
      const selected = products.find((p) => p.id === values.product_id);
      const unitPrice = Number(selected?.price ?? 0);
      const res = await createOrderWithItemsAndTransaction({
        product_id: String(values.product_id),
        quantity: Number(values.quantity ?? 1),
        price: unitPrice,
      });
      if (res.statusCode !== 200) {
        openNotificationWithIcon("error", res.message);
      } else {
        openNotificationWithIcon("success", res.message);
        form.resetFields();
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

  const onFinishFailed: FormProps<PosFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    openNotificationWithIcon(
      "error",
      errorInfo?.errorFields?.[0]?.errors?.[0] || "Terjadi kesalahan"
    );
  };

  return (
    <Card
      title="POS - Create Order"
      className="w-full md:w-2/3 lg:w-1/2"
      style={{ marginTop: 24, margin: "auto" }}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<PosFieldType>
          label="Product"
          name="product_id"
          rules={[{ required: true, message: "Product field is required" }]}
        >
          <Select
            showSearch
            placeholder="Choose product"
            options={productOptions}
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={(val) => {
              const found = products.find((p) => p.id === val);
              form.setFieldsValue({
                price: Number(found?.price ?? 0) as unknown as number,
              });
            }}
          />
        </Form.Item>

        <Form.Item<PosFieldType>
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Quantity field is required" }]}
          initialValue={1}
        >
          <InputNumber
            min={1}
            className="w-full"
            style={{ width: "100%" }}
            placeholder="Quantity"
          />
        </Form.Item>

        <Form.Item<PosFieldType> label="Price" name="price">
          <InputNumber
            min={0}
            step={100}
            className="w-full"
            style={{ width: "100%" }}
            placeholder="Price"
            disabled
            formatter={(value) =>
              value ? new Intl.NumberFormat("id-ID").format(Number(value)) : ""
            }
            parser={(value) =>
              (value ? value.replace(/\D/g, "") : "") as unknown as number
            }
          />
        </Form.Item>

        <Form.Item label="Total">
          <InputNumber
            className="w-full"
            style={{ width: "100%" }}
            value={computedTotal}
            disabled
            formatter={(value) =>
              value ? new Intl.NumberFormat("id-ID").format(Number(value)) : ""
            }
            parser={(value) =>
              (value ? value.replace(/\D/g, "") : "") as unknown as number
            }
          />
        </Form.Item>

        <Form.Item>
          <Button
            style={{ width: "100%" }}
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            Create Order
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
