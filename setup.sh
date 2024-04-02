#!/bin/bash

echo "================================================="
echo "          Setting up project folders..."
echo "================================================="
echo -e "\n"

# Setup env
if [ -f ".env" ]; then
    echo ".env file already exists. Skipping creation."
else
    # Check if .env.example file exists
    if [ -f ".env.example" ]; then
        # Copy .env.example to .env
        cp .env.example .env
        echo "Copied .env.example to .env."
    else
        echo ".env.example file not found. Cannot create .env."
    fi
fi

# Check if the folder public exists
if [ ! -d "src/public" ]; then
    # If not, create it
    mkdir src/public
    echo "Public folder created."
else
    echo "Public folder already exists. Skipping creation."
fi

# Check if the folder logs exists
if [ ! -d "logs" ]; then
    # If not, create it
    mkdir logs
    echo "Log folder created."
else
    echo "Log folder already exists. Skipping creation."
fi

echo -e "\n"
echo "================================================="
echo "               Set up completed."
echo "================================================="