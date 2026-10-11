from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline

TARGETS = ["specialist", "priority", "complexity"]


def build_pipeline():
    features = FeatureUnion([
        ("words", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("chars", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=2, sublinear_tf=True)),
    ])
    return Pipeline([
        ("tfidf", features),
        ("clf", LogisticRegression(max_iter=2000, C=5.0, class_weight="balanced")),
    ])


def main():
    df = pd.read_csv("data/requests.csv")
    df["text"] = (df["title"].fillna("") + ". " + df["description"].fillna("")).str.lower()

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42,
                                         stratify=df["priority"])
    print(f"Обучающих: {len(train_df)}, проверочных: {len(test_df)}\n")

    models = {}
    for target in TARGETS:
        pipe = build_pipeline()
        pipe.fit(train_df["text"], train_df[target])
        pred = pipe.predict(test_df["text"])
        print(f"=== {target}: точность {accuracy_score(test_df[target], pred):.3f}")
        print(classification_report(test_df[target], pred, zero_division=0))
        models[target] = pipe

    for target in TARGETS:
        models[target].fit(df["text"], df[target])

    Path("models").mkdir(exist_ok=True)
    joblib.dump(models, "models/models.joblib")
    print("Модели сохранены: models/models.joblib")


if __name__ == "__main__":
    main()