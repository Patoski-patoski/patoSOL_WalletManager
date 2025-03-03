"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AuthButton } from "@/components/auth-button";
import { SendTokens } from "@/components/send-tokens";
import { ReceiveTokens } from "@/components/receive-tokens";
import { CreateTokenAccount } from "@/components/create-token-account";
import { RequestAirdrop } from "@/components/request-airdrop";
import { getTokenBalances } from "@/lib/wallet-utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TokenBalance = {
  mint: string;
  owner: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
  uiBalance: number;
  decimals: number;
  symbol?: string;
  name?: string;
};

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = useCallback(async () => {
    if (!publicKey) return;

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    );

    try {
      setIsLoading(true);
      setError(null);

      // Get SOL balance
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      // Get token balances
      const tokens = await getTokenBalances(publicKey.toString());
      setTokenBalances(tokens);
    } catch (err) {
      console.error("Error loading wallet data:", err);
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      loadWalletData();
    } else {
      setSolBalance(null);
      setTokenBalances([]);
      setIsLoading(false);
    }
  }, [connected, publicKey, loadWalletData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#3D8D7A]">My Wallet</h1>
        <AuthButton />
      </div>

      {!connected ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="mb-4">Connect your wallet to view your balances</p>
          <AuthButton />
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D8D7A]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
          <Button
            onClick={loadWalletData}
            className="mt-2 bg-[#3D8D7A] hover:bg-[#2a7361]"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#3D8D7A] mb-4">
              Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-mono text-sm break-all">
                  {publicKey?.toString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SOL Balance</p>
                <p className="text-xl font-bold">
                  {solBalance?.toFixed(4) || "0"} SOL
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <SendTokens
                tokenBalances={tokenBalances}
                refreshWallet={loadWalletData}
              />
              <ReceiveTokens walletAddress={publicKey?.toString() || ""} />
              <CreateTokenAccount refreshWallet={loadWalletData} />
              <RequestAirdrop refreshWallet={loadWalletData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#3D8D7A] mb-4">
              Token Balances
            </h2>
            {tokenBalances.length === 0 ? (
              <p className="text-gray-500 text-center p-4">
                No tokens found in your wallet
              </p>
            ) : (
              <div className="divide-y">
                {tokenBalances.map((token) => (
                  <div
                    key={token.mint}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {token.symbol || "Unknown Token"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate max-w-xs">
                        {token.mint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {token.uiBalance.toFixed(token.decimals)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
