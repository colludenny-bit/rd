export const RiskService = {
    getRiskAnalysis: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate dynamic mock data
        const baseScore = 65;
        const randomFluctuation = Math.floor(Math.random() * 10) - 5;
        const riskScore = Math.max(0, Math.min(100, baseScore + randomFluctuation));

        let category = 'MEDIUM';
        if (riskScore < 40) category = 'SAFE';
        if (riskScore > 75) category = 'HIGH';

        return {
            risk_score: riskScore,
            risk_category: category,
            last_update: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            reasons: [
                { name: 'VIX Momentum', desc: 'Rising volatility', value: 18 },
                { name: 'Put/Call Ratio', desc: 'Bearish sentiment', value: 20 },
                { name: 'Market Breadth', desc: 'Divergence', value: 15 }
            ],
            components: {
                vix_level: 18,
                vix_momentum: 12,
                event_risk: 8,
                market_stretch: 22
            },
            vix: {
                current: 21.45,
                change: +1.25,
                regime: riskScore > 70 ? 'risk-off' : 'neutral',
                yesterday: 20.20,
                high_5d: 22.10,
                low_5d: 18.50,
                source: 'simulation'
            },
            expected_move: {
                percent: 0.85,
                sp500_points: 42
            },
            next_event: {
                event: 'FOMC Minutes',
                hours_away: 4
            },
            macro_events: [
                { time: '14:30', event: 'CPI Data', consensus: '0.3%', previous: '0.4%', impact: 'high' },
                { time: '16:00', event: 'Consumer Confidence', consensus: '102.0', previous: '101.3', impact: 'medium' }
            ],
            assets: {
                EURUSD: { current: 1.0850, weekly_high: 1.0900, weekly_low: 1.0800, distance_to_extreme: 0.8, nearest_extreme: 'Weekly Low' },
                BTCUSD: { current: 43500, weekly_high: 44200, weekly_low: 42000, distance_to_extreme: 1.2, nearest_extreme: 'Weekly High' },
                SPX: { current: 4950, weekly_high: 5000, weekly_low: 4900, distance_to_extreme: 0.4, nearest_extreme: 'ATH' }
            },
            asset_tilts: {
                EURUSD: { tilt: 'bullish', color: 'green', text: 'Holding support' },
                BTCUSD: { tilt: 'neutral-bearish', color: 'yellow', text: 'Consolidation' },
                SPX: { tilt: 'overextended', color: 'red', text: 'RSI Divergence' }
            }
        };
    }
};
