// patosol/src/app/marketplace/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { getTokenInfo } from "@/lib/token-utils";

// Token type for marketplace
type MarketToken = {
  name: string;
  symbol: string;
  mintAddress: string;
  price: number;
  supply: number;
  logoUrl?: string;
  change24h?: number;
  volume24h?: number;
};

// Sample token list - in a real app, this would come from your backend or an API
const TOKEN_LIST = [
  {
    name: "Example Token",
    symbol: "EXMPL",
    mintAddress: "4R1SjTQjqDDzMPgsuL2oD2bzHAotB1cqi2B8EFScgWmc",
    logoUrl: "/tokens/example-token.png", // You'll need to add placeholder images
  },
  {
    name: "Demo Token",
    symbol: "DEMO",
    mintAddress: "EchesVXFiEHwK4hUqGFNiYdVW5KmJiZ9AD2HStP6UKsf", // Example address
    logoUrl: "/tokens/demo-token.png",
  },
  {
    name: "Test Token",
    symbol: "TEST",
    mintAddress: "3VvFJJKMpUEVhCczCfzEFeyeRioYyBgwNsLvwLt1CfUT", // Example address
    logoUrl: "/tokens/test-token.png",
  },
];

export default function Marketplace() {
  const { connected } = useWallet();
  const [tokens, setTokens] = useState<MarketToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<MarketToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch token data when component mounts
  useEffect(() => {
    async function fetchTokenData() {
      try {
        setIsLoading(true);
        
        // Use RPC connection for price data (in a real app, you might use a price oracle)
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          'confirmed'
        );
        
        // Fetch data for each token in the list
        const tokenPromises = TOKEN_LIST.map(async (token) => {
          // Get on-chain token info
          const tokenInfo = await getTokenInfo(token.mintAddress);
          
          // In a real app, you would fetch price from an oracle or API
          // This is a placeholder using random data
          const mockPrice = Math.random() * 2; // Random price between 0-2 SOL
          const mockChange = (Math.random() * 10) - 5; // Random change between -5% and +5%
          const mockVolume = Math.random() * 10000; // Random volume
          
          return {
            ...token,
            price: mockPrice,
            supply: tokenInfo.totalSupply,
            change24h: mockChange,
            volume24h: mockVolume
          };
        });
        
        const tokenData = await Promise.all(tokenPromises);
        setTokens(tokenData);
        setFilteredTokens(tokenData);
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTokenData();
  }, []);
  
  // Filter tokens based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tokens.filter(
        token => 
          token.name.toLowerCase().includes(query) || 
          token.symbol.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, tokens]);
  
  // Handle token purchase
  const handleBuyToken = async (token: MarketToken) => {
    if (!connected) {
      alert("Please connect your wallet to purchase tokens");
      return;
    }
    
    // In a real app, you would implement the Solana transaction here
    alert(`This would initiate a purchase of ${token.symbol} for ${token.price.toFixed(4)} SOL`);
    
    // Implementation would include:
    // 1. Creating a transaction
    // 2. Sending SOL to the token seller
    // 3. Transferring tokens to the buyer
    // 4. Handling transaction confirmation
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#3D8D7A]">Marketplace</h1>
        <AuthButton />
      </div>
      
      {/* Search and filters */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search tokens..." 
          className="pl-9 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D8D7A]" />
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tokens found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <TokenCard 
              key={token.mintAddress}
              token={token}
              onBuy={() => handleBuyToken(token)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TokenCard({
  token,
  onBuy,
}: {
  token: MarketToken;
  onBuy: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
          {/* Placeholder for token logo */}
          <span className="text-sm font-bold">{token.symbol.substring(0, 2)}</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#3D8D7A]">{token.name}</h2>
          <p className="text-sm text-gray-500">{token.symbol}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-bold">{token.price.toFixed(4)} SOL</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">24h Change</p>
          <p className={`font-bold ${token.change24h && token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {token.change24h ? token.change24h.toFixed(2) : '0.00'}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Supply</p>
          <p className="font-semibold">{token.supply.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">24h Volume</p>
          <p className="font-semibold">{token.volume24h ? token.volume24h.toLocaleString() : '0'} SOL</p>
        </div>
      </div>
      
      <div className="text-xs mb-4 font-mono text-gray-500 truncate">
        {token.mintAddress}
      </div>
      
      <Button 
        onClick={onBuy}
        className="w-full bg-[#A3D1C6] text-black hover:bg-[#B3D8A8]"
      >
        Buy {token.symbol}
      </Button>
    </div>
  );
}