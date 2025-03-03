// patosol/src/components/create-token-account.tsx
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
import { createTokenAccount } from "@/lib/wallet-utils";

export function CreateTokenAccount({
  refreshWallet,
}: {
  refreshWallet: () => void;
}) {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!publicKey || !mintAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await createTokenAccount(
        { publicKey },
        mintAddress
      );

      if (result.success) {
        setSuccess(`Token account created: ${result.tokenAccount}`);
        setTimeout(() => {
          setOpen(false);
          refreshWallet();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error creating token account", err);
      setError("Failed to create token account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Add Token
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
            setMintAddress("");
            setError(null);
            setSuccess(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Token to Wallet</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mintAddress" className="text-right">
                Token Mint
              </Label>
              <Input
                id="mintAddress"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Token mint address"
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
              onClick={handleCreate}
              disabled={isLoading || !mintAddress}
              className="bg-[#3D8D7A] hover:bg-[#2a7361]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
