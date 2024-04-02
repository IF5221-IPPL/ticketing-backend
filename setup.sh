#!/bin/bash

echo "================================================="
echo "          Setting up project folders..."
echo "================================================="
echo -e "\n"

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