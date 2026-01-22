import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { 
  Bot, Send, Calculator, Dices, TrendingUp, FileText, 
  Brain, LineChart, Sparkles, Zap, MessageSquare, User
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const aiTabs = [
  { id: 'general', label: 'AI Coach', icon: Bot, prompt: 'Dammi consigli per migliorare il mio trading' },
  { id: 'risk', label: 'Risk Calculator', icon: Calculator, prompt: 'Calcola la mia position size ottimale' },
  { id: 'psychology', label: 'Psicologia', icon: Brain, prompt: 'Come gestire le emozioni nel trading?' },
  { id: 'analysis', label: 'Analisi Tecnica', icon: LineChart, prompt: 'Analizza il setup attuale' },
  { id: 'montecarlo', label: 'Monte Carlo', icon: Dices, prompt: 'Spiega come funziona Monte Carlo' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, prompt: 'Analizza le mie performance settimanali' },
  { id: 'mt5', label: 'MT5 Analysis', icon: FileText, prompt: 'Come interpretare un report MT5?' },
  { id: 'signals', label: 'Neural Signals', icon: Zap, prompt: 'Setup simili ai miei trade passati?' },
];

const ChatMessage = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
  >
    {!isUser && (
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
    )}
    <div className={`ai-message ${isUser ? 'user' : 'assistant'} max-w-[80%]`}>
      <p className="text-sm whitespace-pre-wrap">{message}</p>
    </div>
    {isUser && (
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <User className="w-4 h-4" />
      </div>
    )}
  </motion.div>
);

export default function AIPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/ai/chat`, {
        messages: [...messages, userMessage],
        context: activeTab
      });
      
      const aiMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Errore nella comunicazione con AI');
      console.error('AI chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMessages([]); // Clear messages when switching tabs
  };

  return (
    <div className="space-y-6 fade-in" data-testid="ai-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          {t('ai.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Il tuo coach AI personale per il trading</p>
      </motion.div>

      {/* AI Tabs Grid */}
      <div className="ai-tabs" data-testid="ai-tabs">
        {aiTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-xl border transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-card/80 border-border/50 hover:border-primary/50'
              }`}
              data-testid={`ai-tab-${tab.id}`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium block">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="bg-card/80 border-border/50" data-testid="ai-chat">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {aiTabs.find(t => t.id === activeTab)?.label || 'AI Coach'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea 
            ref={scrollRef}
            className="h-[400px] px-4"
          >
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-primary/30" />
                  <p className="text-muted-foreground mb-6">
                    Inizia una conversazione o usa un prompt rapido
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickPrompt(aiTabs.find(t => t.id === activeTab)?.prompt || '')}
                    className="rounded-xl"
                    data-testid="quick-prompt-btn"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {aiTabs.find(t => t.id === activeTab)?.prompt}
                  </Button>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg.content} isUser={msg.role === 'user'} />
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="ai-message assistant">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Scrivi un messaggio..."
                className="flex-1 bg-secondary/50 rounded-xl"
                disabled={loading}
                data-testid="ai-input"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="rounded-xl px-4"
                data-testid="ai-send-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Calcola Risk/Reward', prompt: 'Calcola il risk/reward per entry a 100, SL 95, TP 115' },
          { label: 'Analizza Emozioni', prompt: 'Come gestire la FOMO nel trading?' },
          { label: 'Setup Checklist', prompt: 'Dammi una checklist pre-trade' },
          { label: 'Errori Comuni', prompt: 'Quali sono gli errori più comuni dei trader?' },
        ].map((action, i) => (
          <Button
            key={i}
            variant="outline"
            onClick={() => handleQuickPrompt(action.prompt)}
            className="h-auto py-3 px-4 rounded-xl text-left justify-start"
            data-testid={`quick-action-${i}`}
          >
            <Zap className="w-4 h-4 mr-2 text-primary shrink-0" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
