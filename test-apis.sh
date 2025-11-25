#!/bin/bash
cd backend
npm run dev > /tmp/trading-server.log 2>&1 &
SERVER_PID=$!
echo "Server starting (PID: $SERVER_PID)..."
sleep 10
echo ""
echo "=== Server Logs ==="
tail -50 /tmp/trading-server.log
echo ""
kill $SERVER_PID 2>/dev/null
