// Simulated Macro Data Service
// Since we don't have a paid financial API (Bloomberg/Refinitiv), we simulate realistic market movements.

let cache = {
    indices: {
        SPX: { price: 6050.25, change: 0.45, name: 'S&P 500' },
        NDX: { price: 21450.80, change: 0.82, name: 'NASDAQ 100' },
        XAU: { price: 2750.10, change: 0.15, name: 'Gold' },
        VIX: { price: 15.40, change: -2.10, name: 'Volatility' },
        DXY: { price: 104.20, change: 0.05, name: 'Dollar Index' }
    },
    lastUpdate: Date.now()
};

export const MacroService = {
    // Get live macro data (simulated random walk)
    getLiveIndices: async () => {
        const now = Date.now();
        const elapsed = (now - cache.lastUpdate) / 1000; // seconds since last update

        // Update prices with random walk
        Object.keys(cache.indices).forEach(key => {
            // Simulate market noise
            const volatility = key === 'VIX' ? 0.05 : key === 'NDX' ? 0.02 : 0.01;
            const drift = key === 'VIX' ? -0.01 : 0.005; // Slightly bullish drift
            const change = (Math.random() - 0.5 + drift) * volatility * (elapsed || 1);

            let current = cache.indices[key];
            let newPrice = current.price * (1 + change / 100);
            let newPercent = current.change + (change * 10); // Simulated daily change drift

            // Ensure reasonable bounds
            if (Math.abs(newPercent) > 5) newPercent = newPercent * 0.9;

            cache.indices[key] = {
                ...current,
                price: parseFloat(newPrice.toFixed(2)),
                change: parseFloat(newPercent.toFixed(2))
            };
        });

        cache.lastUpdate = now;
        return cache.indices;
    },

    // Get COT Data (Weekly) - Advanced Technical Version
    getCOTData: async () => {
        const generateHistory = (base, volatility, length = 12) => {
            let history = [];
            let current = base;
            for (let i = length; i >= 0; i--) {
                current += (Math.random() - 0.5) * volatility;
                history.push({
                    date: `W-${i}`,
                    value: Math.round(current)
                });
            }
            return history;
        };

        return {
            SPX: {
                symbol: 'SPX',
                name: 'S&P 500 Index',
                netPosition: 124500,
                change: 12500,
                sentiment: 'BULLISH',
                technical: {
                    zScore: 1.85,
                    percentile52W: 92,
                    concentration4: 25.4,
                    concentration8: 38.2,
                    oiCorrelation: 0.88
                },
                interpretation: [
                    "Le istituzioni continuano ad accumulare posizioni long sull'indice S&P 500.",
                    "Il sentiment prevalente è fortemente rialzista con percentile al 92%.",
                    "Rischio di crowding elevato ma supportato dai flussi di capitale."
                ],
                rollingBias: [
                    { label: 'W-3', value: 45, isCurrent: false },
                    { label: 'W-2', value: 62, isCurrent: false },
                    { label: 'W-1', value: 78, isCurrent: false, isPrevious: true },
                    { label: 'W-0', value: 88, isCurrent: true }
                ],
                breakdownTFF: {
                    assetManagers: { long: 250000, short: 85000, net: 165000, change: 4500, oiPct: 32 },
                    leveragedFunds: { long: 150000, short: 185000, net: -35000, change: -2200, oiPct: 24 },
                    otherReportables: { long: 45000, short: 32000, net: 13000, change: 800, oiPct: 12 }
                },
                openInterest: 1250000,
                history: generateHistory(124500, 20000)
            },
            NDX: {
                symbol: 'NDX',
                name: 'Nasdaq 100',
                netPosition: -45200,
                change: -8400,
                sentiment: 'BEARISH',
                technical: {
                    zScore: -0.85,
                    percentile52W: 12,
                    concentration4: 42.1,
                    concentration8: 58.4,
                    oiCorrelation: -0.45
                },
                interpretation: [
                    "Forte scarico istituzionale sul Nasdaq in vista delle trimestrali.",
                    "Il percentile al 12% suggerisce un estremo pessimismo dei grandi trader.",
                    "Possibile segnale di capitolazione imminente."
                ],
                rollingBias: [
                    { label: 'W-3', value: 55, isCurrent: false },
                    { label: 'W-2', value: 40, isCurrent: false },
                    { label: 'W-1', value: 25, isCurrent: false, isPrevious: true },
                    { label: 'W-0', value: 12, isCurrent: true }
                ],
                breakdownTFF: {
                    assetManagers: { long: 65000, short: 85000, net: -20000, change: -1500, oiPct: 28 },
                    leveragedFunds: { long: 45000, short: 72000, net: -27000, change: -4200, oiPct: 35 },
                    otherReportables: { long: 12000, short: 10200, net: 1800, change: 300, oiPct: 8 }
                },
                openInterest: 850000,
                history: generateHistory(-45200, 15000)
            },
            XAU: {
                symbol: 'XAU',
                name: 'Gold (COMEX)',
                netPosition: 215400,
                change: 4200,
                sentiment: 'BULLISH',
                technical: {
                    zScore: 2.45,
                    percentile52W: 98,
                    concentration4: 38.2,
                    concentration8: 52.6,
                    oiCorrelation: 0.92
                },
                interpretation: [
                    "L'oro vede il più rapido accumulo degli ultimi 8 mesi.",
                    "Posizionamento estremo (98%), segnale di forte avversione al rischio.",
                    "Istituzioni usano il metallo giallo come copertura inflattiva."
                ],
                rollingBias: [
                    { label: 'W-3', value: 72, isCurrent: false },
                    { label: 'W-2', value: 85, isCurrent: false },
                    { label: 'W-1', value: 92, isCurrent: false, isPrevious: true },
                    { label: 'W-0', value: 98, isCurrent: true }
                ],
                breakdownTFF: {
                    assetManagers: { long: 180000, short: 45000, net: 135000, change: 8500, oiPct: 42 },
                    leveragedFunds: { long: 95000, short: 35000, net: 60000, change: 2400, oiPct: 25 },
                    otherReportables: { long: 25400, short: 5000, net: 20400, change: 1200, oiPct: 10 }
                },
                openInterest: 540000,
                history: generateHistory(215400, 10000)
            },
            EUR: {
                symbol: 'EUR',
                name: 'Euro FX',
                netPosition: 12000,
                change: -1500,
                sentiment: 'NEUTRAL',
                technical: {
                    zScore: 0.25,
                    percentile52W: 55,
                    concentration4: 28.4,
                    concentration8: 42.1,
                    oiCorrelation: 0.15
                },
                interpretation: [
                    "L'Euro rimane in una fase di consolidamento istituzionale.",
                    "Dati COT bilanciati, assenza di forte direzionalità smart money.",
                    "Monitorare variazione OI per conferme trend."
                ],
                rollingBias: [
                    { label: 'W-3', value: 48, isCurrent: false },
                    { label: 'W-2', value: 52, isCurrent: false },
                    { label: 'W-1', value: 50, isCurrent: false, isPrevious: true },
                    { label: 'W-0', value: 55, isCurrent: true }
                ],
                breakdownTFF: {
                    assetManagers: { long: 85000, short: 78000, net: 7000, change: -500, oiPct: 38 },
                    leveragedFunds: { long: 55000, short: 52000, net: 3000, change: 800, oiPct: 25 },
                    otherReportables: { long: 12000, short: 10000, net: 2000, change: 200, oiPct: 10 }
                },
                openInterest: 420000,
                history: generateHistory(12000, 5000)
            }
        };
    },

    // Get Options Gamma Exposure (GEX)
    getGEXData: async () => {
        return {
            SPX: {
                totalGamma: 5.2, // Billion $ per 1% move
                zeroGamma: 5950,
                callWall: 6100,
                putWall: 5900,
                profile: [
                    { strike: 5900, gamma: -2.5, type: 'Put Wall' },
                    { strike: 5950, gamma: -0.5, type: 'Flip Zone' },
                    { strike: 6000, gamma: 1.2, type: 'Neutral' },
                    { strike: 6050, gamma: 2.8, type: 'Resistance' },
                    { strike: 6100, gamma: 4.5, type: 'Call Wall' }
                ]
            }
        };
    },

    // Get Fundamental Economic Indicators
    getFundamentals: async () => {
        return {
            FED_RATE: { value: 5.50, name: "Tasso FED", trend: "flat", suffix: "%" },
            CPI_YOY: { value: 3.4, name: "Inflazione (CPI)", trend: "down", suffix: "%" },
            UNEMPLOYMENT: { value: 3.7, name: "Disoccupazione", trend: "up", suffix: "%" },
            GDP_QOQ: { value: 3.2, name: "GDP Growth", trend: "up", suffix: "%" },
            US10Y: { value: 4.10, name: "US 10Y Yield", trend: "up", suffix: "%" }
        };
    }
};
