import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { AlertTriangle, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function RiskPage() {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopLoss, setStopLoss] = useState(95);
  const [takeProfit, setTakeProfit] = useState(110);

  const riskAmount = accountSize * (riskPercent / 100);
  const stopDistance = Math.abs(entryPrice - stopLoss);
  const tpDistance = Math.abs(takeProfit - entryPrice);
  const positionSize = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const riskReward = stopDistance > 0 ? (tpDistance / stopDistance).toFixed(2) : 0;
  const potentialProfit = positionSize * tpDistance;
  const potentialLoss = riskAmount;

  return (
    <div className="space-y-6 fade-in" data-testid="risk-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-primary" />
          Risk Calculator
        </h1>
        <p className="text-muted-foreground mt-1">Calcola la size ottimale per ogni trade</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Parametri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Size */}
            <div className="space-y-2">
              <Label>Account Size ($)</Label>
              <Input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                className="bg-secondary/50"
                data-testid="account-size"
              />
            </div>

            {/* Risk Percent */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Rischio per Trade (%)</Label>
                <span className="text-primary font-bold">{riskPercent}%</span>
              </div>
              <Slider
                value={[riskPercent]}
                onValueChange={([v]) => setRiskPercent(v)}
                max={5}
                min={0.5}
                step={0.5}
                data-testid="risk-slider"
              />
              <p className="text-xs text-muted-foreground">
                Rischio: ${riskAmount.toFixed(2)}
              </p>
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
              <Label>Entry Price ($)</Label>
              <Input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="bg-secondary/50"
                data-testid="entry-price"
              />
            </div>

            {/* Stop Loss */}
            <div className="space-y-2">
              <Label className="text-red-400">Stop Loss ($)</Label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="bg-red-500/10 border-red-500/30"
                data-testid="stop-loss"
              />
            </div>

            {/* Take Profit */}
            <div className="space-y-2">
              <Label className="text-primary">Take Profit ($)</Label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                className="bg-primary/10 border-primary/30"
                data-testid="take-profit"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Position Size */}
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Position Size</p>
                <p className="text-4xl font-bold text-primary">{positionSize.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">unità da acquistare</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk/Reward */}
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Risk/Reward Ratio</p>
                <p className={`text-4xl font-bold ${parseFloat(riskReward) >= 2 ? 'text-primary' : parseFloat(riskReward) >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  1:{riskReward}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {parseFloat(riskReward) >= 2 ? '✓ Ottimo R:R' : parseFloat(riskReward) >= 1 ? '⚠ R:R accettabile' : '✗ R:R scarso'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profit/Loss Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Profitto Potenziale</p>
                <p className="text-2xl font-bold text-primary">+${potentialProfit.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <p className="text-xs text-muted-foreground">Perdita Massima</p>
                <p className="text-2xl font-bold text-red-400">-${potentialLoss.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Trade Summary */}
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Riepilogo Trade</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry</span>
                  <span>${entryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="text-red-400">${stopLoss} ({((stopDistance / entryPrice) * 100).toFixed(2)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take Profit</span>
                  <span className="text-primary">${takeProfit} ({((tpDistance / entryPrice) * 100).toFixed(2)}%)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Valore Posizione</span>
                  <span className="font-bold">${(positionSize * entryPrice).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
