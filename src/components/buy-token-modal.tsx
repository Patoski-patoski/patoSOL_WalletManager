// patosol/src/components/buy-token-modal.tsx
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { purchaseToken } from "@/lib/marketplace-service";

type BuyTokenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: {
    name: string;
    symbol: string;
    mintAddress: string;
    price: number;
  };
};

export function BuyTokenModal({ isOpen, onClose, token }: BuyTokenModalProps) {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tokenAmount = parseFloat(amount) || 0;
  const totalCost = tokenAmount * token.price;

  async function handlePurchase() {
    if (!publicKey) {
      setError("Wallet not connected");
      return;
    }

    if (tokenAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await purchaseToken(
        token.mintAddress,
        tokenAmount,
        publicKey.toString()
      );

      if (result.success) {
        setSuccess(`Successfully purchased ${tokenAmount} ${token.symbol}!`);
        // Reset amount after successful purchase
        setAmount("1");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Transaction failed. Please try again.");
      console.error("Purchase error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    // Reset state when closing
    setError(null);
    setSuccess(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Buy {token.name} ({token.symbol})
          </DialogTitle>
          <DialogDescription>
            Enter the amount of tokens you want to purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Price</Label>
            <div className="col-span-3">
              {token.price.toFixed(4)} SOL per {token.symbol}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total</Label>
            <div className="col-span-3 font-bold">
              {totalCost.toFixed(4)} SOL
            </div>
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isLoading || !publicKey || tokenAmount <= 0}
            className="bg-[#3D8D7A] hover:bg-[#2a7361]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Buy ${tokenAmount} ${token.symbol}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
