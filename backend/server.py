from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from PyPDF2 import PdfReader
import io
import random
import yfinance as yf
from functools import lru_cache
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'tradingos-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="TradingOS API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str
    level: str = "Novice"
    xp: int = 0

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PsychologyCheckin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    confidence: int  # 1-10
    discipline: int  # 1-10
    emotional_state: str
    sleep_hours: float
    sleep_quality: int  # 1-10
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PsychologyCheckinCreate(BaseModel):
    confidence: int
    discipline: int
    emotional_state: str
    sleep_hours: float
    sleep_quality: int
    notes: str = ""

class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    plan_respected: bool
    emotions: str
    lucid_state: bool
    optimization_notes: str
    errors_today: str
    lessons_learned: str
    ai_suggestions: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class JournalEntryCreate(BaseModel):
    plan_respected: bool
    emotions: str
    lucid_state: bool
    optimization_notes: str
    errors_today: str
    lessons_learned: str

class Strategy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    content: str
    ai_optimizations: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StrategyCreate(BaseModel):
    name: str
    content: str

class TradeRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symbol: str
    entry_price: float
    exit_price: float
    profit_loss: float
    profit_loss_r: float
    date: str
    notes: str = ""
    rules_followed: List[str] = []
    rules_violated: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TradeRecordCreate(BaseModel):
    symbol: str
    entry_price: float
    exit_price: float
    profit_loss: float
    profit_loss_r: float
    date: str
    notes: str = ""
    rules_followed: List[str] = []
    rules_violated: List[str] = []

class DisciplineRule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    rule: str
    active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DisciplineRuleCreate(BaseModel):
    rule: str

class CommunityPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    image_url: str = ""
    caption: str
    profit: float = 0
    likes: int = 0
    comments: List[Dict[str, Any]] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommunityPostCreate(BaseModel):
    image_url: str = ""
    caption: str
    profit: float = 0

class AIMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    messages: List[AIMessage]
    context: str = "general"

class MonteCarloParams(BaseModel):
    win_rate: float
    avg_win: float
    avg_loss: float
    num_trades: int = 10000
    initial_capital: float = 10000
    risk_per_trade: float = 0.01

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "level": "Novice",
        "xp": 0
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        created_at=user_doc["created_at"],
        level="Novice",
        xp=0
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"],
        level=user.get("level", "Novice"),
        xp=user.get("xp", 0)
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ==================== PSYCHOLOGY ROUTES ====================

@api_router.post("/psychology/checkin", response_model=PsychologyCheckin)
async def create_checkin(data: PsychologyCheckinCreate, current_user: dict = Depends(get_current_user)):
    checkin = PsychologyCheckin(
        user_id=current_user["id"],
        date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        **data.model_dump()
    )
    await db.psychology_checkins.insert_one(checkin.model_dump())
    
    # Update user XP
    await db.users.update_one({"id": current_user["id"]}, {"$inc": {"xp": 10}})
    return checkin

@api_router.get("/psychology/checkins", response_model=List[PsychologyCheckin])
async def get_checkins(current_user: dict = Depends(get_current_user)):
    checkins = await db.psychology_checkins.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return checkins

@api_router.get("/psychology/stats")
async def get_psychology_stats(current_user: dict = Depends(get_current_user)):
    checkins = await db.psychology_checkins.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).to_list(1000)
    
    if not checkins:
        return {
            "avg_confidence": 0,
            "avg_discipline": 0,
            "avg_sleep_hours": 0,
            "avg_sleep_quality": 0,
            "total_entries": 0,
            "trend": []
        }
    
    total = len(checkins)
    avg_confidence = sum(c.get("confidence", 0) for c in checkins) / total
    avg_discipline = sum(c.get("discipline", 0) for c in checkins) / total
    avg_sleep_hours = sum(c.get("sleep_hours", 0) for c in checkins) / total
    avg_sleep_quality = sum(c.get("sleep_quality", 0) for c in checkins) / total
    
    # Get last 30 entries for trend
    trend = sorted(checkins, key=lambda x: x.get("date", ""), reverse=True)[:30]
    trend_data = [{"date": c.get("date"), "confidence": c.get("confidence"), "discipline": c.get("discipline")} for c in trend]
    
    return {
        "avg_confidence": round(avg_confidence, 1),
        "avg_discipline": round(avg_discipline, 1),
        "avg_sleep_hours": round(avg_sleep_hours, 1),
        "avg_sleep_quality": round(avg_sleep_quality, 1),
        "total_entries": total,
        "trend": trend_data
    }

