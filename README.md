# Karion Trading OS

## AI Setup (Google Gemini)

Il backend è configurato per usare **Google Gemini** gratuitamente.

### Prerequisiti
1. Ottieni una API Key gratuita da [Google AI Studio](https://aistudio.google.com/apikey)
2. Inseriscila nel file `backend/.env`:
   ```bash
   GOOGLE_API_KEY=AIzaSym...
   ```
3. Installa le dipendenze:
   ```bash
   pip install google-generativeai
   ```

### Avvio
```bash
# Backend
cd backend
python3 server.py

# Frontend
cd frontend
npm run dev
```
