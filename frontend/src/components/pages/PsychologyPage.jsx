import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Brain, CheckCircle2, TrendingUp, Moon, Heart, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PsychologyPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    confidence: 5,
    discipline: 5,
    emotional_state: 'neutrale',
    sleep_hours: 7,
    sleep_quality: 5,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, checkinsRes, rulesRes] = await Promise.all([
        axios.get(`${API}/psychology/stats`),
        axios.get(`${API}/psychology/checkins`),
        axios.get(`${API}/rules`)
      ]);
      setStats(statsRes.data);
      setCheckins(checkinsRes.data);
      setRules(rulesRes.data);
    } catch (error) {
      console.error('Error fetching psychology data:', error);
    }
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/psychology/checkin`, formData);
      toast.success('Check-in salvato!');
      fetchData();
      setFormData({
        confidence: 5,
        discipline: 5,
        emotional_state: 'neutrale',
        sleep_hours: 7,
        sleep_quality: 5,
        notes: ''
      });
    } catch (error) {
      toast.error('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!newRule.trim()) return;
    try {
      await axios.post(`${API}/rules`, { rule: newRule });
      toast.success('Regola aggiunta!');
      setNewRule('');
      fetchData();
    } catch (error) {
      toast.error('Errore');
    }
  };

  const deleteRule = async (id) => {
    try {
      await axios.delete(`${API}/rules/${id}`);
      fetchData();
    } catch (error) {
      toast.error('Errore');
    }
  };

  const emotions = [
    { value: 'eccitato', label: 'Eccitato', icon: '🔥' },
    { value: 'calmo', label: 'Calmo', icon: '😌' },
    { value: 'neutrale', label: 'Neutrale', icon: '😐' },
    { value: 'ansioso', label: 'Ansioso', icon: '😰' },
    { value: 'frustrato', label: 'Frustrato', icon: '😤' }
  ];

  const trendData = checkins.slice(0, 14).reverse().map(c => ({
    date: c.date?.split('-').slice(1).join('/'),
    confidence: c.confidence,
    discipline: c.discipline
  }));

  const sleepData = checkins.slice(0, 14).reverse().map(c => ({
    date: c.date?.split('-').slice(1).join('/'),
    hours: c.sleep_hours,
    quality: c.sleep_quality
  }));

  return (
    <div className="space-y-6 fade-in" data-testid="psychology-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          {t('psychology.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Monitora il tuo stato mentale e migliora le performance</p>
      </motion.div>

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="checkin" className="rounded-lg" data-testid="tab-checkin">Check-in</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg" data-testid="tab-stats">Statistiche</TabsTrigger>
          <TabsTrigger value="sleep" className="rounded-lg" data-testid="tab-sleep">Sonno</TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg" data-testid="tab-rules">Regole</TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <Card className="bg-card/80 border-border/50" data-testid="checkin-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t('psychology.checkin')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckin} className="space-y-6">
                {/* Confidence */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{t('psychology.confidence')}</Label>
                    <span className="text-primary font-bold">{formData.confidence}/10</span>
                  </div>
                  <Slider
                    value={[formData.confidence]}
                    onValueChange={([v]) => setFormData({...formData, confidence: v})}
                    max={10}
                    min={1}
                    step={1}
                    className="py-2"
                    data-testid="confidence-slider"
                  />
                </div>

                {/* Discipline */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{t('psychology.discipline')}</Label>
                    <span className="text-primary font-bold">{formData.discipline}/10</span>
                  </div>
                  <Slider
                    value={[formData.discipline]}
                    onValueChange={([v]) => setFormData({...formData, discipline: v})}
                    max={10}
                    min={1}
                    step={1}
                    className="py-2"
                    data-testid="discipline-slider"
                  />
                </div>

                {/* Emotional State */}
                <div className="space-y-3">
                  <Label>{t('psychology.emotions')}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {emotions.map(e => (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => setFormData({...formData, emotional_state: e.value})}
                        className={`p-3 rounded-xl text-center transition-all ${
                          formData.emotional_state === e.value 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                        }`}
                        data-testid={`emotion-${e.value}`}
                      >
                        <span className="text-2xl block mb-1">{e.icon}</span>
                        <span className="text-xs">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('psychology.sleep_hours')}</Label>
                    <Input
                      type="number"
                      value={formData.sleep_hours}
                      onChange={(e) => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})}
                      min={0}
                      max={24}
                      step={0.5}
                      className="bg-secondary/50"
                      data-testid="sleep-hours-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>{t('psychology.sleep_quality')}</Label>
                      <span className="text-primary font-bold">{formData.sleep_quality}/10</span>
                    </div>
                    <Slider
                      value={[formData.sleep_quality]}
                      onValueChange={([v]) => setFormData({...formData, sleep_quality: v})}
                      max={10}
                      min={1}
                      step={1}
                      data-testid="sleep-quality-slider"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Note aggiuntive</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Come ti senti oggi?"
                    className="bg-secondary/50 min-h-[100px]"
                    data-testid="notes-textarea"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-xl"
                  data-testid="checkin-submit"
                >
                  {loading ? 'Salvando...' : 'Salva Check-in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats?.avg_confidence || 0}</p>
                <p className="text-sm text-muted-foreground">{t('psychology.avg_confidence')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats?.avg_discipline || 0}</p>
                <p className="text-sm text-muted-foreground">{t('psychology.avg_discipline')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats?.total_entries || 0}</p>
                <p className="text-sm text-muted-foreground">{t('psychology.total_entries')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats?.avg_sleep_hours || 0}h</p>
                <p className="text-sm text-muted-foreground">Media Sonno</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trend Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    <Line type="monotone" dataKey="discipline" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">Confidenza</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Disciplina</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <Moon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{stats?.avg_sleep_hours || 0}h</p>
                <p className="text-sm text-muted-foreground">Media Ore Sonno</p>
                <p className={`text-xs mt-1 ${(stats?.avg_sleep_hours || 0) < 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {(stats?.avg_sleep_hours || 0) < 7 ? 'Dormi troppo poco!' : 'Buona media!'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{stats?.avg_sleep_quality || 0}/10</p>
                <p className="text-sm text-muted-foreground">Media Qualità</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle>Storico Sonno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                {t('psychology.rules')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Aggiungi una nuova regola..."
                  className="bg-secondary/50"
                  onKeyPress={(e) => e.key === 'Enter' && addRule()}
                  data-testid="new-rule-input"
                />
                <Button onClick={addRule} className="shrink-0" data-testid="add-rule-btn">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{rule.rule}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      data-testid={`delete-rule-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}

                {rules.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna regola definita. Aggiungi le tue regole di trading!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