# ==================== JOURNAL ROUTES ====================

@api_router.post("/journal/entry", response_model=JournalEntry)
async def create_journal_entry(data: JournalEntryCreate, current_user: dict = Depends(get_current_user)):
    # Generate AI suggestions based on errors
    ai_suggestions = []
    if EMERGENT_LLM_KEY and data.errors_today:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"journal-{current_user['id']}-{datetime.now().isoformat()}",
                system_message="Sei un coach di trading esperto. Analizza gli errori del trader e dai 3 consigli pratici brevi in italiano."
            ).with_model("openai", "gpt-5.2")
            
            msg = UserMessage(text=f"Errori di oggi: {data.errors_today}\nLezioni apprese: {data.lessons_learned}")
            response = await chat.send_message(msg)
            ai_suggestions = [s.strip() for s in response.split('\n') if s.strip()][:3]
        except Exception as e:
            logger.error(f"AI suggestion error: {e}")
            ai_suggestions = ["Rivedi il tuo piano di trading", "Mantieni la disciplina", "Gestisci le emozioni"]
    
    entry = JournalEntry(
        user_id=current_user["id"],
        date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        ai_suggestions=ai_suggestions,
        **data.model_dump()
    )
    await db.journal_entries.insert_one(entry.model_dump())
    await db.users.update_one({"id": current_user["id"]}, {"$inc": {"xp": 15}})
    return entry

@api_router.get("/journal/entries", response_model=List[JournalEntry])
async def get_journal_entries(current_user: dict = Depends(get_current_user)):
    entries = await db.journal_entries.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return entries

# ==================== STRATEGY ROUTES ====================

@api_router.post("/strategy", response_model=Strategy)
async def create_strategy(data: StrategyCreate, current_user: dict = Depends(get_current_user)):
    strategy = Strategy(user_id=current_user["id"], **data.model_dump())
    await db.strategies.insert_one(strategy.model_dump())
    return strategy

@api_router.get("/strategies", response_model=List[Strategy])
async def get_strategies(current_user: dict = Depends(get_current_user)):
    strategies = await db.strategies.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("updated_at", -1).to_list(50)
    return strategies

