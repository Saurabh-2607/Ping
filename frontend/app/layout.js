import { Geist, Geist_Mono, Text_Me_One } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";

const textMeOne = Text_Me_One({
  variable: "--font-text-me-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ping by Saurabh Sharma",
  description: "Connect instantly with friends and strangers. Share your thoughts, jokes, and memes in real-time chat rooms.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${textMeOne.className} h-full overflow-hidden fixed inset-0`}
      >
        <ThemeProvider>
          <div className="h-full flex flex-col w-full">
            <div className="shrink-0">
              <Navbar />
            </div>
            <main className="flex-1 min-h-0 overflow-hidden relative">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
