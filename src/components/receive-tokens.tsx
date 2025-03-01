"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// import dynamic from "next/dynamic";

import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ReceiveTokens({ walletAddress }: { walletAddress: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Receive Tokens
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Tokens</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-4 space-y-4">
            {walletAddress && (
              <QRCodeSVG
                value={walletAddress}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="Q"
                includeMargin={true}
                imageSettings={{
                  src: "/patosol/public/window.svg",
                  x: undefined,
                  y: undefined,
                  height: 50,
                  width: 50,
                  excavate: true,
                }}
              />
            )}

            <div className="w-full flex items-center space-x-2 bg-gray-100 p-2 rounded">
              <p className="font-mono text-xs break-all flex-1">
                {walletAddress}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {copied && (
              <p className="text-green-600 text-sm">
                Address copied to clipboard!
              </p>
            )}

            <p className="text-center text-sm text-gray-500">
              Share this address to receive tokens from others.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
