//patosol/src/app/page.tsx
// main page.tsx
"use client";

import { TokenActivity } from "@/components/token-activity";
import { useState, useEffect } from "react";
import { AuthButton } from "../components/auth-button";
import { getTokenInfo, TokenInfo } from "@/lib/token-utils";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual token mint address
  const TOKEN_MINT_ADDRESS =
    process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS ||
    "4R1SjTQjqDDzMPgsuL2oD2bzHAotB1cqi2B8EFScgWmc"; 

  useEffect(() => {
    async function loadTokenInfo() {
      try {
        setIsLoading(true);
        const info = await getTokenInfo(TOKEN_MINT_ADDRESS);
        setTokenInfo(info);
        setError(null);
      } catch (err) {
        console.error("Failed to load token info:", err);
        setError("Failed to load token data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTokenInfo();
    
    // Refresh data every 2 minutes
    const interval = setInterval(loadTokenInfo, 120000);
    return () => clearInterval(interval);
  }, [TOKEN_MINT_ADDRESS]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#3D8D7A]">Dashboard</h1>
        <AuthButton />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D8D7A]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Supply"
            value={tokenInfo?.totalSupply.toLocaleString() || "0"}
          />
          <DashboardCard
            title="Holders"
            value={tokenInfo?.holderCount.toLocaleString() || "0"}
          />
          <DashboardCard
            title="Transactions (24h)"
            value={tokenInfo?.recentTransactionCount.toLocaleString() || "0"}
          />
        </div>
      )}
      {tokenInfo && (
        <div className="mt-6">
          <TokenActivity mintAddress={tokenInfo.mintAddress} />
        </div>
      )}
      {tokenInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold text-[#3D8D7A] mb-2">
            Token Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mint Address</p>
              <p className="font-mono text-sm break-all">
                {tokenInfo.mintAddress}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Decimals</p>
              <p>{tokenInfo.decimals}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-[#3D8D7A] mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}