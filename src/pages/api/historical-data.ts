import type { NextApiRequest, NextApiResponse } from 'next';

interface TokenHistoricalData {
    date: string;
    balance: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TokenHistoricalData[] | { error: string }>
) {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Invalid address' });
    }

    try {
        // To be replaced with actual logic to fetch historical data
        const historicalData: TokenHistoricalData[] = await fetchHistoricalDataFromYourSource(address);

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ error: 'No historical data found' });
        }

        res.status(200).json(historicalData);
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Mock function to simulate fetching historical data
async function fetchHistoricalDataFromYourSource(address: string): Promise<TokenHistoricalData[]> {
    // To be actual data fetching logic (Deadline reaching)
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(now.getDate() - (29 - i));
        return {
            date: date.toLocaleDateString(),
            balance: Math.random() * 1000, // Simulate some random balance data
        };
    });
}