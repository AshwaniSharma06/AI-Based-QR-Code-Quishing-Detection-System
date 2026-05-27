# 🛡️ QRShield AI — AI-Based QR Code Quishing Detection System

AI-powered QR code security system that detects phishing and malicious QR links using Machine Learning, URL analysis, and real-time threat detection.

![QRShield AI Banner](qrshield-frontend/public/hero-illustration.png)

---

## 📌 Problem Statement

QR codes are inherently unreadable by humans, making them the perfect vehicle for attackers to hide malicious URLs. This technique, known as **"Quishing"** (QR + Phishing), bypasses traditional email filters and directly targets users' mobile devices. QRShield AI acts as a protective layer that analyzes QR codes *before* the user visits the embedded link.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📸 **Live Camera Scan** | Scan QR codes in real-time using your device camera |
| 📤 **Image Upload** | Upload a QR code image (PNG, JPG, SVG) for analysis |
| 🤖 **AI Threat Detection** | Heuristic + whitelist-based URL analysis engine |
| 🛡️ **Trusted Domain Whitelist** | Instantly verifies well-known safe domains |
| 📊 **Risk Score Dashboard** | Visual risk meter, threat level, and detailed warnings |
| 📜 **Scan History** | Locally stored history of past scans (localStorage) |
| 🎨 **Premium Dark UI** | Glassmorphism, micro-animations, responsive design |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Lightning-fast dev server and bundler
- **TailwindCSS** — Utility-first CSS framework
- **Framer Motion** — Smooth animations and transitions
- **Lucide Icons** — Modern icon library
- **jsQR** — Client-side QR code decoding (Upload)
- **html5-qrcode** — Camera-based QR code scanning

### Backend
- **Python 3** — Core backend language
- **Flask** — Lightweight web framework
- **Flask-CORS** — Cross-origin resource sharing
- **Scikit-Learn & Pandas** — Machine Learning (Random Forest Classifier)

---

## 📂 Project Structure

```
QR Shield-AI-Frontend/
├── qrshield-frontend/          # React Frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── hero-illustration.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── AILoadingScreen.jsx
│   │   │   ├── CameraScanner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ResultDashboard.jsx
│   │   │   ├── RiskMeter.jsx
│   │   │   ├── UploadQR.jsx
│   │   │   └── WarningList.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── qrshield-backend/           # Python Flask Backend
│   ├── app.py                  # Main API server
│   ├── train_model.py          # ML training script
│   ├── url_model.pkl           # Trained Random Forest model
│   ├── dataset_phishing.csv    # Training dataset (11k+ URLs)
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Virtual environment
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and npm
- **Python** 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/AshwaniSharma06/AI-Based-QR-Code-Quishing-Detection-System.git
cd "QR Shield-AI-Frontend"
```

### 2. Start the Backend (Flask + ML)
```bash
cd qrshield-backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python app.py
```
*(The backend will automatically load the pre-trained `url_model.pkl` Random Forest model.)*
The backend will start on **http://127.0.0.1:5000**

### 3. Start the Frontend (React + Vite)
Open a **new terminal**:
```bash
cd qrshield-frontend
npm install
npm run dev
```
The frontend will start on **http://localhost:5173**

### 4. Use the App
1. Open **http://localhost:5173** in your browser
2. Click **"Upload QR Image"** or **"Scan with Camera"**
3. The app decodes the QR code, sends the URL to the Flask backend for analysis
4. View the AI-powered threat assessment on the Result Dashboard

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — returns server status |
| `POST` | `/api/analyze` | Analyze a URL for quishing threats |

### POST `/api/analyze`
**Request Body:**
```json
{
  "url": "https://example.com/some-link"
}
```
**Response:**
```json
{
  "success": true,
  "url": "https://example.com/some-link",
  "analysis": {
    "risk_score": 5,
    "risk_level": "Low Risk",
    "status": "Safe",
    "reasons": [
      "Domain is recognized as a trusted service.",
      "Connection uses HTTPS encryption."
    ]
  }
}
```

---

## 🧠 How the AI Detection Works

1. **QR Decoding** — The frontend uses `jsQR` (upload) or `html5-qrcode` (camera) to extract the embedded URL from the QR image.
2. **Safe Payments & Whitelist Check** — The backend first quickly verifies if the URL is a safe payment scheme (UPI, GPay, etc.) or belongs to a whitelist of 40+ trusted domains (Google, GitHub, Razorpay, etc.).
3. **Feature Extraction** — For unknown domains, the Python backend dynamically extracts **27 structural/lexical features** from the URL string without ever visiting the site. Features include: URL length, count of dots, presence of an IP address, ratio of digits, use of obfuscation characters, etc.
4. **Machine Learning Inference** — The extracted features are passed into a pre-trained **Random Forest Classifier** (`scikit-learn`). The model evaluates the structural patterns and outputs an exact probability (0-100%) that the URL is a phishing attack.
5. **Risk Scoring** — The model's probability translates into the final threat level: **Safe** (<35), **Suspicious** (35–59), or **Malicious** (60+).

---

## 👥 Team

| Name | Role |
|------|------|
| Ashwani Sharma | Full Stack Developer |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ for academic purposes — AI-Based QR Code Quishing Detection System
