import "styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "components/theme-provider";
import { DeliveryProgressionInitializer } from "components/delivery-progression-initializer";
import { ToastContainer } from "components/toast";

export const metadata: Metadata = {
  title: "Medifly - Medical Supply Delivery Demo",
  description: "Interactive demo of medical supply delivery via drone technology",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DeliveryProgressionInitializer />
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
