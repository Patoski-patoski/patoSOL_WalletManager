//patosol/src/components/naviggation.tsx

import Link from "next/link";
import { Button } from "./ui/button";

export function Navigation() {
  return (
    <nav className="w-64 bg-[#3D8D7A] p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">patoSOL Manager</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/marketplace">
            <Button variant="ghost" className="w-full justify-start">
              Marketplace
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/mint">
            <Button variant="ghost" className="w-full justify-start">
              Mint Tokens
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/wallet">
            <Button variant="ghost" className="w-full justify-start">
              My Wallet
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/analytics">
            <Button variant="ghost" className="w-full justify-start">
              Analytics
            </Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
