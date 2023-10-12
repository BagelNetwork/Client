# BagelDB Python Client 🥯

Welcome to the BagelDB Python Client Example! BagelDB is your bread-and-butter library for interacting with the BagelDB API without breaking a sweat. 

One of the perks? **No need to call the OpenAI Embeddings method or any other model to generate embeddings!** That's right, the BagelDB client handles that for you. So, you don't need to spend extra bucks on generating embeddings. Quite a dough-saver, isn't it? 🥯💰

## Prerequisites

- Python 3.6+
- pip package manager
- Cluster size limit 500MB (*Create a new issue if you want to increase the limit)

## Installation

To install the BagelDB Python client, run the following command in your terminal:

```shell
pip install betabageldb
```

## Usage

1. **Import the necessary modules:**

```python
import uuid
import bagel
from bagel.config import Settings
```

This snippet imports the required modules for using BagelDB, including the uuid module for generating unique identifiers.

2. **Define the BagelDB server settings:**

```python
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)
```
Here, we define the settings for connecting to the BagelDB server.

3. **Create the BagelDB client:**

```python
client = bagel.Client(server_settings)
```

Create an instance of the BagelDB client using the previously defined server settings.

4. **Ping the BagelDB server:**

```python
print(client.ping())
```

This checks the connectivity to the BagelDB server.

5. **Get the BagelDB server version:**

```python
print(client.get_version())
```

Retrieves and prints the version of the BagelDB server.

6. **Create and delete a cluster:**

```python
name = str(uuid.uuid4())
client.create_cluster(name)
client.delete_cluster(name)
```
Generates a unique name for a cluster, creates it, and then deletes it. This demonstrates basic cluster management.


7. **Create, add documents, and query a cluster:**

```python
cluster = client.get_or_create_cluster("testing")

cluster.add(
    documents=["This is doc", "This is gooogle doc"],
    metadatas=[{"source": "notion"},
               {"source": "google-doc"}],
    ids=[str(uuid.uuid4()), str(uuid.uuid4())],
)

results = cluster.find(query_texts=["query"], n_results=5)
```

Creates a cluster or retrieves an existing one, adds documents with metadata. Here `ids` are unique identifiers for each documents. BagelDB generates embeddings using its model. And performs a text-based query/search. Here `n_results` is to limit number of results.


8. **Add embeddings and query (without needing to generate embeddings yourself!):**

```python
cluster = client.get_or_create_cluster("new_testing")

cluster.add(embeddings=[[1.1, 2.3], [4.5, 6.9]],
            metadatas=[{"info": "M1"}, {"info": "M1"}],
            documents=["doc1", "doc2"],
            ids=["id1", "id2"])

results = cluster.find(query_embeddings=[[1.1, 2.3]], n_results=2)
```

This is similar to the previous example but uses pre-calculated embeddings for documents and performs a query based on those embeddings.

9. **Modify cluster name:**

```python
cluster.modify(name="new_name")
```

Changes the name of the cluster.

10. **Update document metadata:**

```python
cluster.update(ids=["id1"], metadatas=[{"new":"metadata"}])
```

Updates the metadata of a specific document in the cluster.

11. **Upsert documents:**

```python
cluster.upsert(documents=["new doc"],
               metadatas=[{"new": "metadata"}],
               ids=["doc1"])
```

Inserts or updates documents in the cluster based on provided IDs.

12. **Get cluster size:**
```python
cluster = client.get_or_create_cluster("new_testing")
print(f"cluster size {cluster.cluster_size} mb")
```
Get the size of the cluster in megabytes. For each cluster max size is 500MB.

13. **Add image:**

In BagelDB we can add image also. Here is an example of adding image to cluster. It supports almost every image format.

```python
filename = "your_img.png"
resp = cluster.add_image(filename)
```
14. **Add image by image download URLs:**

Multiple images can be added to a BagelDB cluster using URLs. It's recommended to add fewer than 20 images at a time using this function. Upon execution, the function will return the URLs of successfully added images and those that failed. Here's an example:

```python
cluster = api.get_or_create_cluster("new_testing")
urls = [
    "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/cat/60de145c79609acaba3bbe08974a9ff5.jpg",
    "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/cat/black-white-cat-wallpaper.jpg",
]
ids = [str(uuid.uuid4()) for i in range(len(urls))]
resp = cluster.add_image_urls(ids=ids, urls=urls)
```
## Tutorials

Explore additional tutorials for more insights.

- [Python Client Example](https://colab.research.google.com/drive/1PXRoP4vIsqQqsD9AGUrQ90D3x0x79F_w)
- [Using BagelDB with Llama Index](https://colab.research.google.com/drive/13F3PxNgF10ZGlpZS20hQtwwkd8BiMcTS)
- [Using BagelDB with Langchain](https://colab.research.google.com/drive/1UBWkuihFHvxbzeP61HT1-ttTsURcEXIS?usp=sharing)
- [Build an image search engine in 10 minutes using BagelDB](https://colab.research.google.com/drive/1J_QlpqvnVloWHg_Q87s-hbp_VGq4wLQz)

<br>

Need more dough-tails? See the [example code](example.py) for a more comprehensive guide on using the BagelDB Python client.

Happy coding and enjoy your fresh Bagels! 🥯👩‍💻👨‍💻
