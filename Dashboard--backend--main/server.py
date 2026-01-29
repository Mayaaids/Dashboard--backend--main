#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to the dashboard directory
os.chdir(r'C:\Users\danie\OneDrive\Desktop\talos-dashboard\TALOS-REG-DASHBOARD-main')

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"✅ Dashboard running on http://localhost:{PORT}")
    print(f"📊 Open your browser and go to: http://localhost:{PORT}")
    print(f"🔌 Backend is running on http://localhost:5000")
    print(f"\nPress Ctrl+C to stop the server")
    httpd.serve_forever()
