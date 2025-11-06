from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Cargar modelo
try:
    model = joblib.load(os.path.join(BASE_DIR, 'titanic_model.pkl'))
    print("✅ Modelo cargado correctamente")
except Exception as e:
    model = None
    print(f"❌ Error cargando modelo: {e}")

def index(request):
    return render(request, 'index.html')

@api_view(["POST"])
def predict(request):
    try:
        if model is None:
            return Response({"error": "Modelo no disponible. Por favor, coloca titanic_model.pkl en la carpeta titanic_app/"}, status=500)
            
        data = request.data
        
        # Crear DataFrame
        df = pd.DataFrame([{
            'Pclass': int(data.get('Pclass', 2)),
            'Age': float(data.get('Age', 30)),
            'Fare': float(data.get('Fare', 32)),
            'Sex_male': int(data.get('Sex_male', 1))
        }])
        
        # Predicción
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1] * 100
        
        result = "Sobrevivió" if prediction == 1 else "No sobrevivió"
        
        return Response({
            "prediction": result,
            "probability": round(probability, 2)
        })
        
    except Exception as e:
        print("Error:", str(e))
        return Response({"error": str(e)}, status=500)