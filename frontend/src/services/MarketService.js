import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Cache to prevent rate limiting
let priceCache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

export const MarketService = {
    // Get prices for Karion watchlist
    getPrices: async () => {
        const now = Date.now();
        if (now - lastFetchTime < CACHE_DURATION && Object.keys(priceCache).length > 0) {
            return priceCache;
        }

        try {
            const response = await axios.get(`${COINGECKO_API}/simple/price`, {
                params: {
                    ids: 'bitcoin,ethereum,solana,ripple,cardano',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                    include_24hr_vol: 'true',
                    include_market_cap: 'true'
                }
            });

            priceCache = response.data;
            lastFetchTime = now;
            return priceCache;
        } catch (error) {
            console.error('CoinGecko API Error:', error);
            return priceCache; // Return stale cache if error
        }
    },

    // Get trending coins
    getTrending: async () => {
        try {
            const response = await axios.get(`${COINGECKO_API}/search/trending`);
            return response.data.coins;
        } catch (error) {
            console.error('CoinGecko Trending Error:', error);
            return [];
        }
    },

    // Get detailed coin data
    getCoinDetails: async (id) => {
        try {
            const response = await axios.get(`${COINGECKO_API}/coins/${id}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: true,
                    developer_data: false,
                    sparkline: true
                }
            });
            return response.data;
        } catch (error) {
            console.error(`CoinGecko Details Error (${id}):`, error);
            return null;
        }
    }
};
