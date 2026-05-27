import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Define the exact features we want to use. 
# These are purely structural/lexical features that are very fast to compute 
# for any incoming URL without needing external web requests.
LEXICAL_FEATURES = [
    'length_url', 'length_hostname', 'ip', 'nb_dots', 'nb_hyphens', 
    'nb_at', 'nb_qm', 'nb_and', 'nb_or', 'nb_eq', 'nb_underscore', 
    'nb_tilde', 'nb_percent', 'nb_slash', 'nb_star', 'nb_colon', 
    'nb_comma', 'nb_semicolumn', 'nb_dollar', 'nb_space', 'nb_www', 
    'nb_com', 'nb_dslash', 'http_in_path', 'https_token', 
    'ratio_digits_url', 'ratio_digits_host'
]

def train_and_save_model(csv_path, model_path):
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Filter only the features we need + the target
    X = df[LEXICAL_FEATURES]
    
    # The 'status' column contains 'legitimate' or 'phishing'
    # Map legitimate to 0 and phishing to 1
    y = df['status'].map({'legitimate': 0, 'phishing': 1})
    
    print(f"Dataset loaded. Total samples: {len(X)}")
    print(f"Features used: {len(LEXICAL_FEATURES)}")
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    # Initialize and train the model
    # n_estimators=100 and max_depth=20 provides a good balance of accuracy and small model size
    clf = RandomForestClassifier(n_estimators=100, max_depth=20, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    
    # Evaluate
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate (0)', 'Phishing (1)']))
    
    # Save the model
    print(f"Saving model to {model_path}...")
    # We save both the model and the feature list so the app knows exactly what to extract
    model_data = {
        'model': clf,
        'features': LEXICAL_FEATURES
    }
    joblib.dump(model_data, model_path)
    print("Model saved successfully!")

if __name__ == '__main__':
    csv_file = 'dataset_phishing.csv'
    model_file = 'url_model.pkl'
    
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found. Please ensure the dataset is in the same directory.")
    else:
        train_and_save_model(csv_file, model_file)
