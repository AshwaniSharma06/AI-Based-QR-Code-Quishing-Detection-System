from flask import Flask, request, jsonify
from flask_cors import CORS
import urllib.parse
import re
import os
import joblib
import pandas as pd

app = Flask(__name__)
# Enable CORS for all routes so frontend can communicate
CORS(app)

# --- ML Model Loading ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'url_model.pkl')
ML_MODEL = None
ML_FEATURES = []

if os.path.exists(MODEL_PATH):
    try:
        model_data = joblib.load(MODEL_PATH)
        ML_MODEL = model_data['model']
        ML_FEATURES = model_data['features']
        print(f"Loaded ML model with {len(ML_FEATURES)} features.")
    except Exception as e:
        print(f"Error loading ML model: {e}")
else:
    print(f"Warning: ML model not found at {MODEL_PATH}. Heuristics will be used as fallback.")

def extract_lexical_features(url):
    """Extracts exactly the 27 structural features used during ML training."""
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.netloc.lower().split(':')[0]
    path = parsed.path.lower()
    
    length_url = len(url)
    length_hostname = len(hostname)
    ip = 1 if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname) else 0
    nb_dots = url.count('.')
    nb_hyphens = url.count('-')
    nb_at = url.count('@')
    nb_qm = url.count('?')
    nb_and = url.count('&')
    nb_or = url.count('|')
    nb_eq = url.count('=')
    nb_underscore = url.count('_')
    nb_tilde = url.count('~')
    nb_percent = url.count('%')
    nb_slash = url.count('/')
    nb_star = url.count('*')
    nb_colon = url.count(':')
    nb_comma = url.count(',')
    nb_semicolumn = url.count(';')
    nb_dollar = url.count('$')
    nb_space = url.count(' ')
    nb_www = 1 if 'www' in hostname else 0
    nb_com = 1 if hostname.endswith('.com') else 0
    nb_dslash = url.count('//')
    http_in_path = 1 if 'http' in path else 0
    https_token = 1 if parsed.scheme == 'https' else 0
    
    digits_in_url = sum(c.isdigit() for c in url)
    ratio_digits_url = digits_in_url / length_url if length_url > 0 else 0
    
    digits_in_host = sum(c.isdigit() for c in hostname)
    ratio_digits_host = digits_in_host / length_hostname if length_hostname > 0 else 0
    
    feature_dict = {
        'length_url': length_url, 'length_hostname': length_hostname, 'ip': ip, 
        'nb_dots': nb_dots, 'nb_hyphens': nb_hyphens, 'nb_at': nb_at, 'nb_qm': nb_qm, 
        'nb_and': nb_and, 'nb_or': nb_or, 'nb_eq': nb_eq, 'nb_underscore': nb_underscore, 
        'nb_tilde': nb_tilde, 'nb_percent': nb_percent, 'nb_slash': nb_slash, 
        'nb_star': nb_star, 'nb_colon': nb_colon, 'nb_comma': nb_comma, 
        'nb_semicolumn': nb_semicolumn, 'nb_dollar': nb_dollar, 'nb_space': nb_space, 
        'nb_www': nb_www, 'nb_com': nb_com, 'nb_dslash': nb_dslash, 
        'http_in_path': http_in_path, 'https_token': https_token, 
        'ratio_digits_url': ratio_digits_url, 'ratio_digits_host': ratio_digits_host
    }
    return feature_dict

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "ok", 
        "message": "Backend is running!",
        "ml_model_loaded": ML_MODEL is not None
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_qr_url():
    """Endpoint to receive an extracted URL and analyze it for quishing."""
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({"error": "Missing 'url' in request body"}), 400
        
    url = data['url']
    
    try:
        # Perform AI/Heuristic Quishing Detection
        analysis_result = analyze_url(url)
        
        return jsonify({
            "success": True,
            "url": url,
            "analysis": analysis_result
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to analyze URL: {str(e)}"}), 500

def analyze_url(url):
    """
    AI Quishing Detection logic.
    1. Quick whitelist checks (Trusted Domains & Payments)
    2. Deep Machine Learning structural analysis (Random Forest)
    """
    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc.lower()
    domain_no_port = domain.split(':')[0]

    # ── 1. Safe payment schemes ──
    safe_payment_schemes = ['upi', 'paytmmp', 'phonepe', 'gpay', 'bhim']
    if parsed_url.scheme.lower() in safe_payment_schemes:
        return {
            "risk_score": 2,
            "risk_level": "Low Risk",
            "status": "Safe",
            "reasons": [
                "Recognized as a legitimate payment QR code.",
                f"Payment scheme detected: {parsed_url.scheme.upper()}.",
            ],
        }

    # ── 2. Trusted-domain whitelist ──
    trusted_domains = [
        'google.com', 'youtube.com', 'facebook.com', 'instagram.com',
        'twitter.com', 'x.com', 'linkedin.com', 'github.com',
        'microsoft.com', 'apple.com', 'amazon.com', 'wikipedia.org',
        'whatsapp.com', 'netflix.com', 'spotify.com', 'stackoverflow.com',
        'reddit.com', 'medium.com', 'zoom.us', 'discord.com',
        'paypal.com', 'paypal.me', 'dropbox.com', 'notion.so', 'figma.com',
        'vercel.app', 'netlify.app', 'herokuapp.com',
        'bit.ly', 'tinyurl.com', 'forms.gle', 'docs.google.com',
        'razorpay.com', 'paytm.com', 'phonepe.com', 'gpay.com',
        'stripe.com', 'square.com', 'venmo.com', 'cashapp.com',
        'payu.in', 'instamojo.com', 'bhimupi.org.in',
    ]

    is_trusted = any(
        domain_no_port == td or domain_no_port.endswith('.' + td)
        for td in trusted_domains
    )

    if is_trusted:
        safe_reasons = ["Domain is recognized as a trusted service."]
        if parsed_url.scheme == 'https':
            safe_reasons.append("Connection uses HTTPS encryption.")
        return {
            "risk_score": 5,
            "risk_level": "Low Risk",
            "status": "Safe",
            "reasons": safe_reasons,
        }

    # ── 3. Machine Learning Analysis ──
    if ML_MODEL is not None:
        # Extract features
        features = extract_lexical_features(url)
        
        # Prepare DataFrame matching training columns
        df_features = pd.DataFrame([features])[ML_FEATURES]
        
        # Get probability of being phishing (class 1)
        phishing_prob = ML_MODEL.predict_proba(df_features)[0][1]
        
        # Convert to 0-100 risk score
        risk_score = int(phishing_prob * 100)
        reasons = [f"AI Model computed a {risk_score}% probability of phishing based on structural URL patterns."]
        
        if features['ip'] == 1:
            reasons.append("Warning: URL uses a raw IP address instead of a domain name.")
        if parsed_url.scheme not in ('https', 'http', ''):
            reasons.append(f"Warning: Non-standard scheme '{parsed_url.scheme}'.")
        elif parsed_url.scheme == 'http':
            reasons.append("Warning: Connection is not secure (HTTP).")
            
        if risk_score >= 60:
            risk_level = "High Risk"
            status = "Malicious"
        elif risk_score >= 35:
            risk_level = "Medium Risk"
            status = "Suspicious"
        else:
            risk_level = "Low Risk"
            status = "Safe"
            reasons.append("No significant structural threats detected by AI.")
            
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "status": status,
            "reasons": reasons,
        }

    # ── Fallback Heuristics (if ML fails to load) ──
    risk_score = 0
    reasons = ["AI Model unavailable, falling back to heuristics."]
    
    if parsed_url.scheme not in ('https', 'http', ''):
        risk_score += 15
    elif parsed_url.scheme == 'http':
        risk_score += 10
    
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain_no_port):
        risk_score += 35
        
    suspicious_tlds = ['.xyz', '.top', '.pw', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq']
    if any(domain_no_port.endswith(tld) for tld in suspicious_tlds):
        risk_score += 20
        
    if risk_score >= 60:
        risk_level = "High Risk"
        status = "Malicious"
    elif risk_score >= 35:
        risk_level = "Medium Risk"
        status = "Suspicious"
    else:
        risk_level = "Low Risk"
        status = "Safe"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "status": status,
        "reasons": reasons,
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
