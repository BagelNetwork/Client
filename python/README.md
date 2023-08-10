# BagelDB Python Client 🥯

Welcome to the BagelDB Python Client Example! BagelDB is your bread-and-butter library for interacting with the BagelDB API without breaking a sweat. 

One of the perks? **No need to call the OpenAI Embeddings method or any other model to generate embeddings!** That's right, the BagelDB client handles that for you. So, you don't need to spend extra bucks on generating embeddings. Quite a dough-saver, isn't it? 🥯💰

## Prerequisites

- Python 3.6+
- pip package manager
- BagelDB account and API key

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

2. **Define the BagelDB server settings:**

```python
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)
```

3. **Create the BagelDB client:**

```python
client = bagel.Client(server_settings)
```

4. **Ping the BagelDB server:**

```python
print(client.ping())
```

5. **Get the BagelDB server version:**

```python
print(client.get_version())
```

6. **Create and delete a cluster:**

```python
name = str(uuid.uuid4())
client.create_cluster(name)
client.delete_cluster(name)
```

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

8. **Add embeddings and query (without needing to generate embeddings yourself!):**

```python
cluster = client.get_or_create_cluster("new_testing")

cluster.add(embeddings=[[1.1, 2.3], [4.5, 6.9]],
            metadatas=[{"info": "M1"}, {"info": "M1"}],
            documents=["doc1", "doc2"],
            ids=["id1", "id2"])

results = cluster.find(query_embeddings=[[1.1, 2.3]], n_results=2)
```

9. **Modify cluster name:**

```python
cluster.modify(name="new_name")
```

10. **Update document metadata:**

```python
cluster.update(ids=["id1"], metadatas=[{"new":"metadata"}])
```

11. **Upsert documents:**

```python
cluster.upsert(documents=["new doc"],
               metadatas=[{"new": "metadata"}],
               ids=["doc1"])
```

Need more dough-tails? See the [example code](example.py) for a more comprehensive guide on using the BagelDB Python client.

Happy coding and enjoy your fresh Bagels! 🥯👩‍💻👨‍💻
