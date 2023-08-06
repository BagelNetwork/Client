#!/bin/bash

VENV_DIR="venv"

# Check if virtual environment exists
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists. Skipping creation."
else
    # Create a virtual environment
    python3.9 -m venv $VENV_DIR
    echo "Virtual environment created."
fi

# Activate the virtual environment
source "$VENV_DIR/bin/activate"
echo "Virtual environment activated."

# Install required packages
pip install -r requirements.txt
echo "Required packages installed."

$VENV_DIR/bin/python example.py
