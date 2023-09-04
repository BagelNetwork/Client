from setuptools import setup, find_packages

setup(
    name="betabageldb",
    version="0.2.34",
    description="BagelDB is a Python library for interacting with the BagelDB API.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Bidhan Roy",
    author_email="bidhan@bageldb.ai",
    url="https://github.com/Bagel-DB/Client",
    packages=find_packages(),
    install_requires=[
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
        "tzdata>=2022.1"

    ],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
)
