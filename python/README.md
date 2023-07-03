## BagelDB Python Client - Step by Step Guide

Before you start, make sure you've installed the BagelDB Python client package through pip:

```shell
pip install betabageldb
```

Now, let's dive into how to use the BagelDB Python client:

1. **Import the `BagelDB` client**

   First, you need to import the `BagelDB` class from the installed package in your Python script.

   ```python
   from betabageldb import BagelDB
   ```

2. **Initialize the BagelDB client**

   Create a new instance of the `BagelDB` client. During initialization, you should specify the index that you want to use for your operations. This index is immutable and will be used for all subsequent insertions and searches.

   ```python
   index = "myIndex"
   db = BagelDB(index)
   ```

3. **Check Server Connection**

   Use the `ping()` method to test your connection to the BagelDB server. It sends a GET request to the BagelDB API and returns a response in JSON format.

   ```python
   response = db.ping()
   print(response)
   ```

4. **Generate OpenAI Embeddings**

   Use the `getOpenAIEmbedding(inputText, model='text-embedding-ada-002')` method to generate embeddings from OpenAI. The `inputText` parameter should be the text for which embeddings are required. The `model` parameter is optional and defaults to 'text-embedding-ada-002'.

   ```python
   input_text = "Some text"
   embeddings = db.getOpenAIEmbedding(input_text)
   print(embeddings)
   ```

5. **Insert Vectors into BagelDB**

   Use the `insert(vectors)` method to insert vectors into BagelDB. `vectors` should be a list of vectors you want to insert. The index you specified during the initialization of the BagelDB client is used automatically.

   ```python
   vectors = [{'id': 'vec1', 'values': [0.1, 0.2, 0.3], 'metadata': {'key': 'value'}}]
   insert_response = db.insert(vectors)
   print(insert_response)
   ```

6. **Search for a Vector in BagelDB**

   Use the `search(vector)` method to search for a vector in BagelDB. `vector` should be the vector for which you want to perform the search.

   ```python
   vector = [0.1, 0.2, 0.3]
   search_response = db.search(vector)
   print(search_response)
   ```

7. **Insert Vectors from Texts**

   The `insertFromTexts(texts, model='text-embedding-ada-002')` method allows you to convert a list of texts to embeddings and insert them into BagelDB. `texts` should be a list of strings to be converted and inserted. The `model` parameter is optional and defaults to 'text-embedding-ada-002'.

   ```python
   texts = ["Some text 1", "Some text 2"]
   insert_response = db.insertFromTexts(texts)
   print(insert_response)
   ```

8. **Search for a Vector from Text**

   Use the `searchFromText(text, model='text-embedding-ada-002')` method to convert a given text to a vector and perform a search in BagelDB. `text` should be the string to be converted and

 searched. The `model` parameter is optional and defaults to 'text-embedding-ada-002'.

   ```python
   text = "Some text"
   search_response = db.searchFromText(text)
   print(search_response)
   ```

Always ensure you handle exceptions appropriately in your application. Methods in the `BagelDB` client may raise exceptions if a network error occurs or if the server's response indicates a failed HTTP status code.