@api_router.post("/strategy/{strategy_id}/optimize")
async def optimize_strategy(strategy_id: str, current_user: dict = Depends(get_current_user)):
    strategy = await db.strategies.find_one({"id": strategy_id, "user_id": current_user["id"]}, {"_id": 0})
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    optimizations = []
    if EMERGENT_LLM_KEY:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"strategy-{strategy_id}",
                system_message="Sei un esperto di trading. Analizza questa strategia e suggerisci 3-5 ottimizzazioni concrete in italiano."
            ).with_model("openai", "gpt-5.2")
            
            msg = UserMessage(text=f"Strategia: {strategy['content']}")
            response = await chat.send_message(msg)
            optimizations = [s.strip() for s in response.split('\n') if s.strip()][:5]
        except Exception as e:
            logger.error(f"Strategy optimization error: {e}")
            optimizations = ["Definisci chiaramente entry e exit", "Imposta stop loss", "Testa su dati storici"]
    
    await db.strategies.update_one(
        {"id": strategy_id},
        {"$set": {"ai_optimizations": optimizations, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"optimizations": optimizations}

# ==================== TRADES ROUTES ====================

@api_router.post("/trades", response_model=TradeRecord)
async def create_trade(data: TradeRecordCreate, current_user: dict = Depends(get_current_user)):
    trade = TradeRecord(user_id=current_user["id"], **data.model_dump())
    await db.trades.insert_one(trade.model_dump())
    await db.users.update_one({"id": current_user["id"]}, {"$inc": {"xp": 5}})
    return trade

@api_router.get("/trades", response_model=List[TradeRecord])
async def get_trades(current_user: dict = Depends(get_current_user)):
    trades = await db.trades.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return trades

@api_router.get("/trades/stats")
async def get_trade_stats(current_user: dict = Depends(get_current_user)):
    trades = await db.trades.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    if not trades:
        return {"total_trades": 0, "win_rate": 0, "avg_r": 0, "total_pnl": 0, "max_dd": 0}
    
    wins = sum(1 for t in trades if t.get("profit_loss", 0) > 0)
    total = len(trades)
    total_pnl = sum(t.get("profit_loss", 0) for t in trades)
    avg_r = sum(t.get("profit_loss_r", 0) for t in trades) / total if total > 0 else 0
    
    return {
        "total_trades": total,
        "win_rate": round((wins / total) * 100, 1) if total > 0 else 0,
        "avg_r": round(avg_r, 2),
        "total_pnl": round(total_pnl, 2),
        "wins": wins,
        "losses": total - wins
    }

# ==================== DISCIPLINE RULES ====================

@api_router.post("/rules", response_model=DisciplineRule)
async def create_rule(data: DisciplineRuleCreate, current_user: dict = Depends(get_current_user)):
    rule = DisciplineRule(user_id=current_user["id"], **data.model_dump())
    await db.discipline_rules.insert_one(rule.model_dump())
    return rule

@api_router.get("/rules", response_model=List[DisciplineRule])
async def get_rules(current_user: dict = Depends(get_current_user)):
    rules = await db.discipline_rules.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).to_list(50)
    return rules

@api_router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.discipline_rules.delete_one({"id": rule_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "deleted"}

# ==================== COMMUNITY ====================

@api_router.post("/community/posts", response_model=CommunityPost)
async def create_post(data: CommunityPostCreate, current_user: dict = Depends(get_current_user)):
    post = CommunityPost(
        user_id=current_user["id"],
        user_name=current_user["name"],
        **data.model_dump()
    )
    await db.community_posts.insert_one(post.model_dump())
    return post

@api_router.get("/community/posts", response_model=List[CommunityPost])
async def get_posts():
    posts = await db.community_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return posts

@api_router.post("/community/posts/{post_id}/like")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user)):
    await db.community_posts.update_one({"id": post_id}, {"$inc": {"likes": 1}})
    return {"status": "liked"}

# ==================== AI CHAT ====================

@api_router.post("/ai/chat")
async def ai_chat(request: AIChatRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        return {"response": "AI non configurata. Contatta l'amministratore."}
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        system_prompts = {
            "general": "Sei un AI coach di trading esperto. Rispondi in modo conciso e pratico in italiano.",
            "risk": "Sei un esperto di risk management per trading. Calcola position size e rischi.",
            "psychology": "Sei uno psicologo del trading. Aiuta il trader a gestire le emozioni.",
            "analysis": "Sei un analista tecnico esperto. Analizza setup e pattern.",
            "montecarlo": "Sei un esperto di statistica per trading. Spiega simulazioni Monte Carlo.",
            "performance": "Sei un coach di performance trading. Analizza statistiche e suggerisci miglioramenti.",
            "mt5": "Sei un esperto di MetaTrader 5. Analizza report e statistiche."
        }
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"chat-{current_user['id']}-{datetime.now().timestamp()}",
            system_message=system_prompts.get(request.context, system_prompts["general"])
        ).with_model("openai", "gpt-5.2")
        
        last_message = request.messages[-1].content if request.messages else ""
        msg = UserMessage(text=last_message)
        response = await chat.send_message(msg)
        
        return {"response": response}
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return {"response": f"Errore AI: {str(e)}"}

