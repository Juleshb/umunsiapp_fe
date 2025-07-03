#!/bin/bash

echo "🚀 ChatApp Setup Script"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) and npm $(npm -v) are installed"

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    print_success "Server dependencies installed successfully"
else
    print_error "Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
print_status "Installing client dependencies..."
cd ../client
npm install
if [ $? -eq 0 ]; then
    print_success "Client dependencies installed successfully"
else
    print_error "Failed to install client dependencies"
    exit 1
fi

cd ..

# Create environment files
print_status "Setting up environment files..."

# Server environment
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    print_success "Created server/.env from env.example"
    print_warning "Please update server/.env with your database credentials and other settings"
else
    print_warning "server/.env already exists, skipping..."
fi

# Client environment
if [ ! -f "client/.env" ]; then
    cp client/env.example client/.env
    print_success "Created client/.env from env.example"
    print_warning "Please update client/.env with your API endpoints"
else
    print_warning "client/.env already exists, skipping..."
fi

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p server/uploads
print_success "Uploads directory created"

# Database setup instructions
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update server/.env with your PostgreSQL database credentials"
echo "2. Update client/.env with your API endpoints"
echo "3. Create a PostgreSQL database named 'chatapp_db'"
echo "4. Run database migrations:"
echo "   cd server && npx prisma migrate dev --name init"
echo "5. Start the development servers:"
echo "   Server: cd server && npm run dev"
echo "   Client: cd client && npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
print_success "Setup completed successfully! 🎉" 