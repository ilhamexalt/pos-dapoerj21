import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useEffect, useRef, useState } from "react";
import {
  AppstoreAddOutlined,
  DashboardOutlined,
  LeftCircleOutlined,
  LogoutOutlined,
  NotificationOutlined,
  ProductOutlined,
  RightCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Drawer,
  List,
  notification,
  Popover,
  Tooltip,
  Typography,
} from "antd";
import Logo from "./assets/images/dapoer-j21.png";
import { logout } from "./pages/auth/actions";
import { useAuthStore } from "./stores/auth";
import { isSessionValid } from "./utils/auth";
import { Utils } from "./utils/format";
import { getCashOnHand } from "./pages/dashboard/actions";
import { getSupabaseClient } from "./services/supabase";
import {
  getUnreadNotifications,
  readNotification,
  sendNotification,
} from "./actions";
import { formatDistanceToNow } from "date-fns";
import boomSound from "./assets/sound/boom-boom-bakudan.mp3";
import "@ant-design/v5-patch-for-react-19";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
  },
];

const path = [
  {
    id: 1,
    name: "Dashboard",
    url: "/",
    icon: <DashboardOutlined />,
  },
  {
    id: 2,
    name: "Product",
    url: "/product",
    icon: <ProductOutlined />,
  },
  {
    id: 3,
    name: "Transaction",
    url: "/cashier",
    icon: <ShoppingCartOutlined />,
  },
  {
    id: 4,
    name: "Pos",
    url: "/pos",
    icon: <AppstoreAddOutlined />,
  },
];

type NotificationType = "success" | "info" | "warning" | "error";

