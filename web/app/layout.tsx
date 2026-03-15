import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SaintSal™ Labs — Responsible Intelligence",
  description: "The AI intelligence platform backed by US Patent #10,290,222. 53 AI models. 88 API connectors. Deployed in 175+ countries.",
  keywords: "AI, artificial intelligence, SaintSal, responsible AI, HACP protocol",
  authors: [{ name: "Saint Vision Technologies LLC" }],
  openGraph: {
    title: "SaintSal™ Labs",
    description: "Responsible Intelligence™ — Patent #10,290,222",
    url: "https://saintsallabs.com",
    siteName: "SaintSal™ Labs",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "SaintSal™ Labs", description: "Responsible Intelligence™" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SaintSal Labs" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0C0C0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#111118", color: "#E8E6E1", border: "1px solid #1E1E2A", fontSize: 13 },
          }}
        />
      </body>
    </html>
  );
}
