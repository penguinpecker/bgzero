#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate

echo "Starting BGZERO backend on :8420..."
cd backend
uvicorn main:app --host 0.0.0.0 --port 8420 --workers 1 &
BACKEND_PID=$!
cd ..

sleep 3
echo "Starting cloudflared tunnel..."
cloudflared tunnel --url http://localhost:8420 &
TUNNEL_PID=$!

echo ""
echo "============================================"
echo "  BGZERO running"
echo "  Backend PID: $BACKEND_PID"
echo "  Tunnel PID:  $TUNNEL_PID"
echo "  Press Ctrl+C to stop both"
echo "============================================"

trap "kill $BACKEND_PID $TUNNEL_PID 2>/dev/null; exit" INT TERM
wait
