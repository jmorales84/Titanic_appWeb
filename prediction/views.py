from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Cargar modelo y encoders
model = joblib.load(os.path.join(BASE_DIR, 'titanic_model.pkl'))
encoder_sex = joblib.load(os.path.join(BASE_DIR, 'encoder_sex.pkl'))
encoder_embarked = joblib.load(os.path.join(BASE_DIR, 'encoder_embarked.pkl'))

@api_view(["POST"])
def predict(request):
    try:
        data = request.data
        df = pd.DataFrame([data])
        print("Columnas recibidas:", df.columns)

        # Aplicar los encoders LabelEncoder
        df['Sex'] = encoder_sex.transform(df[['Sex']])
        df['Embarked'] = encoder_embarked.transform(df[['Embarked']])

        # Convertir variables categóricas a one-hot encoding (igual que el entrenamiento)
        df = pd.get_dummies(df, columns=['Sex', 'Embarked'], drop_first=True)

        # Alinear columnas con las del modelo entrenado
        model_features = model.feature_names_in_  # columnas usadas al entrenar
        df = df.reindex(columns=model_features, fill_value=0)

        # Predicción
        prob = model.predict_proba(df)[0][1] * 1  # probabilidad %
        prediction = "Sobrevivió" if prob >= 50 else "No sobrevivió"

        return Response({
            "prediction": prediction,
            "probability": round(prob, 2)
        })

    except Exception as e:
        print("Error:", e)
        return Response({"error": str(e)}, status=500)