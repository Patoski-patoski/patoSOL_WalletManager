import {
    Connection, PublicKey, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
    getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint, getAssociatedTokenAddress
} from '@solana/spl-token';

// Default RPC connection
const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
);

type TransactionResult = {
    success: boolean;
    message: string;
    txSignature?: string;
    tokenAccount?: string;
};

// ✅ Send tokens using a connected wallet
export async function sendTokens(
    publicKey: string,
    signTransaction: any,
    recipientAddress: string,
    mintAddress: string,
    amount: number
): Promise<TransactionResult> {
    try {
        // Debugging logs
        console.log("Sender public key:", publicKey);
        console.log("Recipient address:", recipientAddress);
        console.log("Mint address:", mintAddress);

        const sender = new PublicKey(publicKey);
        const recipient = new PublicKey(recipientAddress);
        const mint = new PublicKey(mintAddress);

        // Get token decimals
        const mintInfo = await getMint(connection, mint);
        const rawAmount = BigInt(amount * Math.pow(10, mintInfo.decimals));

        // Get associated token accounts
        const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mint,
            sender
        );
        console.log("Sender token account:", senderTokenAccount.address.toString());

        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mint,
            recipient,
        );

        console.log("Recipient token account:", recipientTokenAccount.address.toString());

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            senderTokenAccount.address,
            recipientTokenAccount.address,
            sender,
            rawAmount
        );

        // Sign and send transaction using wallet adapter
        const transaction = new Transaction().add(transferInstruction);
        transaction.feePayer = sender;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        return {
            success: true,
            message: 'Transfer completed successfully!',
            txSignature: signature
        };
    } catch (error) {
        console.error('Error sending tokens:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// ✅ Create a token account with a connected wallet
export async function createTokenAccount(
    wallet: any,
    mintAddress: string
): Promise<TransactionResult> {
    try {
        if (!wallet.publicKey) throw new Error("Wallet not connected");

        const owner = wallet.publicKey;
        const mint = new PublicKey(mintAddress);

        // Get or create associated token account
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            owner,
            mint,
            owner
        );

        return {
            success: true,
            message: 'Token account created successfully!',
            tokenAccount: tokenAccount.address.toString()
        };
    } catch (error) {
        console.error('Error creating token account:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// ✅ Request SOL airdrop
export async function requestAirdrop(
    recipientPublicKey: string,
    solAmount: number
): Promise<TransactionResult> {
    try {
        const recipient = new PublicKey(recipientPublicKey);
        const lamports = solAmount * LAMPORTS_PER_SOL;

        const signature = await connection.requestAirdrop(recipient, lamports);
        await connection.confirmTransaction(signature);

        return {
            success: true,
            message: `${solAmount} SOL airdropped successfully!`,
            txSignature: signature
        };
    } catch (error) {
        console.error('Error requesting airdrop:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// ✅ Get token balances for a wallet
export async function getTokenBalances(walletAddress: string) {
    try {
        const publicKey = new PublicKey(walletAddress);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );

        const balances = tokenAccounts.value.map((tokenAccount) => {
            const accountData = tokenAccount.account.data.parsed.info;
            return {
                mint: accountData.mint,
                owner: accountData.owner,
                tokenAmount: accountData.tokenAmount,
                uiBalance: accountData.tokenAmount.uiAmount,
                decimals: accountData.tokenAmount.decimals
            };
        });

        return balances;
    } catch (error) {
        console.error('Error fetching token balances:', error);
        return [];
    }
}