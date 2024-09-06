# Bagel Python Client 🥯

Welcome to the Bagel Python Client! Bagel is your platform for peer-to-peer machine learning, fine-tuning open-source models like Llama or Mistral, and using retrieval augmented generation (RAG).

One of the perks? **No need to manage complex embeddings or model integrations yourself!** The Bagel client handles these processes, saving you time and money. 🥯

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Import the necessary modules](#import-the-necessary-modules)
4. [Define the Bagel server settings](#define-the-bagel-server-settings)
5. [Create the Bagel client](#create-the-bagel-client)
6. [Ping the Bagel server](#ping-the-bagel-server)
7. [Get the Bagel server version](#get-the-bagel-server-version)
8. [Create an Asset](#create-an-asset)
9. [Delete an Asset](#delete-an-asset)
10. [Download Model Files](#download-model-files)
11. [Query Asset](#query-asset)
12. [Update Asset](#update-asset)
13. [Download file](#download-file)
14. [File Upload](#file-upload)
15. [Fine-tune](#fine-tune)
16. [Get all assets](#get-all-assets)
17. [Get all assets by Id](#get-all-assets-by-id)
18. [Get finetuned model](#get-finetuned-model)
19. [Get job by job id](#get-job-by-job-id)
20. [Get job](#get-job)
21. [List Job](#list-job)
22. [Add data to asset](#add-data-to-asset)

## Prerequisites

- Python 3.6+
- pip package manager
- Asset size limit 500MB (\*Create a new issue if you want to increase the limit)

## Installation

To install the Bagel Python client, run the following command in your terminal:

```shell
pip install bagelML
```

## Import the necessary modules

```python
import uuid
import os
import bagel
from dotenv import load_dotenv
```

This snippet imports the required modules for using Bagel.

## Create the Bagel client

```python
client = bagel.Client()
```

Create an instance of the Bagel client using the previously defined server settings.

## Ping the Bagel server

```python
print(client.ping())
```

This checks the connectivity to the Bagel server.

## Get the Bagel server version

```python
print(client.get_version())
```

Retrieves and prints the version of the Bagel server.


## Create an Asset

Assets in Bagel serve as powerful containers for large datasets, encapsulating embeddings — high-dimensional vectors that represent various data forms, such as text, images, or audio. These Assets enable efficient similarity searches, which are fundamental to a wide range of applications, from recommendation systems and search engines to data analytics tools.

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

payload = {
    "dataset_type": "RAW",
    "title": "",
    "category": "",
    "details": "Testing",
    "tags": ["AI", "DEMO", "TEST"],
    "user_id": 'insert user id'
}

response = client.create_asset(payload, api_key)
print(response)
```

`Note`: This code prompts the user to enter their API key securely (without displaying it on the screen) and then sets it as an environment variable named BAGEL_API_KEY


## Delete an Asset

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

dataset_id = 'insert dataset/asset id'

response = client.delete_asset(dataset_id, api_key)
print(response)
```

This method deletes a specific Asset.

## Query Asset

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = ""

payload = {
    "where": {
        # "category": "Cat2",
    },
    "where_document": {
        # "is_published": True,
    },
    # "query_embeddings": [em],
    "n_results": 1,
    "include": ["metadatas", "documents", "distances"],
    "query_texts": ["insert query text"],
    "padding": False,
}

response = client.query_asset(asset_id, payload, api_key)
print(response)
```

Queries a specific Asset with detailed parameters.

## Update Asset

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = ""

payload = {
   "title": "Updated dataset title",
    "category": "Updated category",
    "details": "Updated dataset description.",
    "tags": ["Updated", "Tags"]
}

response = client.update_asset(asset_id, payload, api_key)
print(response)
```

Updates the details of an existing Asset.

## Download file

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = ""
file_name = ""

response = client.download_file(asset_id, file_name, api_key)
print(response)
```

Downloads a specific file from an Asset.

## File Upload

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

dataset_id = ""
file_path = ""

response = client.file_upload(file_path, dataset_id, api_key)
print(response)
```

Uploads a file to a specific Asset.

## Fine-tune

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

# Define the payload for the fine-tune function
payload = {
  "dataset_type": 'MODEL', 
  "title": '', # e.g 'what!'
  "category": 'AI', # e.g 'come here'
  "details": '', 
  "tags": ['AI'], 
  "user_id": '', 
  "fine_tune_payload": {
    "asset_id": '', # raw containing dataset
    "model_name": 'we make things happen', #  This is same as the title 'what!'
    "base_model": '', # LLama3 model that was purchased 
    "file_name": '', # e.g 'catch'
    "user_id": '', # The same as your user id, input it again. e.g '231243124466184567909'
    "epochs": 3,
    "learning_rate": 0.01 
  }
}

response = client.fine_tune(payload, apiKey)
print(response)
```

Fine-tunes a model using a specific Asset and provided parameters.

`Note`: Epochs & learning rate are optional. By default, epochs = 3 & learning rate = 0.001. Users can change it according to their requirements. 

## Get all assets

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

user_Id = ""

response = client.get_all_asset(user_Id, api_key)
print(response)
```

Retrieves all assets for a specific user.

## Get assets by Id

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = ""

response = client.get_asset_by_id(asset_id, api_key)
print(response)
```

Retrieves a specific asset by its ID.

## Get finetuned model

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = ""
file_name = "train.txt"

# Call the function
response = client.download_file_by_asset_and_name(asset_id, file_name)
print(response)
```

Downloads a fine-tuned model by asset ID and file name.

## Get job by job id

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

job_id = ""  # Replace with the actual job ID

response = client.get_job(job_id, api_key)
print(response)
```

Retrieves the status of a specific job by job ID.

## Get job

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

job_id = ""  # Replace with the actual job ID

response = client.get_job(job_id, api_key)
print(response)
```

Retrieves details of a job.

## List Job

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

user_id = ""

# Call the function
response = client.list_jobs(user_id, api_key)
print(response)
```

Lists all jobs for a specific user.

## Add data to asset

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

payload = {
  "metadatas": [{ "source": "testing" }],
  "documents": ["Hi man"],
  "ids": ["xxxx-xxxx-xxxx-xxxx--xxxxx"], #manually generated by you
}

response = client.add_data_to_asset(asset_id, payload, api_key)
print(response)
```

Adds data to an existing asset.

## Download Finetuned Model 

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = "insert asset id"

response = client.download_model(asset_id, api_key)
print(response)
```

## Buy Asset 

```python
import os
import bagel
from getpass import getpass

# Create the asset using the API key from environment variables
client = bagel.Client()

# Copy & Paste the API Key from https://bakery.bagel.net/api-key
DEMO_KEY_IN_USE = getpass("Enter your API key: ")

# Set environment variable
api_key = os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE

asset_id = "insert asset id"
user_id = "insert userid"

response = client.buy_asset(asset_id, user_id, api_key)     
print(response) 
```

