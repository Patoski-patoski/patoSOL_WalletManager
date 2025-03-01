// patosol/src/app/layout.tsx

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { AuthButton } from "@/components/auth-button";
import { SolPrice } from "@/components/sol-price";
import { SolanaWalletProvider } from "@/components/wallet-provider";

// Add this to the top of your CSS file
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "patoSOL Token Manager",
  description: "Mint, buy, and sell SPL tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <div className="flex h-screen bg-[#FBFFE4]">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <header className="bg-[#3D8D7A] p-4 flex justify-between items-center">
                <SolPrice />
                <AuthButton />
              </header>
              <div className="p-8">{children}</div>
            </main>
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}