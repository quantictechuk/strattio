# How to Start the Backend Server

## Quick Start

1. **Open a terminal** and navigate to the backend directory:
   ```bash
   cd /Users/pinaki/Desktop/Development/strattio/backend
   ```

2. **Activate the virtual environment**:
   ```bash
   source venv/bin/activate
   ```

3. **Start the server**:
   ```bash
   python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

4. **Verify it's running**:
   - You should see: `INFO:     Uvicorn running on http://0.0.0.0:8001`
   - Open http://localhost:8001/api/health in your browser
   - You should see: `{"status":"healthy","service":"strattio-api",...}`

## Alternative: Use the startup script

```bash
cd /Users/pinaki/Desktop/Development/strattio
./start-backend.sh
```

## Troubleshooting

- **Port 8001 already in use**: Kill the existing process:
  ```bash
  lsof -ti:8001 | xargs kill -9
  ```

- **Module not found errors**: Make sure you're in the virtual environment and dependencies are installed:
  ```bash
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt
  ```

- **MongoDB connection errors**: Check that your `.env` file has the correct `MONGO_URL`

## Keep the server running

The server needs to stay running while you use the frontend. Keep the terminal window open, or run it in the background using `nohup` or `screen`.
