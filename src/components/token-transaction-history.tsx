// patosol/src/components/token-transaction-history.tsx
"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, ExternalLink } from "lucide-react";

type DetailedTransaction = {
  signature: string;
  blockTime: number;
  status: string;
  details: string;
  explorer: string;
};


export function TokenTransactionHistory({
  walletAddress,
  mintAddress,
}: {
  walletAddress: string;
  mintAddress?: string;
}) {
  const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactionHistory() {
      if (!walletAddress) return;

      try {
        setIsLoading(true);
        setError(null);

        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
            "https://api.devnet.solana.com",
            "confirmed"
        );

        const walletPublicKey = new PublicKey(walletAddress);

        // Fetch signatures for the wallet or specific token
        const queryPublicKey = mintAddress
          ? new PublicKey(mintAddress)
          : walletPublicKey;
        const signatures = await connection.getSignaturesForAddress(
          queryPublicKey,
          { limit: 10 },
          "confirmed"
        );

        // Fetch transaction details
        const txDetails = await Promise.all(
          signatures.map(async (sig) => {
            try {
              const explorerURL = `https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`;

              // Simplified transaction details
              return {
                signature: sig.signature,
                blockTime: sig.blockTime || 0,
                status: sig.err ? "failed" : "success",
                details: mintAddress
                  ? "Token Transaction"
                  : "Wallet Transaction",
                explorer: explorerURL,
              };
            } catch (err) {
              console.error(
                `Error fetching transaction ${sig.signature}:`,
                err
              );
              return {
                signature: sig.signature,
                blockTime: sig.blockTime || 0,
                status: "failed" as const,
                details: "Error fetching details",
                explorer: `https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`,
              };
            }
          })
        );

        setTransactions(txDetails);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setError("Failed to load transaction history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactionHistory();
  }, [walletAddress, mintAddress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#3D8D7A]" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center p-4">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No transactions found</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.signature}
                className="flex justify-between p-2 border-b items-center"
              >
                <div className="flex-1">
                  <div className="font-mono text-xs truncate max-w-[180px]">
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.blockTime * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      tx.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.status}
                  </span>
                  <a
                    href={tx.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3D8D7A] hover:text-[#2a7361]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
