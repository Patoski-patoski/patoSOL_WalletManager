"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { sendTokens } from "@/lib/wallet-utils";
import type { TokenBalance } from "@/app/wallet/page";

export function SendTokens({
  tokenBalances,
  refreshWallet,
}: {
  tokenBalances: TokenBalance[];
  refreshWallet: () => void;
}) {
  const { publicKey, connected, signTransaction } = useWallet();
  const [open, setOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debugging logs
  console.log("Wallet connected:", connected);
  console.log("Public key:", publicKey?.toString());

  const handleSend = async () => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }

    if (!selectedToken || !recipient || !amount) {
      setError("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Debugging logs
      console.log("Sending tokens with the following details:");
      console.log("Sender public key:", publicKey.toString());
      console.log("Recipient address:", recipient);
      console.log("Mint address:", selectedToken);
      console.log("Amount:", amount);

      const result = await sendTokens(
        publicKey.toString(),
        signTransaction,
        recipient,
        selectedToken,
        parseFloat(amount)
      );

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          setOpen(false);
          refreshWallet();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setError("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSelectedToken("");
    setRecipient("");
    setAmount("");
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <Button
        onClick={() => {
          resetState();
          setOpen(true);
        }}
        className="bg-[#3D8D7A] hover:bg-[#2a7361]"
      >
        Send Tokens
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Tokens</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Token
              </Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {tokenBalances.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No tokens available
                    </SelectItem>
                  ) : (
                    tokenBalances.map((token) => (
                      <SelectItem key={token.mint} value={token.mint}>
                        {token.symbol || "Unknown"} ({token.uiBalance})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient address"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to send"
                className="col-span-3"
              />
            </div>

            {error && (
              <div className="bg-red-50 p-2 rounded border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-2 rounded border border-green-200 text-green-600 text-sm">
                {success}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !selectedToken || !recipient || !amount}
              className="bg-[#3D8D7A] hover:bg-[#2a7361]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
