import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';
import { Dices, Play, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MonteCarloPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [params, setParams] = useState({
    win_rate: 55,
    avg_win: 2,
    avg_loss: 1,
    num_trades: 1000,
    initial_capital: 10000,
    risk_per_trade: 1
  });

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/montecarlo/simulate`, {
        ...params,
        win_rate: params.win_rate / 100,
        risk_per_trade: params.risk_per_trade / 100
      });
      setResults(res.data);
      toast.success('Simulazione completata!');
    } catch (error) {
      toast.error('Errore nella simulazione');
    } finally {
      setLoading(false);
    }
  };

  // Format equity curves for chart
  const chartData = results?.equity_curves?.[0]?.map((value, i) => ({
    trade: i,
    ...Object.fromEntries(
      results.equity_curves.slice(0, 10).map((curve, j) => [`sim${j}`, curve[i]])
    )
  })) || [];

  return (
    <div className="space-y-6 fade-in" data-testid="montecarlo-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Dices className="w-8 h-8 text-primary" />
          {t('montecarlo.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Simula 10,000 scenari di trading</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card className="bg-card/80 border-border/50" data-testid="mc-params">
          <CardHeader>
            <CardTitle>Parametri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Win Rate */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{t('montecarlo.win_rate')}</Label>
                <span className="text-primary font-bold">{params.win_rate}%</span>
              </div>
              <Slider
                value={[params.win_rate]}
                onValueChange={([v]) => setParams({...params, win_rate: v})}
                max={90}
                min={10}
                step={1}
                data-testid="win-rate-slider"
              />
            </div>

            {/* Avg Win */}
            <div className="space-y-2">
              <Label>{t('montecarlo.avg_win')}</Label>
              <Input
                type="number"
                value={params.avg_win}
                onChange={(e) => setParams({...params, avg_win: parseFloat(e.target.value)})}
                step={0.1}
                className="bg-secondary/50"
                data-testid="avg-win-input"
              />
            </div>

            {/* Avg Loss */}
            <div className="space-y-2">
              <Label>{t('montecarlo.avg_loss')}</Label>
              <Input
                type="number"
                value={params.avg_loss}
                onChange={(e) => setParams({...params, avg_loss: parseFloat(e.target.value)})}
                step={0.1}
                className="bg-secondary/50"
                data-testid="avg-loss-input"
              />
            </div>

            {/* Initial Capital */}
            <div className="space-y-2">
              <Label>{t('montecarlo.initial_capital')}</Label>
              <Input
                type="number"
                value={params.initial_capital}
                onChange={(e) => setParams({...params, initial_capital: parseFloat(e.target.value)})}
                className="bg-secondary/50"
                data-testid="initial-capital-input"
              />
            </div>

            {/* Risk Per Trade */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{t('montecarlo.risk_per_trade')}</Label>
                <span className="text-primary font-bold">{params.risk_per_trade}%</span>
              </div>
              <Slider
                value={[params.risk_per_trade]}
                onValueChange={([v]) => setParams({...params, risk_per_trade: v})}
                max={10}
                min={0.5}
                step={0.5}
                data-testid="risk-slider"
              />
            </div>

            {/* Number of Trades */}
            <div className="space-y-2">
              <Label>{t('montecarlo.num_trades')}</Label>
              <Input
                type="number"
                value={params.num_trades}
                onChange={(e) => setParams({...params, num_trades: parseInt(e.target.value)})}
                className="bg-secondary/50"
                data-testid="num-trades-input"
              />
            </div>

            <Button 
              onClick={runSimulation}
              disabled={loading}
              className="w-full rounded-xl"
              data-testid="simulate-btn"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Simulando...' : t('montecarlo.simulate')}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card/80 border-border/50 lg:col-span-2" data-testid="mc-results">
          <CardHeader>
            <CardTitle>Risultati Simulazione</CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-xl text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                    <p className="text-xl font-bold text-emerald-400">
                      ${results.avg_final_capital?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Media Finale</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold text-primary">
                      ${results.max_final_capital?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Max Finale</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl text-center">
                    <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-400" />
                    <p className="text-xl font-bold text-red-400">
                      ${results.min_final_capital?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Min Finale</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl text-center">
                    <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${
                      results.bankruptcy_rate > 10 ? 'text-red-400' : 'text-emerald-400'
                    }`} />
                    <p className={`text-xl font-bold ${
                      results.bankruptcy_rate > 10 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {results.bankruptcy_rate}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('montecarlo.bankruptcy')}</p>
                  </div>
                </div>

                {/* Equity Curves Chart */}
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="trade" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <ReferenceLine y={params.initial_capital} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                      {Array.from({ length: 10 }, (_, i) => (
                        <Line 
                          key={i}
                          type="monotone" 
                          dataKey={`sim${i}`} 
                          stroke={`hsl(${142 + i * 10}, 71%, ${45 + i * 3}%)`}
                          strokeWidth={1}
                          dot={false}
                          opacity={0.7}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Assessment */}
                <div className={`p-4 rounded-xl ${
                  results.bankruptcy_rate > 20 
                    ? 'bg-red-500/10 border border-red-500/20' 
                    : results.bankruptcy_rate > 10
                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                  <h4 className="font-medium mb-2">Valutazione Rischio</h4>
                  <p className="text-sm">
                    {results.bankruptcy_rate > 20 
                      ? '⚠️ Alto rischio di bancarotta. Considera di ridurre il rischio per trade o migliorare win rate.'
                      : results.bankruptcy_rate > 10
                      ? '⚡ Rischio moderato. Monitora attentamente il drawdown.'
                      : '✅ Rischio controllato. La strategia sembra sostenibile a lungo termine.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Dices className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Imposta i parametri e avvia la simulazione</p>
                <p className="text-sm">Simuleremo 1,000 scenari di trading</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
