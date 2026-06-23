# How to Run the Streamlit App

## Step 1 — Put these 6 files in ONE folder
- `app.py`
- `requirements.txt`
- `scaler.pkl`            (downloaded from Colab)
- `rf_model.pkl`          (downloaded from Colab)
- `lr_model.pkl`          (downloaded from Colab)
- `ann_model.keras`       (downloaded from Colab)
- `feature_columns.json`  (downloaded from Colab)

⚠️ All files MUST be in the same folder, with the exact same filenames as above — the app loads them by these names.

## Step 2 — Install dependencies (one time only)
Open a terminal in that folder and run:
```
pip install -r requirements.txt
```

## Step 3 — Run the app
```
streamlit run app.py
```
A browser tab will open automatically at `http://localhost:8501` showing the live prediction UI. This is your working "deployment" for the presentation — you can demo it live by entering different ingredient values and showing the predicted strength.

## Optional — Deploy online (so it has a real public link)
1. Push this folder (all 6 files) to a new GitHub repository.
2. Go to https://share.streamlit.io and sign in with GitHub.
3. Click "New app", select your repository, set the main file to `app.py`, and deploy.
4. You'll get a public URL you can share or open during the presentation instead of running locally.
