"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AuthButton } from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { SendTokens } from "@/components/send-tokens";
import { ReceiveTokens } from "@/components/receive-tokens";
import { CreateTokenAccount } from "@/components/create-token-account";
import { TokenActivity } from "@/components/token-activity";
import { getTokenInfo } from "@/lib/token-utils";
import axios from "axios";

// Define interfaces
export interface TokenBalance {
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
}

interface TokenHistoricalData {
  date: string;
  balance: number;
}

interface WalletStats {
  totalValue: number;
  tokenCount: number;
  transactionCount: number;
  lastTransactionDate: string;
}

interface TokenDistribution {
  name: string;
  value: number;
}

const COLORS = [
  "#3D8D7A",
  "#A3D1C6",
  "#B3D8A8",
  "#E2F0CB",
  "#F7FFDD",
  "#8FA998",
];

export default function Analytics() {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [historicalData, setHistoricalData] = useState<TokenHistoricalData[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalValue: 0,
    tokenCount: 0,
    transactionCount: 0,
    lastTransactionDate: "",
  });
  const [tokenDistribution, setTokenDistribution] = useState<TokenDistribution[]>([]);
  const [selectedTokenMint, setSelectedTokenMint] = useState<string>("");

  // Function to refresh wallet data
  const refreshWallet = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );

      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" // Standard SPL Token program ID
          ),
        }
      );

      // Format token balances
      const balances: TokenBalance[] = tokenAccounts.value.map((account) => {
        const parsedInfo = account.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const tokenBalance = parsedInfo.tokenAmount;

        return {
          mint: mintAddress,
          owner: parsedInfo.owner,
          symbol: mintAddress.slice(0, 4) + "...", // We'll use a simplification for now
          uiBalance: tokenBalance.uiAmount || 0,
          decimals: tokenBalance.decimals,
        };
      });

      setTokenBalances(balances);

      // Calculate wallet stats
      const totalValue = balances.reduce((sum, token) => sum + token.uiBalance, 0);

      // Get recent transactions
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      setWalletStats({
        totalValue,
        tokenCount: balances.length,
        transactionCount: signatures.length,
        lastTransactionDate:
          signatures.length > 0 && signatures[0].blockTime
            ? new Date(signatures[0].blockTime * 1000).toLocaleString()
            : "No transactions",
      });

      // Create token distribution data
      const distribution = balances.filter((token) => token.uiBalance > 0).map((token) => ({
        name: token.symbol || token.mint.slice(0, 4) + "...",
        value: parseFloat(token.uiBalance.toFixed(2)),
      }));
      if (distribution.length === 0) {
        distribution.push({ name: "No tokens", value: 1 });
      }
      setTokenDistribution(distribution);

      // Fetch historical data from the API
      const historicalData = await fetchHistoricalData(publicKey.toString());
      setHistoricalData(historicalData);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch historical data from the API
  const fetchHistoricalData = async (walletAddress: string): Promise<TokenHistoricalData[]> => {
    try {
      const response = await axios.get(`/api/historical-data?address=${walletAddress}`);
      console.log("fetch data", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  };

  // Initial data load
  useEffect(() => {
    if (connected && publicKey) {
      refreshWallet();
    } else {
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  // Render wallet not connected state
  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#3D8D7A]">Analytics</h1>
          <AuthButton />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500 mb-6">
            Please connect your wallet to view your analytics data.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#3D8D7A]">Analytics</h1>
          <AuthButton />
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D8D7A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#3D8D7A]">Analytics</h1>
        <div className="flex space-x-2">
          <CreateTokenAccount refreshWallet={refreshWallet} />
          <ReceiveTokens walletAddress={publicKey?.toString() || ""} />
          <SendTokens tokenBalances={tokenBalances} refreshWallet={refreshWallet} />
          <Button variant="outline" onClick={refreshWallet} className="gap-2">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          <AuthButton />
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{walletStats.totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{walletStats.tokenCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{walletStats.transactionCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{walletStats.lastTransactionDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Balance History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split(" ")[0]}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3D8D7A"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(Number(percent) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}`, "Balance"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Token Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {tokenBalances.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tokens found in this wallet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-xs font-medium text-gray-500 bg-gray-50">
                    <th className="px-4 py-2 text-left">Token</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                    <th className="px-4 py-2 text-left">Mint Address</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenBalances.map((token) => (
                    <tr key={token.mint} className="border-t border-gray-200">
                      <td className="px-4 py-2 font-medium">{token.symbol}</td>
                      <td className="px-4 py-2 text-right">
                        {token.uiBalance.toFixed(token.decimals)}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs truncate max-w-[200px]">
                        {token.mint}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTokenMint(token.mint)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Token Activity */}
      {selectedTokenMint && <TokenActivity mintAddress={selectedTokenMint} />}
    </div>
  );
}