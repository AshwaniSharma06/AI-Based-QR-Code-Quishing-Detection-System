import app
import json

print("Testing app module...")
result1 = app.analyze_url("https://www.google.com")
print(f"Google: {json.dumps(result1, indent=2)}")

result2 = app.analyze_url("http://192.168.1.1/login.php?user=admin")
print(f"Suspicious IP: {json.dumps(result2, indent=2)}")

result3 = app.analyze_url("upi://pay?pa=merchant@ybl")
print(f"UPI Payment: {json.dumps(result3, indent=2)}")

print("Tests completed.")
