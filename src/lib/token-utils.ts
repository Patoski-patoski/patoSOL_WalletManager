// patosol/src/lib/token-utils.ts

import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export type TokenInfo = {
  totalSupply: number;
  holderCount: number;
  recentTransactionCount: number;
  mintAddress: string;
  decimals: number;
};

// Default RPC endpoint
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export async function getTokenInfo(mintAddress: string): Promise<TokenInfo> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get mint info
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
    const data = (mintInfo.value?.data as any)?.parsed?.info;
    console.log("data", data);
    const decimals = data?.decimals || 9;
    const tokenSupply = data?.supply ? (parseInt(data.supply) / Math.pow(10, decimals)) : 0;
    console.log("token supply", tokenSupply);

    
    // Get token accounts (holders)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      mintPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    // Count unique holders
    const uniqueHolders = new Set();
    tokenAccounts.value.forEach(account => {
      const owner = account.account.data.parsed.info.owner;
      uniqueHolders.add(owner);
    });
    
    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(
      mintPublicKey,
      { limit: 1000 },
      'confirmed'
    );
    
    // Filter for transactions in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentTxs = signatures.filter(sig => 
      sig.blockTime && (new Date(sig.blockTime * 1000) > oneDayAgo)
    );
    
    return {
      totalSupply: tokenSupply,
      holderCount: uniqueHolders.size,
      recentTransactionCount: recentTxs.length,
      mintAddress,
      decimals,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return {
      totalSupply: 0,
      holderCount: 0,
      recentTransactionCount: 0,
      mintAddress,
      decimals: 9
    };
  }
}