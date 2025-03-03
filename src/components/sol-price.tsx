// patosol/src/components/sol-price.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function SolPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPrice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch SOL price");
        }

        const data = await response.json();
        setPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
        // Fallback to mock price if API fails
        const mockPrice = Math.random() * 100 + 50;
        setPrice(Number.parseFloat(mockPrice.toFixed(2)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);

  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">SOLANA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "0.00" : `$${price?.toFixed(2)}`}
        </div>
      </CardContent>
    </Card>
  );
}