from fastapi import FastAPI
from fastapi import FastAPI
import joblib
 
app = FastAPI()
 
@app.get("/get_predictions")
def get_predictions(text: str):
    if text is None or text.strip() == "":
        return {"error": "Текст не может быть пустым."}
    models = joblib.load("models/models.joblib")
    predictions, confidence = {}, {}
    for target, model in models.items():
        pred = model.predict_proba([text])[0]
        i = pred.argmax()
        predictions[target] = str(model.classes_[i])
        confidence[target] = round(float(pred[i]), 3)
    if confidence["specialist"] < 0.3 or confidence["priority"] < 0.3 or confidence["complexity"] < 0.3:
        return {"error": "Низкая уверенность модели в предсказании. Пожалуйста, уточните текст."}
    return {"specialization": predictions["specialist"], "priority": predictions["priority"], "complexity": predictions["complexity"]}
