from pathlib import Path
import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field

MIN_CONFIDENCE = 0.50

models = joblib.load(Path(__file__).parent / "models" / "models.joblib")
app = FastAPI()

class PredictIn(BaseModel):
    text: str = Field(max_length=5000)
@app.post("/predict")
def predict(data: PredictIn):
    text = data.text.strip()
    if not text:
        return {"specialization": None, "priority": None, "complexity": None,
                "confidence": None, "needs_review": True, "reason": "Текст пустой"}

    result, conf = {}, {}
    for target, model in models.items():
        proba = model.predict_proba([text])[0]
        i = proba.argmax()
        result[target] = str(model.classes_[i])
        conf[target] = round(float(proba[i]), 3)

    needs_review = conf["specialist"] < MIN_CONFIDENCE
    return {
        "specialization": result["specialist"],
        "priority": result["priority"],
        "complexity": result["complexity"],
        "confidence": conf,
        "needs_review": needs_review,
        "reason": "Низкая уверенность модели" if needs_review else None,
    }