# ==================== MONTE CARLO ====================

@api_router.post("/montecarlo/simulate")
async def monte_carlo_simulation(params: MonteCarloParams, current_user: dict = Depends(get_current_user)):
    results = []
    bankruptcies = 0
    final_capitals = []
    
    for _ in range(1000):  # Run 1000 simulations
        capital = params.initial_capital
        equity_curve = [capital]
        
        for _ in range(params.num_trades):
            risk_amount = capital * params.risk_per_trade
            if random.random() < params.win_rate:
                capital += risk_amount * params.avg_win
            else:
                capital -= risk_amount * params.avg_loss
            
            equity_curve.append(capital)
            
            if capital <= 0:
                bankruptcies += 1
                break
        
        final_capitals.append(capital)
        if len(results) < 100:  # Store first 100 curves for visualization
            results.append(equity_curve)
    
    avg_final = sum(final_capitals) / len(final_capitals)
    max_final = max(final_capitals)
    min_final = min(final_capitals)
    bankruptcy_rate = (bankruptcies / 1000) * 100
    
    return {
        "equity_curves": results[:20],  # Send only 20 for visualization
        "avg_final_capital": round(avg_final, 2),
        "max_final_capital": round(max_final, 2),
        "min_final_capital": round(min_final, 2),
        "bankruptcy_rate": round(bankruptcy_rate, 2),
        "params": params.model_dump()
    }

# ==================== PDF ANALYSIS ====================

@api_router.post("/analysis/pdf")
async def analyze_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        pdf_reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        
        # Extract basic stats (simplified)
        stats = {
            "raw_text": text[:2000],  # First 2000 chars
            "page_count": len(pdf_reader.pages)
        }
        
        # AI Analysis
        ai_analysis = ""
        if EMERGENT_LLM_KEY and text:
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                chat = LlmChat(
                    api_key=EMERGENT_LLM_KEY,
                    session_id=f"pdf-{current_user['id']}-{datetime.now().timestamp()}",
                    system_message="Sei un esperto di analisi report MT5. Analizza questo report e identifica: Win Rate, Drawdown, Profit Factor, numero trade. Dai consigli di miglioramento in italiano."
                ).with_model("openai", "gpt-5.2")
                
                msg = UserMessage(text=f"Analizza questo report MT5:\n{text[:3000]}")
                ai_analysis = await chat.send_message(msg)
            except Exception as e:
                logger.error(f"PDF AI analysis error: {e}")
                ai_analysis = "Analisi AI non disponibile"
        
        return {
            "filename": file.filename,
            "stats": stats,
            "ai_analysis": ai_analysis
        }
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# ==================== MARKET DATA ====================

# Cache for market data (refresh every 5 minutes)
_market_cache = {"data": None, "timestamp": None}
_vix_cache = {"data": None, "timestamp": None}

