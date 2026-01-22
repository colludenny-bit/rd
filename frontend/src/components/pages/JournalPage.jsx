import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { BookOpen, AlertCircle, Lightbulb, Bot, CheckCircle2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function JournalPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan_respected: true,
    emotions: '',
    lucid_state: true,
    optimization_notes: '',
    errors_today: '',
    lessons_learned: ''
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/journal/entries`);
      setEntries(res.data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/journal/entry`, formData);
      toast.success('Entry salvata! AI sta analizzando...');
      fetchEntries();
      setFormData({
        plan_respected: true,
        emotions: '',
        lucid_state: true,
        optimization_notes: '',
        errors_today: '',
        lessons_learned: ''
      });
    } catch (error) {
      toast.error('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const latestEntry = entries[0];

  return (
    <div className="space-y-6 fade-in" data-testid="journal-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          {t('journal.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Documenta i tuoi trade e impara dai tuoi errori</p>
      </motion.div>

      {/* Main Journal Grid */}
      <div className="journal-grid">
        {/* Left Panel - Errors & Daily Journal */}
        <Card className="bg-card/80 border-border/50" data-testid="journal-errors-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              {t('journal.errors')} + Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 4 Fixed Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <Label className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t('journal.plan_respected')}
                  </Label>
                  <Switch
                    checked={formData.plan_respected}
                    onCheckedChange={(v) => setFormData({...formData, plan_respected: v})}
                    data-testid="plan-respected-switch"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('journal.emotions')}</Label>
                  <Textarea
                    value={formData.emotions}
                    onChange={(e) => setFormData({...formData, emotions: e.target.value})}
                    placeholder="Descrivi le tue emozioni durante il trading..."
                    className="bg-secondary/50 min-h-[80px]"
                    data-testid="emotions-textarea"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <Label className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t('journal.lucid')}
                  </Label>
                  <Switch
                    checked={formData.lucid_state}
                    onCheckedChange={(v) => setFormData({...formData, lucid_state: v})}
                    data-testid="lucid-state-switch"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('journal.optimize')}</Label>
                  <Textarea
                    value={formData.optimization_notes}
                    onChange={(e) => setFormData({...formData, optimization_notes: e.target.value})}
                    placeholder="Cosa potresti migliorare?"
                    className="bg-secondary/50 min-h-[80px]"
                    data-testid="optimization-textarea"
                  />
                </div>
              </div>

              {/* Errors */}
              <div className="space-y-2">
                <Label className="text-red-400">Errori di Oggi</Label>
                <Textarea
                  value={formData.errors_today}
                  onChange={(e) => setFormData({...formData, errors_today: e.target.value})}
                  placeholder="Quali errori hai commesso oggi?"
                  className="bg-red-500/5 border-red-500/20 min-h-[100px]"
                  data-testid="errors-textarea"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl"
                data-testid="journal-submit"
              >
                {loading ? 'Analizzando con AI...' : 'Salva e Analizza'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Panel - Lessons Learned */}
        <Card className="bg-card/80 border-border/50" data-testid="journal-lessons-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Lightbulb className="w-5 h-5" />
              {t('journal.lessons')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Come usare queste lezioni</Label>
              <Textarea
                value={formData.lessons_learned}
                onChange={(e) => setFormData({...formData, lessons_learned: e.target.value})}
                placeholder="Cosa hai imparato oggi? Come applicherai queste lezioni?"
                className="bg-emerald-500/5 border-emerald-500/20 min-h-[200px]"
                data-testid="lessons-textarea"
              />
            </div>

            {/* Recent Lessons */}
            {entries.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground">Lezioni Recenti</h4>
                {entries.slice(0, 3).map((entry, i) => (
                  <div key={entry.id} className="p-3 bg-secondary/50 rounded-xl text-sm">
                    <p className="text-xs text-muted-foreground mb-1">{entry.date}</p>
                    <p className="line-clamp-2">{entry.lessons_learned || 'Nessuna lezione registrata'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Section */}
      <Card className="bg-card/80 border-border/50" data-testid="ai-suggestions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {t('journal.ai_suggestions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestEntry?.ai_suggestions?.length > 0 ? (
            <div className="space-y-3">
              {latestEntry.ai_suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Compila il journal per ricevere suggerimenti AI personalizzati</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal History */}
      {entries.length > 0 && (
        <Card className="bg-card/80 border-border/50" data-testid="journal-history">
          <CardHeader>
            <CardTitle>Storico Journal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{entry.date}</span>
                    <div className="flex gap-2">
                      {entry.plan_respected && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                          Piano OK
                        </span>
                      )}
                      {entry.lucid_state && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                          Lucido
                        </span>
                      )}
                    </div>
                  </div>
                  {entry.errors_today && (
                    <p className="text-sm text-red-400 mt-2">
                      <strong>Errori:</strong> {entry.errors_today}
                    </p>
                  )}
                  {entry.lessons_learned && (
                    <p className="text-sm text-emerald-400 mt-1">
                      <strong>Lezioni:</strong> {entry.lessons_learned}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
