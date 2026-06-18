from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
import numpy as np

app = FastAPI(title="Expense Categorizer ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Training Data ──────────────────────────────────────────────
TRAINING_DATA = [
    # Food & Dining
    ("swiggy order", "Food & Dining"),
    ("zomato food", "Food & Dining"),
    ("restaurant bill", "Food & Dining"),
    ("lunch at cafe", "Food & Dining"),
    ("dinner outside", "Food & Dining"),
    ("grocery store", "Food & Dining"),
    ("supermarket shopping", "Food & Dining"),
    ("milk and bread", "Food & Dining"),
    ("vegetable market", "Food & Dining"),
    ("biryani order", "Food & Dining"),
    ("pizza delivery", "Food & Dining"),
    ("burger king", "Food & Dining"),
    ("mcdonalds meal", "Food & Dining"),
    ("dominos pizza", "Food & Dining"),
    ("coffee shop", "Food & Dining"),
    ("starbucks coffee", "Food & Dining"),
    ("breakfast cafe", "Food & Dining"),
    ("food delivery", "Food & Dining"),
    ("blinkit groceries", "Food & Dining"),
    ("bigbasket order", "Food & Dining"),
    ("dunzo groceries", "Food & Dining"),
    ("chai snacks", "Food & Dining"),
    ("canteen food", "Food & Dining"),
    ("mess fees", "Food & Dining"),
    ("eating out", "Food & Dining"),
    ("Eating Ice Cream", "Food & Dining"),

    # Transport
    ("uber ride", "Transport"),
    ("ola cab", "Transport"),
    ("rapido bike", "Transport"),
    ("metro card recharge", "Transport"),
    ("bus ticket", "Transport"),
    ("auto fare", "Transport"),
    ("petrol refill", "Transport"),
    ("fuel station", "Transport"),
    ("train ticket", "Transport"),
    ("flight booking", "Transport"),
    ("airport cab", "Transport"),
    ("taxi ride", "Transport"),
    ("rickshaw fare", "Transport"),
    ("parking charges", "Transport"),
    ("toll charges", "Transport"),
    ("bike service", "Transport"),
    ("car maintenance", "Transport"),
    ("vehicle repair", "Transport"),
    ("driving license", "Transport"),
    ("fastag recharge", "Transport"),
    ("irctc ticket", "Transport"),
    ("indigo flight", "Transport"),
    ("spicejet ticket", "Transport"),
    ("redbus booking", "Transport"),
    ("cab booking", "Transport"),

    # Entertainment
    ("netflix subscription", "Entertainment"),
    ("amazon prime", "Entertainment"),
    ("hotstar subscription", "Entertainment"),
    ("spotify premium", "Entertainment"),
    ("youtube premium", "Entertainment"),
    ("movie tickets", "Entertainment"),
    ("pvr cinema", "Entertainment"),
    ("inox movies", "Entertainment"),
    ("bookmyshow tickets", "Entertainment"),
    ("gaming recharge", "Entertainment"),
    ("pubg uc purchase", "Entertainment"),
    ("steam games", "Entertainment"),
    ("playstation games", "Entertainment"),
    ("concert tickets", "Entertainment"),
    ("event tickets", "Entertainment"),
    ("zoo entry", "Entertainment"),
    ("amusement park", "Entertainment"),
    ("bowling alley", "Entertainment"),
    ("escape room", "Entertainment"),
    ("sonyliv subscription", "Entertainment"),
    ("jiocinema", "Entertainment"),
    ("apple tv", "Entertainment"),
    ("disney hotstar", "Entertainment"),
    ("book purchase fiction", "Entertainment"),
    ("kindle subscription", "Entertainment"),

    # Utilities
    ("electricity bill", "Utilities"),
    ("water bill", "Utilities"),
    ("internet bill", "Utilities"),
    ("broadband recharge", "Utilities"),
    ("wifi bill", "Utilities"),
    ("mobile recharge", "Utilities"),
    ("phone bill", "Utilities"),
    ("gas cylinder", "Utilities"),
    ("cooking gas", "Utilities"),
    ("dth recharge", "Utilities"),
    ("tatasky recharge", "Utilities"),
    ("house rent", "Utilities"),
    ("maintenance charges", "Utilities"),
    ("society fees", "Utilities"),
    ("property tax", "Utilities"),
    ("airtel bill", "Utilities"),
    ("jio recharge", "Utilities"),
    ("vi recharge", "Utilities"),
    ("bsnl bill", "Utilities"),
    ("postpaid bill", "Utilities"),
    ("electricity recharge", "Utilities"),
    ("power bill", "Utilities"),
    ("cable tv", "Utilities"),
    ("lpg booking", "Utilities"),
    ("indane gas", "Utilities"),

    # Health
    ("pharmacy medicine", "Health"),
    ("medical store", "Health"),
    ("doctor consultation", "Health"),
    ("hospital bill", "Health"),
    ("clinic visit", "Health"),
    ("blood test", "Health"),
    ("lab test", "Health"),
    ("health checkup", "Health"),
    ("dentist appointment", "Health"),
    ("eye checkup", "Health"),
    ("gym membership", "Health"),
    ("fitness subscription", "Health"),
    ("yoga class", "Health"),
    ("health insurance", "Health"),
    ("medicine purchase", "Health"),
    ("apollo pharmacy", "Health"),
    ("netmeds order", "Health"),
    ("1mg medicines", "Health"),
    ("physiotherapy session", "Health"),
    ("vaccination", "Health"),
    ("protein supplement", "Health"),
    ("vitamin tablets", "Health"),
    ("ayurveda medicine", "Health"),
    ("mental health therapy", "Health"),
    ("dietitian consultation", "Health"),

    # Other
    ("online shopping", "Other"),
    ("amazon purchase", "Other"),
    ("flipkart order", "Other"),
    ("clothing purchase", "Other"),
    ("shoes purchase", "Other"),
    ("stationery items", "Other"),
    ("books purchase", "Other"),
    ("gift purchase", "Other"),
    ("salon haircut", "Other"),
    ("spa treatment", "Other"),
    ("laundry service", "Other"),
    ("dry cleaning", "Other"),
    ("household items", "Other"),
    ("furniture purchase", "Other"),
    ("home decor", "Other"),
    ("electronics purchase", "Other"),
    ("mobile purchase", "Other"),
    ("laptop accessories", "Other"),
    ("bank charges", "Other"),
    ("atm withdrawal", "Other"),
    ("loan emi", "Other"),
    ("credit card payment", "Other"),
    ("insurance premium", "Other"),
    ("charity donation", "Other"),
    ("miscellaneous expense", "Other"),
]

# ── Train the model ────────────────────────────────────────────
descriptions = [d for d, _ in TRAINING_DATA]
labels = [l for _, l in TRAINING_DATA]

model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
    ('clf', MultinomialNB(alpha=0.5))
])
model.fit(descriptions, labels)

print("Model trained successfully on", len(descriptions), "samples")

# ── Request / Response schemas ─────────────────────────────────
class CategorizeRequest(BaseModel):
    description: str

class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    low_confidence: bool

# ── Endpoints ──────────────────────────────────────────────────
@app.post("/categorize", response_model=CategorizeResponse)
def categorize(req: CategorizeRequest):
    description = req.description.strip().lower()
    probs = model.predict_proba([description])[0]
    classes = model.classes_
    top_idx = int(np.argmax(probs))
    category = classes[top_idx]
    confidence = round(float(probs[top_idx]), 4)
    return CategorizeResponse(
        category=category,
        confidence=confidence,
        low_confidence=confidence < 0.6
    )

@app.get("/health")
def health():
    return {"status": "ok", "model": "Naive Bayes", "training_samples": len(descriptions)}