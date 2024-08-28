#!/bin/bash

# This script automates the process of updating and publishing the bagelml package to PyPI

# Clean up previous build artifacts
# Remove the dist, build, and bagelML.egg-info directories to ensure a clean build
rm -rf dist build bagelml.egg-info

# Set up virtual environment
# Create a virtual environment in the venv directory if it doesn't exist
# This ensures a clean, isolated environment for building and publishing
if [ ! -d "venv" ]; then
     python3.9 -m venv venv
fi

# Activate the virtual environment
# This step is crucial to ensure all subsequent commands run within the virtual environment
source venv/bin/activate

# Update pip to the latest version
# This helps avoid any potential issues with outdated pip versions
pip install --upgrade pip

# Install project dependencies
# This ensures all required packages are installed before building
pip install -r requirements.txt

# Build the package
# Run setup.py to create both a source distribution (sdist) and a built distribution (bdist_wheel)
# This prepares the package for upload to PyPI
python setup.py sdist bdist_wheel

# Prepare for PyPI upload
# Prompt the user for their PyPI API token
# The -s flag ensures the input is not displayed on the screen for security
echo "Enter your PyPI API token:"
read -s PYPI_API_TOKEN

# Set up authentication for PyPI
# Use environment variables to securely pass credentials to twine
# The __token__ username is used in conjunction with the API token for PyPI authentication
export TWINE_USERNAME="__token__"
export TWINE_PASSWORD="$PYPI_API_TOKEN"

# Upload to PyPI
# Use twine to securely upload all distribution files in the dist directory to PyPI
twine upload dist/*

# Deactivate the virtual environment
# This step ensures that we exit the virtual environment after all operations are complete
deactivate

echo "Update process completed. Virtual environment has been deactivated."
