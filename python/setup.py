from setuptools import setup

setup(
    name="betabageldb",
    version="0.1.3",
    description="BagelDB is a Python library for interacting with the BagelDB API.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Bidhan Roy",
    author_email="bidhan@bageldb.ai",
    url="https://github.com/Bagel-DB/Client",
    py_modules=["BagelDB"],
    install_requires=["requests"],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
)

