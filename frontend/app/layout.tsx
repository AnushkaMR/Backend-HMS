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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${poppins.variable} antialiased`}
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <>
          {children}
          <ChatBot />
        </>
      </body>
    </html>
  );
}