def get_yf_ticker_safe(symbol: str, period: str = "5d", interval: str = "1d"):
    """Safely fetch data from yfinance with error handling"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        if hist.empty:
            return None
        return hist
    except Exception as e:
        logger.error(f"yfinance error for {symbol}: {e}")
        return None

@api_router.get("/market/vix")
async def get_vix_data():
    """Get real VIX data from Yahoo Finance"""
    global _vix_cache
    now = datetime.now(timezone.utc)
    
    # Use cache if less than 5 minutes old
    if _vix_cache["data"] and _vix_cache["timestamp"]:
        age = (now - _vix_cache["timestamp"]).total_seconds()
        if age < 300:  # 5 minutes
            return _vix_cache["data"]
    
    try:
        # Fetch VIX data
        vix_hist = get_yf_ticker_safe("^VIX", period="5d", interval="1d")
        
        if vix_hist is not None and len(vix_hist) >= 2:
            current = float(vix_hist['Close'].iloc[-1])
            yesterday = float(vix_hist['Close'].iloc[-2])
            change = ((current - yesterday) / yesterday) * 100
            
            # Determine direction
            direction = "stable"
            if change > 2:
                direction = "rising"
            elif change < -2:
                direction = "falling"
            
            # Determine regime
            regime = "neutral"
            if current < 18:
                regime = "risk-on"
            elif current > 25:
                regime = "risk-off"
            
            result = {
                "current": round(current, 2),
                "yesterday": round(yesterday, 2),
                "change": round(change, 2),
                "direction": direction,
                "regime": regime,
                "high_5d": round(float(vix_hist['High'].max()), 2),
                "low_5d": round(float(vix_hist['Low'].min()), 2),
                "timestamp": now.isoformat(),
                "source": "yahoo_finance"
            }
            
            _vix_cache["data"] = result
            _vix_cache["timestamp"] = now
            return result
        else:
            raise Exception("No VIX data available")
            
    except Exception as e:
        logger.error(f"VIX fetch error: {e}")
        # Fallback to simulated data
        vix_base = 18 + random.random() * 6
        return {
            "current": round(vix_base, 2),
            "yesterday": round(vix_base + (random.random() - 0.5) * 2, 2),
            "change": round((random.random() - 0.5) * 4, 2),
            "direction": random.choice(["rising", "falling", "stable"]),
            "regime": "neutral",
            "high_5d": round(vix_base + 3, 2),
            "low_5d": round(vix_base - 3, 2),
            "timestamp": now.isoformat(),
            "source": "simulated"
        }

@api_router.get("/market/prices")
async def get_market_prices():
    """Get real market prices from Yahoo Finance"""
    global _market_cache
    now = datetime.now(timezone.utc)
    
    # Use cache if less than 2 minutes old
    if _market_cache["data"] and _market_cache["timestamp"]:
        age = (now - _market_cache["timestamp"]).total_seconds()
        if age < 120:
            return _market_cache["data"]
    
    # Yahoo Finance symbols mapping
    symbols = {
        "XAUUSD": "GC=F",      # Gold Futures
        "NAS100": "NQ=F",      # Nasdaq Futures
        "SP500": "ES=F",       # S&P 500 Futures
        "EURUSD": "EURUSD=X",  # EUR/USD
        "DOW": "YM=F"          # Dow Futures
    }
    
    prices = {}
    
    for display_name, yf_symbol in symbols.items():
        try:
            hist = get_yf_ticker_safe(yf_symbol, period="5d", interval="1d")
            
            if hist is not None and len(hist) >= 2:
                current = float(hist['Close'].iloc[-1])
                prev_close = float(hist['Close'].iloc[-2])
                change_pct = ((current - prev_close) / prev_close) * 100
                
                # Calculate weekly high/low
                weekly_high = float(hist['High'].max())
                weekly_low = float(hist['Low'].min())
                
                prices[display_name] = {
                    "symbol": display_name,
                    "price": round(current, 2 if display_name != "EURUSD" else 5),
                    "change": round(change_pct, 2),
                    "prev_close": round(prev_close, 2 if display_name != "EURUSD" else 5),
                    "weekly_high": round(weekly_high, 2 if display_name != "EURUSD" else 5),
                    "weekly_low": round(weekly_low, 2 if display_name != "EURUSD" else 5),
                    "source": "yahoo_finance"
                }
            else:
                raise Exception(f"No data for {yf_symbol}")
                
        except Exception as e:
            logger.warning(f"Price fetch error for {display_name}: {e}")
            # Fallback prices
            base_prices = {"XAUUSD": 2650, "NAS100": 21450, "SP500": 6050, "EURUSD": 1.085, "DOW": 44200}
            base = base_prices.get(display_name, 100)
            change = (random.random() - 0.5) * 2
            prices[display_name] = {
                "symbol": display_name,
                "price": round(base * (1 + change/100), 2 if display_name != "EURUSD" else 5),
                "change": round(change, 2),
                "prev_close": round(base, 2 if display_name != "EURUSD" else 5),
                "weekly_high": round(base * 1.02, 2 if display_name != "EURUSD" else 5),
                "weekly_low": round(base * 0.98, 2 if display_name != "EURUSD" else 5),
                "source": "simulated"
            }
    
    _market_cache["data"] = prices
    _market_cache["timestamp"] = now
    return prices

# ==================== PHILOSOPHY ====================

PHILOSOPHY_QUOTES = [
    {"author": "Marco Aurelio", "quote": "Non è la morte che l'uomo deve temere, ma non aver mai iniziato a vivere."},
    {"author": "Seneca", "quote": "La fortuna non esiste: esiste il momento in cui il talento incontra l'opportunità."},
    {"author": "Sun Tzu", "quote": "Conosci il nemico e conosci te stesso: in cento battaglie non sarai mai in pericolo."},
    {"author": "Aristotele", "quote": "Siamo ciò che facciamo ripetutamente. L'eccellenza non è un atto, ma un'abitudine."},
    {"author": "Epitteto", "quote": "Non sono i fatti che turbano l'uomo, ma il giudizio che l'uomo dà dei fatti."},
    {"author": "Lao Tzu", "quote": "Un viaggio di mille miglia inizia con un singolo passo."},
    {"author": "Musashi", "quote": "Percepisci ciò che non vedi con gli occhi."},
    {"author": "Buddha", "quote": "La mente è tutto. Ciò che pensi, diventi."},
    {"author": "Confucio", "quote": "La nostra gloria non sta nel non cadere mai, ma nel rialzarci ogni volta che cadiamo."},
    {"author": "Platone", "quote": "Il coraggio è sapere cosa non temere."}
]

@api_router.get("/philosophy/quote")
async def get_philosophy_quote():
    return random.choice(PHILOSOPHY_QUOTES)

# ==================== ASCENSION TRACKER ====================

LEVELS = [
    {"name": "Novice", "min_xp": 0, "icon": "seedling"},
    {"name": "Apprentice", "min_xp": 100, "icon": "leaf"},
    {"name": "Practitioner", "min_xp": 300, "icon": "tree"},
    {"name": "Expert", "min_xp": 600, "icon": "mountain"},
    {"name": "Master", "min_xp": 1000, "icon": "sun"},
    {"name": "Zen Master", "min_xp": 2000, "icon": "moon"},
    {"name": "Market God", "min_xp": 5000, "icon": "crown"}
]

@api_router.get("/ascension/status")
async def get_ascension_status(current_user: dict = Depends(get_current_user)):
    xp = current_user.get("xp", 0)
    current_level = LEVELS[0]
    next_level = LEVELS[1] if len(LEVELS) > 1 else None
    
    for i, level in enumerate(LEVELS):
        if xp >= level["min_xp"]:
            current_level = level
            next_level = LEVELS[i + 1] if i + 1 < len(LEVELS) else None
    
    progress = 0
    if next_level:
        range_xp = next_level["min_xp"] - current_level["min_xp"]
        current_xp = xp - current_level["min_xp"]
        progress = (current_xp / range_xp) * 100 if range_xp > 0 else 100
    
    return {
        "xp": xp,
        "current_level": current_level,
        "next_level": next_level,
        "progress": round(progress, 1),
        "all_levels": LEVELS
    }

# ==================== SETTINGS ====================

@api_router.put("/settings/theme")
async def update_theme(theme: str, current_user: dict = Depends(get_current_user)):
    if theme not in ["dark", "light"]:
        raise HTTPException(status_code=400, detail="Invalid theme")
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"theme": theme}})
    return {"status": "updated", "theme": theme}

@api_router.put("/settings/language")
async def update_language(language: str, current_user: dict = Depends(get_current_user)):
    if language not in ["it", "en", "fr"]:
        raise HTTPException(status_code=400, detail="Invalid language")
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"language": language}})
    return {"status": "updated", "language": language}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "TradingOS API v1.0", "status": "online"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
