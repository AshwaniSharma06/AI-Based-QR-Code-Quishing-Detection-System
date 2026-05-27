from flask import Flask, request, jsonify
from flask_cors import CORS
import urllib.parse
import re

app = Flask(__name__)
# Enable CORS for all routes so frontend can communicate
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "message": "Backend is running!"})

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
    Uses heuristic scoring with a trusted-domain whitelist
    to reduce false positives on legitimate QR codes.
    """
    risk_score = 0
    reasons = []

    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc.lower()

    # Strip port number if present (e.g. example.com:8080)
    domain_no_port = domain.split(':')[0]

    # ── Safe payment schemes ──
    # UPI, PayPal.me, PhonePe, and similar payment QR codes use custom
    # URI schemes (e.g. upi://pay?pa=merchant@ybl).  These are
    # legitimate mobile payment protocols, not web URLs.
    safe_payment_schemes = ['upi', 'paytmmp', 'phonepe', 'gpay', 'bhim']

    if parsed_url.scheme.lower() in safe_payment_schemes:
        safe_reasons = [
            "Recognized as a legitimate payment QR code.",
            f"Payment scheme detected: {parsed_url.scheme.upper()}.",
            "This is a standard mobile payment protocol.",
        ]
        return {
            "risk_score": 2,
            "risk_level": "Low Risk",
            "status": "Safe",
            "reasons": safe_reasons,
        }

    # ── Trusted-domain whitelist ──
    # If the domain (or its parent) is a well-known service, it's almost
    # certainly not a quishing attack.  Return early with a clean score.
    trusted_domains = [
        'google.com', 'youtube.com', 'facebook.com', 'instagram.com',
        'twitter.com', 'x.com', 'linkedin.com', 'github.com',
        'microsoft.com', 'apple.com', 'amazon.com', 'wikipedia.org',
        'whatsapp.com', 'netflix.com', 'spotify.com', 'stackoverflow.com',
        'reddit.com', 'medium.com', 'zoom.us', 'discord.com',
        'paypal.com', 'paypal.me', 'dropbox.com', 'notion.so', 'figma.com',
        'vercel.app', 'netlify.app', 'herokuapp.com',
        'bit.ly', 'tinyurl.com', 'forms.gle', 'docs.google.com',
        # Payment and banking platforms
        'razorpay.com', 'paytm.com', 'phonepe.com', 'gpay.com',
        'stripe.com', 'square.com', 'venmo.com', 'cashapp.com',
        'payu.in', 'instamojo.com', 'bhimupi.org.in',
    ]

    is_trusted = any(
        domain_no_port == td or domain_no_port.endswith('.' + td)
        for td in trusted_domains
    )

    if is_trusted:
        safe_reasons = [
            "Domain is recognized as a trusted service.",
            "Valid and well-known domain detected.",
        ]
        if parsed_url.scheme == 'https':
            safe_reasons.append("Connection uses HTTPS encryption.")
        return {
            "risk_score": 5,
            "risk_level": "Low Risk",
            "status": "Safe",
            "reasons": safe_reasons,
        }

    # ── Heuristic checks (only for non-trusted domains) ──

    # 1. Scheme check
    if parsed_url.scheme not in ('https', 'http', ''):
        risk_score += 15
        reasons.append("Non-standard URL scheme detected.")
    elif parsed_url.scheme == 'http':
        risk_score += 10
        reasons.append("Connection is not secure (HTTP instead of HTTPS).")

    # 2. IP-address instead of domain name
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain_no_port):
        risk_score += 35
        reasons.append("URL uses a raw IP address instead of a domain name.")

    # 3. Suspicious TLDs
    suspicious_tlds = ['.xyz', '.top', '.pw', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq']
    if any(domain_no_port.endswith(tld) for tld in suspicious_tlds):
        risk_score += 20
        reasons.append("Suspicious Top-Level Domain (TLD) detected.")

    # 4. Excessive URL length
    if len(url) > 150:
        risk_score += 10
        reasons.append("Unusually long URL length.")

    # 5. Too many subdomains (e.g. login.secure.bank.example.com)
    subdomain_count = domain_no_port.count('.')
    if subdomain_count >= 4:
        risk_score += 15
        reasons.append("Excessive number of subdomains detected.")

    # 6. Suspicious keywords in URL
    suspicious_keywords = ['login', 'verify', 'secure', 'account', 'update',
                           'confirm', 'banking', 'wallet', 'password', 'signin']
    url_lower = url.lower()
    found_keywords = [kw for kw in suspicious_keywords if kw in url_lower]
    if found_keywords:
        risk_score += 10
        reasons.append(f"Suspicious keywords found: {', '.join(found_keywords)}.")

    # 7. Special characters often used in obfuscation
    # Note: '@' is normal in mailto: links and payment URIs, so only flag
    # it when it appears in http/https URLs where it's used for credential
    # stuffing or URL obfuscation (e.g. http://trusted.com@evil.com)
    if parsed_url.scheme in ('http', 'https') and '@' in url:
        risk_score += 20
        reasons.append("URL contains @ character — possible credential obfuscation.")
    if url.count('//') > 1:
        risk_score += 15
        reasons.append("URL contains multiple double-slashes — possible path obfuscation.")

    # Cap score at 100
    risk_score = min(risk_score, 100)

    # ── Determine risk level ──
    if risk_score >= 60:
        risk_level = "High Risk"
        status = "Malicious"
    elif risk_score >= 35:
        risk_level = "Medium Risk"
        status = "Suspicious"
    else:
        risk_level = "Low Risk"
        status = "Safe"
        if not reasons:
            reasons.append("No immediate threats detected.")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "status": status,
        "reasons": reasons,
    }

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