type Notification = {
  id: string; // uuid
  title: string; // notifikasi judul
  description?: string; // opsional, bisa kosong
  created_at: string; // timestamp
  is_read: boolean; // status sudah dibaca / belum
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/login");
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const session = useAuthStore((s) => s.session);
  const [isClient, setIsClient] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [cashOnHand, setCashOnHand] = useState<
    { nominal: number; updated_at: string }[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const openNotificationWithIcon = (
    type: NotificationType,
    message?: string
  ) => {
    api[type]({
      message: Utils().capitalizeEachWord(type),
      description: message,
    });
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
      return;
    }
    setOpenDrawer(false);
    clearAuth();
    navigate("/login");
  };

  const loadCashOnHand = async () => {
    const res = await getCashOnHand();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      setCashOnHand(
        res.data
          ? [
              {
                nominal: res.data[0].nominal,
                updated_at: res.data[0].updated_at,
              },
            ]
          : []
      );
    }
  };

  const getNotifications = (
    onNewNotification: (notif: Notification) => void
  ) => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (!newNotif.is_read) {
            onNewNotification(newNotif);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to notifications channel");
        }
      });

    return channel;
  };

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current.currentTime = 0;
          console.log("🔓 Audio unlocked");
        })
        .catch((err) => console.error("Unlock error:", err));
    }
  };

  const handleReadNotification = async (id: string) => {
    const res = await readNotification(id);
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    }

    const newNotifications = notifications
      .filter((n) => n.id !== id)
      .sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    setNotifications(newNotifications);
  };

  const handleSendNotification = async () => {
    const res = await sendNotification();
    if (res.statusCode !== 200) {
      openNotificationWithIcon("error", res.message);
    } else {
      openNotificationWithIcon("success", res.message);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(boomSound);
    audioRef.current.load();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getUnreadNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    })();

    const channel = getNotifications((notif) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((err) => console.error("Audio error:", err));
      }

      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadCashOnHand();
  }, []);

  const showShell = !hideLayout && isClient && isSessionValid(session);

  return (
    <html lang="en" className="h-full" onClick={unlockAudio}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col">
        {contextHolder}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showShell && (
            <div
              className={`transition-all duration-300 bg-white p-4 shadow-md flex flex-col gap-3
                          ${open ? "w-56" : "w-12 items-center p-2"}`}
            >
              {open ? (
                <>
                  <img
                    src={Logo}
                    width={120}
                    height={120}
                    alt="Dapoer J21"
                    className="mx-auto"
                  />
                  {path.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "text-emerald-600 bg-emerald-50 w-full py-2 px-4 rounded-tl-lg rounded-br-lg flex items-center gap-x-2"
                          : "text-emerald-600 py-2 px-4 hover:bg-emerald-50 transition-all duration-300 flex items-center gap-x-2"
                      }
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  ))}

                  <button
                    className="text-emerald-600 cursor-pointer mt-8"
                    onClick={() => setOpen(false)}
                  >
                    <LeftCircleOutlined className="text-sm md:text-xl" />
                  </button>
                </>
              ) : (
                <>
                  <img src={Logo} width={50} height={50} alt="Dapoer J21" />

                  {path.map((item) => (
                    <div key={item.id}>
                      <Tooltip title={item.name} placement="rightTop">
                        <NavLink
                          key={item.id}
                          to={item.url}
                          className={"text-emerald-600 text-sm md:text-xl"}
                        >
                          {item.icon}
                        </NavLink>
                      </Tooltip>
                    </div>
                  ))}

                  <button
                    className="text-emerald-600 cursor-pointer mt-8"
                    onClick={() => setOpen(true)}
                  >
                    <RightCircleOutlined className="text-sm md:text-xl" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto transition-all duration-300">
            {showShell && (
              <>
                {/* Header */}
                <div className="py-4 px-8 md:py-6 md:px-10 w-full flex justify-end gap-6 items-center">
                  <p className="text-sm md:text-md bg-emerald-50 px-4 py-2 rounded-xl">
                    COH{" "}
                    {cashOnHand[0]?.nominal
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(cashOnHand[0].nominal)
                      : "-"}
                  </p>

                  <Popover
                    placement="bottom"
                    trigger="click"
                    title={
                      <div className="flex justify-center">Notifications</div>
                    }
                    content={
                      <div className="max-h-80 overflow-auto">
                        <List
                          dataSource={notifications}
                          renderItem={(item) => (
                            <List.Item
                              key={item.id}
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleReadNotification(item.id);
                              }}
                            >
                              <List.Item.Meta
                                title={
                                  <Typography.Text
                                    type="secondary"
                                    style={{ fontSize: 14, color: "gray" }}
                                  >
                                    {Utils().capitalizeEachWord(item.title)}
                                  </Typography.Text>
                                }
                                description={
                                  <>
                                    <Typography.Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}
                                    >
                                      {Utils().capitalizeEachWord(
                                        item.description || ""
                                      )}
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text
                                      type="secondary"
                                      style={{ fontSize: 10, color: "gray" }}
                                    >
                                      {formatDistanceToNow(item.created_at, {
                                        addSuffix: true,
                                      })}
                                    </Typography.Text>
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    }
                    styles={{ body: { width: 300 } }}
                  >
                    <Badge
                      count={notifications?.length}
                      size="small"
                      color="red"
                      className="cursor-pointer"
                    >
                      <NotificationOutlined className="text-emerald-600 text-sm md:text-xl" />
                    </Badge>
                  </Popover>

                  <UserOutlined
                    className="text-emerald-600 text-sm md:text-xl"
                    onClick={() => setOpenDrawer(true)}
                  />
                </div>
              </>
            )}

            <div>{children}</div>
          </div>
        </div>

        {showShell && (
          <footer className="p-4 text-center text-sm text-gray-500 bg-emerald-50">
            © 2025 Dapoer J21. All Rights Reserved.
          </footer>
        )}

        {showShell && (
          <Drawer
            title="Profile"
            placement={"right"}
            width={400}
            onClose={() => setOpenDrawer(false)}
            open={openDrawer}
            extra={
              <>
                <Button
                  htmlType="button"
                  type="primary"
                  title="Logout"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  <LogoutOutlined />
                </Button>
              </>
            }
          >
            <Button
              htmlType="button"
              type="primary"
              title="Send Notification"
              onClick={() => {
                handleSendNotification();
              }}
              style={{ width: "100%" }}
            >
              <SendOutlined /> Send Notification
            </Button>
          </Drawer>
        )}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
