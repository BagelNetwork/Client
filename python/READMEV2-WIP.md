# Bagel Python Client 🥯

Welcome to the Bagel Python Client! Bagel is your platform for peer-to-peer machine learning, finetuning open-source models like Llama or Mistral, and using retrieval augmented generation (RAG).

One of the perks? **No need to manage complex embeddings or model integrations yourself!** The Bagel client handles these processes, saving you time and money. 🥯💰

## Prerequisites

- Python 3.6+
- pip package manager
- Asset size limit 500MB (*Create a new issue if you want to increase the limit)

## Installation

To install the Bagel Python client, run the following command in your terminal:

```shell
pip install bagelML
```

## Usage

1. **Import the necessary modules:**

```python
import bagel
from bagel.config import Settings
```

This snippet imports the required modules for using Bagel, including the uuid module for generating unique identifiers.

2. **Define the Bagel server settings:**

```python
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)
```
Here, we define the settings for connecting to the Bagel server.

3. **Create the Bagel client:**

```python
client = bagel.Client(server_settings)
```

Create an instance of the Bagel client using the previously defined server settings.

4. **Ping the Bagel server:**

```python
print(client.ping())
```

This checks the connectivity to the Bagel server.

5. **Get the Bagel server version:**

```python
print(client.get_version())
```

Retrieves and prints the version of the Bagel server.

6. **Create an Asset:**

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

7. **Delete an Asset:**

This method deletes a specific Asset.

```python
api_key = 'insert api key'
dataset_id = 'insert dataset/asset id'
client.delete_asset(dataset_id, api_key)
```

8. **Download Model Files:**


```python
api_key = 'insert api key'
asset_id = 'insert dataset/asset id'
file_name = "insert file .txt"

client.download_file(asset_id, file_name, api_key)
```

