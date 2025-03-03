// patosol/src/components/request-airdrop.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { requestAirdrop } from "@/lib/wallet-utils";

export function RequestAirdrop({
  refreshWallet,
}: {
  refreshWallet: () => void;
}) {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAirdrop = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await requestAirdrop(
        publicKey.toString(),
        parseFloat(amount)
      );

      if (result.success) {
        setSuccess(`${amount} SOL airdropped successfully!`);
        setTimeout(() => {
          setOpen(false);
          refreshWallet();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error requesting airdrop", err);
      setError("Airdrop failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="bg-[#A3D1C6] text-black hover:bg-[#B3D8A8]"
      >
        Request SOL Airdrop
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
            setAmount("1");
            setError(null);
            setSuccess(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request SOL Airdrop</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">
              Request SOL from the Devnet faucet. This will only work on Devnet.
            </p>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (SOL)
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="SOL amount"
                className="col-span-3"
              />
            </div>

            <p className="text-xs text-gray-400">
              Devnet limits: Maximum 5 SOL per request
            </p>

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
              onClick={handleAirdrop}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="bg-[#3D8D7A] hover:bg-[#2a7361]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Airdrop"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
