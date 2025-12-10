import { Geist, Geist_Mono, Text_Me_One } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/ui/Navbar";

const textMeOne = Text_Me_One({
  variable: "--font-text-me-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chat App",
  description: "Real-time chat application with URL-based rooms",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${textMeOne.className} h-screen overflow-hidden`}
      >
        <ThemeProvider>
          <div className="h-full flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
