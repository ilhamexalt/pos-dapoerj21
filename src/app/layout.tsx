import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import PWAStatus from "@/components/pwa-status";
// import { Head } from "next/document";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dapoer J21 - POS System",
  description: "Point of Sale System for Dapoer J21 Restaurant",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dapoer J21",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Dapoer J21",
    title: "Dapoer J21 - POS System",
    description: "Point of Sale System for Dapoer J21 Restaurant",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-96x96.png",
    apple: "/icons/icon-152x152.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Dapoer J21" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dapoer J21" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-72x72.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#000000" />
        <link rel="shortcut icon" href="/icons/icon-96x96.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://dapoerj21.com" />
        <meta name="twitter:title" content="Dapoer J21 - POS System" />
        <meta
          name="twitter:description"
          content="Point of Sale System for Dapoer J21 Restaurant"
        />
        <meta name="twitter:image" content="/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@dapoerj21" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Dapoer J21 - POS System" />
        <meta
          property="og:description"
          content="Point of Sale System for Dapoer J21 Restaurant"
        />
        <meta property="og:site_name" content="Dapoer J21" />
        <meta property="og:url" content="https://dapoerj21.com" />
        <meta property="og:image" content="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <main>{children}</main>
        <PWAInstallPrompt />
        <PWAStatus />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
