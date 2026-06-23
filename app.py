import streamlit as st
import numpy as np
import pandas as pd
import joblib
import json
from tensorflow import keras

st.set_page_config(page_title="Concrete Strength Predictor", page_icon="🏗️", layout="centered")


@st.cache_resource
def load_artifacts():
    scaler = joblib.load("scaler.pkl")
    rf_model = joblib.load("rf_model.pkl")
    lr_model = joblib.load("lr_model.pkl")
    ann_model = keras.models.load_model("ann_model.keras")
    with open("feature_columns.json") as f:
        feature_columns = json.load(f)
    return scaler, rf_model, lr_model, ann_model, feature_columns


scaler, rf_model, lr_model, ann_model, feature_columns = load_artifacts()

st.title("🏗️ Concrete Compressive Strength Predictor")
st.write(
    "This tool predicts the compressive strength of concrete (in MPa) from its mix "
    "ingredients and curing age, using models trained on the UCI Concrete Compressive "
    "Strength dataset (Yeh, 1998)."
)

st.subheader("Enter Mix Details")

col1, col2 = st.columns(2)

with col1:
    cement = st.number_input("Cement (kg/m³)", min_value=100.0, max_value=600.0, value=281.0, step=1.0)
    slag = st.number_input("Blast Furnace Slag (kg/m³)", min_value=0.0, max_value=400.0, value=74.0, step=1.0)
    fly_ash = st.number_input("Fly Ash (kg/m³)", min_value=0.0, max_value=220.0, value=54.0, step=1.0)
    water = st.number_input("Water (kg/m³)", min_value=100.0, max_value=260.0, value=182.0, step=1.0)

with col2:
    superplasticizer = st.number_input("Superplasticizer (kg/m³)", min_value=0.0, max_value=35.0, value=6.0, step=0.1)
    coarse_agg = st.number_input("Coarse Aggregate (kg/m³)", min_value=750.0, max_value=1200.0, value=973.0, step=1.0)
    fine_agg = st.number_input("Fine Aggregate (kg/m³)", min_value=550.0, max_value=1000.0, value=774.0, step=1.0)
    age = st.number_input("Age (days)", min_value=1, max_value=400, value=28, step=1)

model_choice = st.selectbox(
    "Choose a model for prediction:",
    ["Artificial Neural Network (ANN)", "Random Forest Regressor", "Linear Regression", "Compare All Models"]
)

if st.button("Predict Compressive Strength"):
    eps = 1e-6
    water_cement_ratio = water / (cement + eps)
    total_cementitious = cement + slag + fly_ash
    aggregate_ratio = coarse_agg / (fine_agg + eps)

    input_dict = {
        "Cement": cement,
        "BlastFurnaceSlag": slag,
        "FlyAsh": fly_ash,
        "Water": water,
        "Superplasticizer": superplasticizer,
        "CoarseAggregate": coarse_agg,
        "FineAggregate": fine_agg,
        "Age": age,
        "Water_Cement_Ratio": water_cement_ratio,
        "Total_Cementitious_Material": total_cementitious,
        "Aggregate_Ratio": aggregate_ratio,
    }

    # Reorder columns to exactly match training-time order (critical for correct predictions)
    input_df = pd.DataFrame([input_dict])[feature_columns]
    input_scaled = scaler.transform(input_df)

    def predict_ann():
        return float(ann_model.predict(input_scaled, verbose=0).flatten()[0])

    def predict_rf():
        return float(rf_model.predict(input_scaled)[0])

    def predict_lr():
        return float(lr_model.predict(input_scaled)[0])

    if model_choice == "Artificial Neural Network (ANN)":
        pred = predict_ann()
        st.success(f"Predicted Compressive Strength (ANN): **{pred:.2f} MPa**")

    elif model_choice == "Random Forest Regressor":
        pred = predict_rf()
        st.success(f"Predicted Compressive Strength (Random Forest): **{pred:.2f} MPa**")

    elif model_choice == "Linear Regression":
        pred = predict_lr()
        st.success(f"Predicted Compressive Strength (Linear Regression): **{pred:.2f} MPa**")

    else:
        ann_pred = predict_ann()
        rf_pred = predict_rf()
        lr_pred = predict_lr()
        comp_df = pd.DataFrame({
            "Model": ["ANN", "Random Forest", "Linear Regression"],
            "Predicted Strength (MPa)": [ann_pred, rf_pred, lr_pred]
        })
        st.dataframe(comp_df, use_container_width=True, hide_index=True)
        st.bar_chart(comp_df.set_index("Model"))

    st.caption(
        f"Computed Water-Cement Ratio: {water_cement_ratio:.3f}  |  "
        f"Total Cementitious Material: {total_cementitious:.1f} kg/m³  |  "
        f"Aggregate Ratio: {aggregate_ratio:.3f}"
    )

st.markdown("---")
st.caption(
    "ANN & Deep Learning Course Project — Prediction of Concrete Compressive Strength "
    "using Artificial Neural Networks."
)
