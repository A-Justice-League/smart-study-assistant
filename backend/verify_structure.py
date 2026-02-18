import sys
import os

# Add current directory to sys.path to ensure imports work
sys.path.append(os.getcwd())

try:
    from app.main import app
    from fastapi.testclient import TestClient
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

client = TestClient(app)

print("Checking endpoints...")
try:
    response = client.get("/docs")
    if response.status_code == 200:
        print("/docs is accessible")
    else:
        print(f"/docs failed with {response.status_code}")
except Exception as e:
    print(f"Error accessing /docs: {e}")

# Check specific endpoints
# Note: app.routes contains APIRoute objects
routes = [route.path for route in app.routes]
print(f"Found routes: {routes}")

expected_routes = [
    "/api/v1/upload",
    "/api/v1/ai/summarize",
    "/api/v1/ai/quiz",
    "/api/v1/ai/diagram"
]

missing = []
for expected in expected_routes:
    if expected not in routes:
        missing.append(expected)

if missing:
    print(f"Missing routes: {missing}")
    sys.exit(1)
else:
    print("All feature routes found.")
    sys.exit(0)
