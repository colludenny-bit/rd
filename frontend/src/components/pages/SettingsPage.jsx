import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings, Moon, Sun, Globe, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl" data-testid="settings-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Personalizza la tua esperienza</p>
      </motion.div>

      {/* Appearance */}
      <Card className="bg-card/80 border-border/50" data-testid="appearance-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Aspetto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <p className="font-medium">{t('settings.theme')}</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? t('settings.dark') : t('settings.light')}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              data-testid="theme-switch"
            />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{t('settings.language')}</p>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'it' ? 'Italiano' : i18n.language === 'en' ? 'English' : 'Français'}
                </p>
              </div>
            </div>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-[140px]" data-testid="language-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="bg-card/80 border-border/50" data-testid="account-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Cambia Password</p>
              <p className="text-sm text-muted-foreground">Aggiorna la tua password</p>
            </div>
            <Button variant="outline" className="rounded-xl" disabled>
              Modifica
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Collega TradingView</p>
              <p className="text-sm text-muted-foreground">Sincronizza i tuoi grafici</p>
            </div>
            <Button variant="outline" className="rounded-xl" disabled>
              Collega
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Esporta Dati</p>
              <p className="text-sm text-muted-foreground">Scarica tutti i tuoi dati</p>
            </div>
            <Button variant="outline" className="rounded-xl" disabled>
              Esporta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card/80 border-border/50" data-testid="notification-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Daily Check-in Reminder', description: 'Ricordati di fare il check-in alle 18:00', enabled: true },
            { label: 'Revenge Trading Alert', description: 'Avviso quando il pattern suggerisce revenge trading', enabled: true },
            { label: 'Weekly Report', description: 'Report settimanale delle performance', enabled: false },
            { label: 'Community Updates', description: 'Nuovi post dalla community', enabled: false },
          ].map((notif, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div>
                <p className="font-medium">{notif.label}</p>
                <p className="text-sm text-muted-foreground">{notif.description}</p>
              </div>
              <Switch defaultChecked={notif.enabled} data-testid={`notif-${i}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-card/80 border-border/50" data-testid="privacy-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Profilo Pubblico</p>
              <p className="text-sm text-muted-foreground">Altri trader possono vedere il tuo profilo</p>
            </div>
            <Switch data-testid="public-profile" />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Mostra Statistiche</p>
              <p className="text-sm text-muted-foreground">Condividi le tue performance</p>
            </div>
            <Switch data-testid="show-stats" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card/80 border-red-500/20" data-testid="danger-zone">
        <CardHeader>
          <CardTitle className="text-red-400">Zona Pericolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/20">
            <div>
              <p className="font-medium">Elimina Account</p>
              <p className="text-sm text-muted-foreground">Elimina permanentemente tutti i dati</p>
            </div>
            <Button variant="destructive" className="rounded-xl" disabled>
              Elimina
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
