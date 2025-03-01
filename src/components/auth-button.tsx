// patosol/src/components/auth-button.tsx

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";


export function AuthButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected, disconnect } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button className="bg-[#A3D1C6] text-black hover:bg-[#B3D8A8]">
        Connect Wallet
      </Button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <WalletMultiButton className="bg-[#A3D1C6] text-black hover:bg-[#B3D8A8] rounded-md px-4 py-2 font-medium"/>
    )
  }

  const walletAddress = publicKey?.toString();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#A3D1C6] text-black hover:bg-[#B3D8A8]"
        >
          {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>My Tokens</DropdownMenuItem>
        <DropdownMenuItem>Transactions</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>Disconnect</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
