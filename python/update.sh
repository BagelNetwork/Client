#!/bin/bash

# Remove the dist, build, and betabageldb.egg-info directories
rm -rf dist build betabageldb.egg-info

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

# Upload the distributions to PyPi
twine upload dist/*
