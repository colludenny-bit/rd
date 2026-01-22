import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Target, Sparkles, Save, Plus } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StrategyPage() {
  const { t } = useTranslation();
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  });
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await axios.get(`${API}/strategies`);
      setStrategies(res.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Compila tutti i campi');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/strategy`, formData);
      toast.success('Strategia salvata!');
      fetchStrategies();
      setFormData({ name: '', content: '' });
    } catch (error) {
      toast.error('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const optimizeStrategy = async (strategyId) => {
    setOptimizing(true);
    try {
      const res = await axios.post(`${API}/strategy/${strategyId}/optimize`);
      toast.success('Ottimizzazioni generate!');
      fetchStrategies();
      
      // Update selected strategy with optimizations
      setSelectedStrategy(prev => ({
        ...prev,
        ai_optimizations: res.data.optimizations
      }));
    } catch (error) {
      toast.error('Errore nell\'ottimizzazione');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 fade-in" data-testid="strategy-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          {t('strategy.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Definisci e ottimizza la tua strategia di trading</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Form */}
        <Card className="bg-card/80 border-border/50" data-testid="strategy-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nuova Strategia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('strategy.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Es: Breakout Strategy"
                  className="bg-secondary/50"
                  data-testid="strategy-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('strategy.content')}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder={`Descrivi la tua strategia in dettaglio:
                  
- Entry conditions
- Exit conditions  
- Stop loss rules
- Take profit rules
- Risk management
- Time frames
- Indicatori utilizzati`}
                  className="bg-secondary/50 min-h-[300px] font-mono text-sm"
                  data-testid="strategy-content-textarea"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl"
                data-testid="strategy-submit"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : t('strategy.save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Strategies */}
        <Card className="bg-card/80 border-border/50" data-testid="saved-strategies">
          <CardHeader>
            <CardTitle>Le Tue Strategie</CardTitle>
          </CardHeader>
          <CardContent>
            {strategies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessuna strategia salvata</p>
                <p className="text-sm">Crea la tua prima strategia!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                {strategies.map((strategy, i) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedStrategy?.id === strategy.id 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{strategy.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(strategy.created_at).toLocaleDateString('it')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {strategy.content}
                    </p>
                    
                    {strategy.ai_optimizations?.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="w-3 h-3" />
                        {strategy.ai_optimizations.length} ottimizzazioni AI
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategy && (
        <Card className="bg-card/80 border-border/50" data-testid="strategy-details">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedStrategy.name}</CardTitle>
            <Button 
              onClick={() => optimizeStrategy(selectedStrategy.id)}
              disabled={optimizing}
              className="rounded-xl"
              data-testid="optimize-btn"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {optimizing ? 'Ottimizzando...' : t('strategy.optimize')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-xl">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {selectedStrategy.content}
              </pre>
            </div>

            {selectedStrategy.ai_optimizations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ottimizzazioni AI
                </h4>
                {selectedStrategy.ai_optimizations.map((opt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm">{opt}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
