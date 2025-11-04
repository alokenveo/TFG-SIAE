from funciones.data_loader import extraer_datos
from funciones.features import prepare_features
from funciones.model_trainer import train_models_extended, save_models

if __name__ == "__main__":
    print("🚀 Iniciando carga y entrenamiento de datos en ML_SIAE...")
    df = extraer_datos()
    df, encoders = prepare_features(df)
    modelos = train_models_extended(df, encoders)
    save_models(modelos, encoders)
    print("✅ Modelos entrenados y guardados.")
