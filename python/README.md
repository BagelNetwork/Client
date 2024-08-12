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
import bagel
from bagel.config import Settings
```

This snippet imports the required modules for using Bagel.

## Define the Bagel server settings

```python
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)
```
Here, we define the settings for connecting to the Bagel server.

## Create the Bagel client

```python
client = bagel.Client(server_settings)
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
api_key = 'insert api key'
payload = {
    "dataset_type": "RAW",
    "title": "",
    "category": "",
    "details": "Testing",
    "tags": ["AI", "DEMO", "TEST"],
    "user_id": 'insert user id'
}

client.create_asset(payload, api_key)
```

## Delete an Asset

```python
api_key = 'insert api key'
dataset_id = 'insert dataset/asset id'
client.delete_asset(dataset_id, api_key)
```

This method deletes a specific Asset.

## Download Model Files

```python
api_key = 'insert api key'
asset_id = 'insert dataset/asset id'
file_name = "insert file .txt"

client.download_file(asset_id, file_name, api_key)
```

Downloads a file associated with a specific Asset.

## Query Asset

```python
api_key = ""
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

client.query_asset(asset_id, payload, api_key)
```

Queries a specific Asset with detailed parameters.

## Update Asset

```python
import bagel
from bagel.config import Settings

api_key = ""
asset_id = ""

payload = {
   "title": "Updated dataset title",
    "category": "Updated category",
    "details": "Updated dataset description.",
    "tags": ["Updated", "Tags"]
}

server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai",
    bagel_server_http_port="80",
)
client = bagel.Client(server_settings)

client.update_asset(asset_id, payload, api_key)
```

Updates the details of an existing Asset.

## Download file

```python
api_key = ""
asset_id = ""
file_name = ""

client.download_file(asset_id, file_name, api_key)
```

Downloads a specific file from an Asset.

## File Upload

```python
api_key = ""
dataset_id = ""
file_path = ""

client.file_upload(file_path, dataset_id, api_key)
```

Uploads a file to a specific Asset.

## Fine-tune

```python
# Define the URL for the fine-tune function
apiKey = ""
# Define the payload for the fine-tune function
payload = {
  "dataset_type": 'RAW',
  "title": 'what!',
  "category": '',
  "details": '',
  "tags": [],
  "user_id": '',
  "fine_tune_payload": {
    "asset_id": '', # Move asset_id here
    "model_name": '', # Same as the title
    "base_model": '',
    "file_name": 'catch.txt',
    "user_id": '',
  }
}

client.fine_tune(payload, apiKey)
```

Fine-tunes a model using a specific Asset and provided parameters.

## Get all assets

```python
user_Id = ""
api_key = ""

client.get_all_asset(user_Id, api_key)
```

Retrieves all assets for a specific user.

## Get all assets by Id

```python
asset_id = ""
api_key = ""

client.get_asset_by_id(asset_id, api_key)
```

Retrieves a specific asset by its ID.

## Get finetuned model

```python
# Replace these values with actual ones
api_key = ""
asset_id = ""
file_name = "train.txt"

# Call the function
client.download_file_by_asset_and_name(asset_id, file_name)
```

Downloads a fine-tuned model by asset ID and file name.

## Get job by job id

```python
job_id = ""  # Replace with the actual job ID
api_key = ""  # Replace with the actual API key

client.get_job(job_id, api_key)
```

Retrieves the status of a specific job by job ID.

## Get job

```python
job_id = ""  # Replace with the actual job ID
api_key = ""  # Replace with the actual API key

client.get_job(job_id, api_key)
```

Retrieves details of a job.

## List Job

```python
# Replace "your_api_key_here" with the provided API key
api_key = ""
user_id = ""

# Call the function
client.list_jobs(user_id, api_key)
```

Lists all jobs for a specific user.

## Add data to asset

```python
asset_id = ""
api_key = ""

payload = {
  "metadatas": [{ "source": "testing" }],
  "documents": ["Hi man"],
  "ids": ["xxxx-xxxx-xxxx-xxxx--xxxxx"], #manually generated by you
}

client.add_data_to_asset(asset_id, payload, api_key)
```

Adds data to an existing asset.
