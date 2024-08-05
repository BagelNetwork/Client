# Bagel Python Client 🥯

Welcome to the Bagel Python Client! Bagel is your platform for peer-to-peer machine learning, finetuning open-source models like Llama or Mistral, and using retrieval augmented generation (RAG).

One of the perks? **No need to manage complex embeddings or model integrations yourself!** The Bagel client handles these processes, saving you time and money. 🥯

## Prerequisites

- Python 3.6+
- pip package manager
- Asset size limit 500MB (\*Create a new issue if you want to increase the limit)

## Installation

To install the Bagel Python client, run the following command in your terminal:

```shell
pip install bagelML
```

## 1. **Import the necessary modules:**

```python
import bagel
from bagel.config import Settings
```

This snippet imports the required modules for using Bagel, including the uuid module for generating unique identifiers.

## 2. **Define the Bagel server settings:**

```python
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)
```

Here, we define the settings for connecting to the Bagel server.

## 3. **Create the Bagel client:**

```python
client = bagel.Client(server_settings)
```

Create an instance of the Bagel client using the previously defined server settings.

## 4. **Ping the Bagel server:**

```python
print(client.ping())
```

This checks the connectivity to the Bagel server.

## 5. **Get the Bagel server version:**

```python
print(client.get_version())
```

Retrieves and prints the version of the Bagel server.

## 6. **Create an Asset:**

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

This demonstrates basic Asset management.

## 7. **Delete an Asset:**

This method deletes a specific Asset.

```python
api_key = 'insert api key'
dataset_id = 'insert dataset/asset id'
client.delete_asset(dataset_id, api_key)
```

## 8. **Download Model Files:**

```python
api_key = 'insert api key'
asset_id = 'insert dataset/asset id'
file_name = "insert file .txt"

client.download_file(asset_id, file_name, api_key)
```

## 9. **Query Asset**

```python
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"
asset_id = "6ac15129-b51c-4242-8950-42cf49051a6f"

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

## 10. **Update Asset**

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

## 11. **Download file**

```python
api_key = ""
asset_id = ""
file_name = ""

client.download_file(asset_id, file_name, api_key)
```

## 12. **File Upload**

```python

api_key = ""
dataset_id = ""
file_path = ""

client.file_upload(file_path, dataset_id, api_key)
```

## **Fine-tune**

```python
# Define the URL for the fine-tune function
apiKey = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"
# Define the payload for the fine-tune function
payload = {
  "dataset_type": 'RAW',
  "title": 'what!',
  "category": 'come here',
  "details": '',
  "tags": [],
  "user_id": '101481188466180740994',
  "fine_tune_payload": {
    "asset_id": 'eae3d73b-7ff4-4a71-b0fd-afe15893fdf0', # Move asset_id here
    "model_name": 'what!', # Same as the title
    "base_model": '3ba323f-9132-4f92-92eb-d0d678fa3ec7',
    "file_name": 'catch.txt',
    "user_id": '101481188466180740994',
  }
}

client.fine_tune(payload, apiKey)
```

## Get all assets

```python
user_Id = ""
api_key = ""

client.get_all_asset(user_Id, api_key)
```

## Get all assets by Id

```python

asset_id = "eae3d73b-7ff4-4a71-b0fd-afe15893fdf0"
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"

client.get_asset_by_id(asset_id, api_key)
```

## Get finetuned model

```python
# Replace these values with actual ones
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"
asset_id = "e968a4a7-ef0a-4b21-93c2-bc5d9448a0a8"
file_name = "train.txt"

# Call the function
client.download_file_by_asset_and_name(asset_id, file_name)
```

## Get job by job id

```python
job_id = "8566657552882860032"  # Replace with the actual job ID
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"  # Replace with the actual API key

client.get_job(job_id, api_key)
```

## Get job

```python
job_id = "8566657552882860032"  # Replace with the actual job ID
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"  # Replace with the actual API key

client.get_job(job_id, api_key)
```

## List Job

```python
# Replace "your_api_key_here" with the provided API key
api_key = ""
user_id = ""

# Call the function
client.list_jobs(user_id, api_key)
```

## Update Asset

```python

api_key = ""
asset_id = ""

# Payload for updating the asset
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
