#!/bin/bash

# iOS App Development Environment Setup Script for macOS (Apple Silicon/Intel)
# This script will guide you through setting up the necessary tools for this Vue + Capacitor project.

echo "=========================================================="
echo "      🚀 iOS Development Environment Setup 🚀      "
echo "=========================================================="

echo ""
echo "Step 1: Agreeing to Xcode License"
echo "You will be prompted for your Mac password to agree to the Xcode license."
sudo xcodebuild -license accept
if [ $? -ne 0 ]; then
    echo "❌ Failed to agree to Xcode license. Please try running 'sudo xcodebuild -license' manually."
    exit 1
else
    echo "✅ Xcode license accepted."
fi

echo ""
echo "Step 2: Checking Homebrew Installation"
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon if necessary
    if [ "$(uname -m)" = "arm64" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    echo "✅ Homebrew installed."
else
    echo "✅ Homebrew is already installed."
fi

echo ""
echo "Step 3: Installing Node.js (via Homebrew)"
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    brew install node
    echo "✅ Node.js installed. Version: $(node -v)"
else
    echo "✅ Node.js is already installed. Version: $(node -v)"
fi

echo ""
echo "Step 4: Installing CocoaPods (via Homebrew)"
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found. Installing CocoaPods..."
    brew install cocoapods
    echo "✅ CocoaPods installed. Version: $(pod --version)"
else
    echo "✅ CocoaPods is already installed. Version: $(pod --version)"
fi

echo ""
echo "Step 5: Installing Project Dependencies"
echo "Running 'npm install' in the project root..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies."
    exit 1
else
    echo "✅ npm dependencies installed."
fi

echo ""
echo "=========================================================="
echo "🎉 Environment Setup Complete!"
echo "You can now run 'npm run dev' to start the development server,"
echo "or use 'npx cap sync ios' followed by 'npx cap open ios' to open the iOS project in Xcode."
echo "=========================================================="
