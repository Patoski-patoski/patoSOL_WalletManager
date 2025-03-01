import React from 'react';

interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
}

interface WalletTransactionsProps {
    transactions: Transaction[];
}

const WalletTransactions: React.FC<WalletTransactionsProps> = ({ transactions }) => {
    return (
        <div>
            <h2>Wallet Transactions</h2>
            <ul>
                {transactions.map(transaction => (
                    <li key={transaction.id}>
                        <p>Date: {transaction.date}</p>
                        <p>Amount: ${transaction.amount.toFixed(2)}</p>
                        <p>Description: {transaction.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WalletTransactions;