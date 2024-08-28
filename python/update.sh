#!/bin/bash

# Remove the dist, build, and bagelML.egg-info directories
rm -rf dist build bagelml.egg-info

# Create a virtual environment in the venv directory if it doesn't exist
if [ ! -d "venv" ]; then
     python3.9 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install the requirements
pip install -r requirements.txt

# Run setup.py to create a source distribution and built distribution
python setup.py sdist bdist_wheel

# Prompt the user for the API token
echo "Enter your PyPI API token:"
read -s PYPI_API_TOKEN

# Upload the distributions to PyPi using the provided API token
export TWINE_USERNAME="__token__"
export TWINE_PASSWORD="$PYPI_API_TOKEN"
twine upload dist/*
