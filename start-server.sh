#!/bin/bash

# Orchea Documentation System - Web Server Launcher
# Automatically detects available tools and starts a local web server

PORT=${1:-3000}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌺 Orchea Documentation System"
echo "📡 Starting web server on port $PORT..."
echo "📁 Serving directory: $SCRIPT_DIR"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to open browser
open_browser() {
    sleep 3
    if command_exists xdg-open; then
        xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
    elif command_exists open; then
        open "http://localhost:$PORT" >/dev/null 2>&1 &
    elif command_exists start; then
        start "http://localhost:$PORT" >/dev/null 2>&1 &
    fi
}

# Change to script directory
cd "$SCRIPT_DIR"

# Check for Node.js first (preferred for persistent file editing)
if command_exists node && [ -f "package.json" ]; then
    echo "🚀 Using Node.js server with API support"
    echo "📝 File editing will be persistent"
    echo "🔧 Installing dependencies..."
    
    if command_exists npm; then
        npm install
    elif command_exists yarn; then
        yarn install
    else
        echo "❌ npm or yarn required to install dependencies"
        exit 1
    fi
    
    echo "🌐 Open http://localhost:$PORT in your browser"
    echo "🔄 Press Ctrl+C to stop the server"
    echo "-" * 50
    open_browser
    node server.js
elif command_exists python3; then
    echo "🐍 Using Python 3 HTTP server (read-only mode)"
    echo "⚠️  File editing will not be persistent"
    echo "🌐 Open http://localhost:$PORT in your browser"
    echo "🔄 Press Ctrl+C to stop the server"
    echo "-" * 50
    open_browser
    python3 -m http.server $PORT
elif command_exists python; then
    echo "� Using Python HTTP server (read-only mode)"
    echo "⚠️  File editing will not be persistent"
    echo "🌐 Open http://localhost:$PORT in your browser"
    echo "🔄 Press Ctrl+C to stop the server"
    echo "-" * 50
    open_browser
    python -m http.server $PORT
elif command_exists php; then
    echo "🐘 Using PHP built-in server (read-only mode)"
    echo "⚠️  File editing will not be persistent"
    echo "🌐 Open http://localhost:$PORT in your browser"
    echo "🔄 Press Ctrl+C to stop the server"
    echo "-" * 50
    open_browser
    php -S localhost:$PORT
else
    echo "❌ No suitable web server found!"
    echo "For persistent file editing, install Node.js:"
    echo "  - Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "  - macOS: brew install node"
    echo "  - Windows: Download from https://nodejs.org/"
    echo
    echo "Alternatively, install Python for read-only mode:"
    echo "  - Ubuntu/Debian: apt-get install python3"
    echo "  - macOS: brew install python"
    echo
    echo "Or open index.html directly in your browser (limited functionality)"
    exit 1
fi
