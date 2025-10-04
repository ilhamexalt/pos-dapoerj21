import type { FormProps } from "antd";
import { Button, Card, Form, Image, Input, notification } from "antd";
import { login } from "./actions";
import { useAuthStore } from "~/stores/auth";
import "@ant-design/v5-patch-for-react-19";
import { Utils } from "~/utils/format";
import { useState } from "react";
import { useNavigate } from "react-router";
import Logo from "../../assets/images/dapoer-j21.png";

type FieldType = {
  email?: string;
  password?: string;
};

type NotificationType = "success" | "info" | "warning" | "error";

export default function Auth() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const openNotificationWithIcon = (
    type: NotificationType,
    message?: string
  ) => {
    api[type]({
      message: Utils().capitalizeEachWord(type),
      description: message,
    });
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setLoading(true);
      const response = await login(values as any);

      if (response?.statusCode === 401) {
        openNotificationWithIcon(
          "error",
          response?.message || "Email atau password salah"
        );
        return;
      }

      const authData = (response?.data as any) || {};
      const user = authData.user || null;
      const session = authData.session || null;

      if (user && session) {
        setAuth({
          user: {
            id: user.id,
            email: user.email ?? null,
            role: user.role ?? null,
          },
          session: {
            accessToken: session.access_token ?? null,
            refreshToken: session.refresh_token ?? null,
            expiresAt: session.expires_at ?? null,
          },
        });
      }

      openNotificationWithIcon(
        "success",
        response?.message || "Login berhasil"
      );
      navigate("/");
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

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    openNotificationWithIcon(
      "error",
      errorInfo?.errorFields[0]?.errors[0] || "Terjadi kesalahan"
    );
  };

  return (
    <Card
      style={{
        margin: "auto",
        marginTop: "200px",
        // backgroundColor: "#4caf50",
      }}
      className="w-10/12 md:w-1/2"
    >
      {contextHolder}
      <div className="w-full flex justify-center">
        <Image src={Logo} width={200} height={200} alt="Dapoer J21" />
      </div>
      <Form
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input type="email" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button
            className="w-full"
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
