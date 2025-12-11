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
  title: "Ping by Saurabh Sharma",
  description: "Connect instantly with friends and strangers. Share your thoughts, jokes, and memes in real-time chat rooms.",
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
              {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
