# Importing necessary functions from setuptools
from setuptools import setup, find_packages

# Read the long description from the README file
with open("README.md", "r") as fh:
    long_description = fh.read()

# Define package dependencies
dependencies = [
    "certifi>=2023.5.7",
    "charset-normalizer>=3.2.0",
    "graphlib-backport>=1.0.3",
    "idna>=3.4",
    "numpy>=1.21.6",
    "overrides>=7.3.1",
    "pandas>=2.0.1",
    "pydantic>=1.10.10,<2.0",
    "python-dateutil>=2.8.2",
    "pytz>=2023.3",
    "requests>=2.28",
    "six>=1.16.0",
    "typing-extensions>=4.6.3",
    "urllib3>=1.26.16",
    "tzdata>=2022.1",
]

# Define package classifiers
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.7",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Topic :: Software Development :: Libraries :: Python Modules",
    "Topic :: Scientific/Engineering :: Artificial Intelligence",
]

# Configuration of package setup
setup(
    name="bagelML",
    version="0.0.19",
    description="BagelML is a library for Bagel's finetuning API.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Bidhan Roy",
    author_email="bidhan@bagel.net",
    url="https://github.com/BagelNetwork/Client",
    packages=find_packages(),
    install_requires=dependencies,
    classifiers=classifiers,
)

