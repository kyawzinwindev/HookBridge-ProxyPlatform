import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "HookBridge — Webhook Observability & Relay",
  description: "Ingest, deduplicate, inspect and relay webhooks to your local environment.",
};

// Runs before hydration to avoid a theme flash. Dark is the default.
const themeScript = `try{if(localStorage.getItem('hookbridge-theme')==='light')document.documentElement.classList.remove('dark')}catch(_){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
