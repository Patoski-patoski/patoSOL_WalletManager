// patosol/src/components/token-activity.tsx
"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";

type Transaction = {
  signature: string;
  blockTime: number;
  type: string;
};

export function TokenActivity({ mintAddress }: { mintAddress: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setIsLoading(true);
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          'confirmed'
        );
        
        const mintPublicKey = new PublicKey(mintAddress);
        const signatures = await connection.getSignaturesForAddress(
          mintPublicKey,
          { limit: 10 },
          'confirmed'
        );
        
        const txs = signatures.map(sig => ({
          signature: sig.signature,
          blockTime: sig.blockTime || 0,
          type: sig.err ? 'Failed' : 'Success',
        }));
        
        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (mintAddress) {
      fetchRecentActivity();
    }
  }, [mintAddress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Token Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#3D8D7A]" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No recent activity found</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.signature} className="flex justify-between p-2 border-b">
                <div className="font-mono text-xs truncate max-w-[180px]">
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                </div>
                <div className="text-xs">
                  {new Date(tx.blockTime * 1000).toLocaleString()}
                </div>
                <div className={`text-xs ${tx.type === 'Failed' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}