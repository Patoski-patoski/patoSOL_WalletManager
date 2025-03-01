import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Mint() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#3D8D7A]">Mint Tokens</h1>
        <AuthButton />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <form className="space-y-4">
          <div>
            <label
              htmlFor="tokenName"
              className="block text-sm font-medium text-gray-700"
            >
              Token Name
            </label>
            <Input id="tokenName" placeholder="Enter token name" />
          </div>
          <div>
            <label
              htmlFor="tokenSymbol"
              className="block text-sm font-medium text-gray-700"
            >
              Token Symbol
            </label>
            <Input id="tokenSymbol" placeholder="Enter token symbol" />
          </div>
          <div>
            <label
              htmlFor="tokenSupply"
              className="block text-sm font-medium text-gray-700"
            >
              Initial Supply
            </label>
            <Input
              id="tokenSupply"
              type="number"
              placeholder="Enter initial supply"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#A3D1C6] text-black hover:bg-[#B3D8A8]"
          >
            Mint Token
          </Button>
        </form>
      </div>
    </div>
  );
}
