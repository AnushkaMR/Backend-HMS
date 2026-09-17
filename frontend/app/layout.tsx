import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ChatBot from "./chatbot/ChatBot";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SmartCare - Healthcare Management System",
  description: "Premium healthcare at your fingertips",
};

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Using a fallback client ID so the app doesn't crash if the env var isn't set yet.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${poppins.variable} antialiased`}
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <GoogleOAuthProvider clientId={clientId}>
          {children}
          <ChatBot />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
