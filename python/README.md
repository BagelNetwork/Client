# BagelDB Python Client Example

This README provides steps on how to use the BagelDB python client example code.

## Prerequisites

- Python 3.6+
- pip package manager
- BagelDB account and API key

## Installation

Install the BagelDB python client:

```
pip install bagel
```

## Usage

1. Import the necessary modules:

```python
import uuid
import bagel
from bagel.config import Settings
```

2. Define the BagelDB server settings:

```python 
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api2.bageldb.ai",
    bagel_server_http_port="8000"
)
```

3. Create the BagelDB client:

```python
client = bagel.Client(server_settings)
```

4. Ping the BagelDB server:

```python
print(client.ping())
```

5. Get the BagelDB server version:

```python
print(client.get_version()) 
```

6. Create and delete a cluster:

```python
name = str(uuid.uuid4())
client.create_cluster(name)
client.delete_cluster(name)
```

7. Create, add documents, and query a cluster:

```python
cluster = client.get_or_create_cluster("testing")

cluster.add(documents=["doc1", "doc2"]) 

results = cluster.find(query_texts=["query"], n_results=5)
```

8. Add embeddings and query:

```python
cluster.add(embeddings=[[1.1, 2.3], [4.5, 6.9]])

results = cluster.find(query_embeddings=[[1.1, 2.3]], n_results=2) 
```

9. Modify cluster name:

```python 
cluster.modify(name="new_name")
```

10. Update document metadata:

```python
cluster.update(ids=["doc1"], metadatas=[{"new":"metadata"}])
```

11. Upsert documents:

```python
cluster.upsert(documents=["new doc"], ids=["doc1"])
```

See the [example code](paste.txt) for more details on using the BagelDB python client.