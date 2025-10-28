#!/bin/bash

# SiipCoffee API Runner Script
# Usage: ./run.sh [start|stop|restart|logs|test]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_DIR="/Users/kiel/SiipCoffe/API"
API_NAME="siipcoffe-api"
PORT=8080
LOG_FILE="api.log"
PID_FILE="api.pid"

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if Go is installed
check_go() {
    if ! command -v go &> /dev/null; then
        print_message $RED "❌ Error: Go is not installed!"
        print_message $YELLOW "Please install Go first: https://golang.org/dl/"
        exit 1
    fi
}

# Function to check if .env exists
check_env() {
    if [ ! -f "$API_DIR/.env" ]; then
        print_message $YELLOW "⚠️  .env file not found. Creating from template..."
        cp "$API_DIR/.env.example" "$API_DIR/.env"
        print_message $RED "⚠️  Please edit $API_DIR/.env and add your GEMINI_API_KEY!"
        print_message $BLUE "1. Get API key from: https://aistudio.google.com/app/apikey"
        print_message $BLUE "2. Copy the key and paste in .env file"
        return 1
    fi

    # Check if GEMINI_API_KEY is still the default value
    if grep -q "your_gemini_api_key_here" "$API_DIR/.env"; then
        print_message $RED "❌ Please update GEMINI_API_KEY in $API_DIR/.env"
        print_message $BLUE "Get your API key from: https://aistudio.google.com/app/apikey"
        return 1
    fi

    return 0
}

# Function to create data directory
create_data_dir() {
    if [ ! -d "$API_DIR/data" ]; then
        print_message $BLUE "📁 Creating data directory..."
        mkdir -p "$API_DIR/data"
        chmod 755 "$API_DIR/data"
    fi
}

# Function to install dependencies
install_deps() {
    print_message $BLUE "📦 Installing Go dependencies..."
    cd "$API_DIR"
    go mod download
    go mod tidy
    print_message $GREEN "✅ Dependencies installed!"
}

# Function to build the API
build_api() {
    print_message $BLUE "🔨 Building SiipCoffee API..."
    cd "$API_DIR"
    go build -o "$API_NAME" cmd/server/main.go
    print_message $GREEN "✅ Build successful!"
}

# Function to start the API
start_api() {
    print_message $BLUE "🚀 Starting SiipCoffee API on port $PORT..."
    cd "$API_DIR"

    # Check if already running
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            print_message $YELLOW "⚠️  API is already running (PID: $pid)"
            print_message $BLUE "Use './run.sh stop' to stop it first"
            return 1
        else
            rm -f "$PID_FILE"
        fi
    fi

    # Start the server
    nohup "./$API_NAME" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"

    print_message $GREEN "🎉 SiipCoffee API is starting..."
    print_message $GREEN "📍 API: http://localhost:$PORT"
    print_message $GREEN "📊 Logs: $API_DIR/$LOG_FILE"
    print_message $BLUE "Press Ctrl+C to stop the server"

    # Wait a moment and check if it started
    sleep 3
    if curl -s "http://localhost:$PORT/health" > /dev/null; then
        print_message $GREEN "✅ API is running successfully!"
    else
        print_message $RED "❌ Failed to start API. Check logs: tail -f $LOG_FILE"
        return 1
    fi
}

# Function to stop the API
stop_api() {
    print_message $YELLOW "🛑 Stopping SiipCOFfee API..."

    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            print_message $GREEN "✅ API stopped successfully!"
        else
            print_message $YELLOW "⚠️  API is not running"
            rm -f "$PID_FILE"
        fi
    else
        print_message $YELLOW "⚠️  No PID file found. API may not be running."
    fi
}

# Function to restart the API
restart_api() {
    print_message $BLUE "🔄 Restarting SiipCoffee API..."
    stop_api
    sleep 2
    start_api
}

# Function to show logs
show_logs() {
    if [ -f "$API_DIR/$LOG_FILE" ]; then
        print_message $BLUE "📋 API Logs (Ctrl+C to exit):"
        tail -f "$API_DIR/$LOG_FILE"
    else
        print_message $YELLOW "⚠️  No log file found"
    fi
}

# Function to run tests
test_api() {
    print_message $BLUE "🧪 Running API Tests..."

    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -s "http://localhost:$PORT/health" > /dev/null; then
        print_message $GREEN "✅ Health check passed"
    else
        print_message $RED "❌ Health check failed"
        return 1
    fi

    # Test menu endpoint
    echo "📋 Testing menu endpoint..."
    if curl -s "http://localhost:$PORT/api/v1/menu" > /dev/null; then
        print_message $GREEN "✅ Menu endpoint works"
    else
        print_message $RED "❌ Menu endpoint failed"
        return 1
    fi

    print_message $GREEN "✅ All tests passed!"
}

# Function to check status
check_status() {
    print_message $BLUE "🔍 Checking SiipCoffee API Status..."

    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            print_message $GREEN "✅ API is running (PID: $pid)"
            print_message $BLUE "📍 URL: http://localhost:$PORT"

            # Check if responding
            if curl -s "http://localhost:$PORT/health" > /dev/null; then
                print_message $GREEN "✅ API is responding correctly"
            else
                print_message $YELLOW "⚠️  API is running but not responding"
            fi
        else
            print_message $RED "❌ PID file exists but process not found. Cleaning up..."
            rm -f "$PID_FILE"
            print_message $YELLOW "⚠️  API is not running"
        fi
    else
        print_message $RED "❌ API is not running"
        print_message $BLUE "Use './run.sh start' to start it"
    fi
}

# Main script logic
case "${1:-help}" in
    start)
        check_go
        if check_env; then
            exit 1
        fi
        create_data_dir
        install_deps
        build_api
        start_api
        ;;
    stop)
        stop_api
        ;;
    restart)
        restart_api
        ;;
    logs)
        show_logs
        ;;
    test)
        test_api
        ;;
    status)
        check_status
        ;;
    dev)
        check_go
        if check_env; then
            exit 1
        fi
        create_data_dir
        install_deps
        build_api
        start_api
        ;;
    build)
        check_go
        build_api
        ;;
    help|*)
        echo -e "${BLUE}SiipCoffee API Runner${NC}"
        echo -e "${GREEN}Usage: $0 [command]${NC}"
        echo
        echo -e "${YELLOW}Commands:${NC}"
        echo "  ${BLUE}start${NC}     - Install deps, build and start API"
        echo "  ${BLUE}stop${NC}      - Stop running API"
        echo "  ${BLUE}restart${NC}   - Stop and restart API"
        echo "  ${BLUE}logs${NC}      - Show API logs"
        echo "  ${BLUE}test${NC}      - Run API tests"
        echo "  ${BLUE}status${NC}    - Check API status"
        echo "  ${BLUE}build${NC}     - Build API only"
        echo "  ${BLUE}dev${NC}       - Development mode (auto-reload)"
        echo
        echo -e "${GREEN}Examples:${NC}"
        echo "  $0 start          # Start the API server"
        echo "  $0 stop           # Stop the API server"
        echo "  $0 restart        # Restart the API server"
        echo "  $0 logs           # View logs"
        echo "  $0 test           # Run tests"
        echo
        echo -e "${YELLOW}For development mode, use: $0 dev${NC}"
        ;;
esac