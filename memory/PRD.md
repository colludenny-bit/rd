# TradingOS - Trading Dashboard PRD

## Original Problem Statement
Dashboard Trading completo italiano con:
- Sidebar navigazione (Home, Strategia, Charts, Psicologia, Journal, Community, AI Centrale, Monte Carlo, Statistiche, Ascension)
- Prezzi live XAUUSD, NAS100, SP500, DOW
- TradingView integrato
- Psicologia trading con daily check-in e sleep tracking
- Journal con AI suggestions
- Monte Carlo simulation
- PDF analysis MT5
- Ascension Tracker gamification
- Community Instagram-style
- Dark/Light theme, multilingua IT/EN/FR

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (GPT-5.2)
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Auth**: JWT-based authentication
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key

## User Personas
1. **Day Trader Italiano**: Vuole tracking psicologia e journal AI
2. **Swing Trader**: Focus su statistiche e Monte Carlo
3. **Trader Novizio**: Gamification Ascension per motivazione

## Core Requirements
- [x] Auth system (register/login)
- [x] Dashboard con market overview
- [x] Psychology daily check-in
- [x] Journal con AI suggestions
- [x] Strategy editor con AI optimization
- [x] TradingView charts embedded
- [x] Monte Carlo simulation
- [x] AI Central chat (8 contexts)
- [x] Community posts
- [x] Ascension tracker XP/levels
- [x] Settings (theme/language)
- [x] Mobile responsive

## What's Been Implemented (Jan 2026)
- ✅ Complete authentication flow
- ✅ Dashboard with live price ticker (simulated)
- ✅ Market cards with confidence/WR/DD stats
- ✅ Psychology check-in with sleep tracking
- ✅ Journal with 4 fixed questions + AI suggestions
- ✅ Strategy creation and AI optimization
- ✅ TradingView widget embedded
- ✅ Monte Carlo simulation with charts
- ✅ Statistics page with PDF upload
- ✅ AI Central with 8 specialized tabs
- ✅ Community Instagram-style feed
- ✅ Ascension gamification (7 levels)
- ✅ Settings: Dark/Light theme, IT/EN/FR languages
- ✅ Philosophy quotes rotation
- ✅ Mobile responsive with bottom nav

## Prioritized Backlog
### P0 (Done)
- Core MVP complete

### P1 (Next)
- Real market data API integration (Alpha Vantage)
- Google OAuth social login
- Push notifications for revenge trading alerts
- Daily check-in auto-popup at 18:00

### P2 (Future)
- TradingView account connection
- MT5 report deep parsing
- Weekly automated reports
- Apple login integration
- Neural Trade Signals from past trades
- Cosmic Synchronicity (moon phases)
- Real community image uploads

## Next Tasks
1. Integrate real market data API
2. Add Google OAuth
3. Implement notification system
4. Add weekly report generation
5. Enhance PDF parsing for MT5 reports
